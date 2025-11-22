const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Extract hero face icons using face anchor data
 * 
 * IMPROVEMENTS:
 * 1. Uses hero-face-anchors.json (more accurate face positioning)
 * 2. Proper file naming with hero.id (consistent with app)
 * 3. Better face cropping using anchor points
 * 4. Generates mapping file automatically
 */

async function extractHeroIcons() {
  console.log('🎨 Extracting Hero Face Icons (Improved Version)\n');

  // Load heroes.json which now contains sprite data
  const heroesPath = path.join(__dirname, '../../data/extracted/hero.json');
  const heroes = JSON.parse(fs.readFileSync(heroesPath, 'utf8'));

  // Create output directory
  const outputDir = path.join(__dirname, '../../public/images/heroes_icon');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📁 Output directory: ${outputDir}\n`);

  let successCount = 0;
  let errorCount = 0;
  const mapping = {};

  // Process each hero
  for (const hero of heroes) {
    try {
      // Use sprite data directly from hero.json
      if (!hero.sprite || hero.sprite.sheet === null || hero.sprite.sheet === undefined) {
        console.log(`⚠️  No sprite data for Hero ID ${hero.id}: ${hero.nameCN}`);
        errorCount++;
        continue;
      }

      const heroSprite = hero.sprite;

      // Input sprite sheet path (from public directory - copied there by copy-sprites)
      const sheetPath = path.join(__dirname, `../../public/images/heroes/hero-sprites-sheet${heroSprite.sheet}.webp`);

      if (!fs.existsSync(sheetPath)) {
        console.log(`⚠️  Sheet not found: sheet${heroSprite.sheet}.webp for ${hero.nameCN}`);
        errorCount++;
        continue;
      }

      // Calculate face crop region
      // Use face anchor point to extract upper body / face area
      const faceCenterX = heroSprite.faceCenter ? heroSprite.faceCenter.x : 0.5;
      const faceCenterY = heroSprite.faceCenter ? heroSprite.faceCenter.y : 0.35;
      const isRotated = heroSprite.rotated || false;

      let iconBuffer;

      if (isRotated) {
        // For rotated sprites: the sprite is stored rotated 90° clockwise in the sheet
        // width and height in data refer to ORIGINAL dimensions (before rotation)
        // In sheet: original height becomes width, original width becomes height

        // Step 1: Extract the full rotated sprite from sheet
        const fullSprite = await sharp(sheetPath)
          .extract({
            left: heroSprite.x,
            top: heroSprite.y,
            width: heroSprite.height,  // In sheet, height is horizontal
            height: heroSprite.width   // In sheet, width is vertical
          })
          .rotate(-90)  // Rotate back to normal orientation
          .toBuffer();

        // Step 2: Now crop the face area from the corrected sprite
        const cropWidth = Math.round(heroSprite.width * 0.6);
        const cropHeight = Math.round(heroSprite.height * 0.5);

        const cropX = Math.max(0, Math.min(
          Math.round(faceCenterX * heroSprite.width) - Math.round(cropWidth / 2),
          heroSprite.width - cropWidth
        ));

        const cropY = Math.max(0, Math.min(
          Math.round(faceCenterY * heroSprite.height) - Math.round(cropHeight / 2),
          heroSprite.height - cropHeight
        ));

        // Step 3: Crop and resize the corrected sprite
        iconBuffer = await sharp(fullSprite)
          .extract({
            left: cropX,
            top: cropY,
            width: cropWidth,
            height: cropHeight
          })
          .resize(128, 128, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 90 })
          .toBuffer();
      } else {
        // Normal (non-rotated) sprite
        const cropWidth = Math.round(heroSprite.width * 0.6);
        const cropHeight = Math.round(heroSprite.height * 0.5);

        const cropX = Math.max(0, Math.min(
          heroSprite.x + Math.round(faceCenterX * heroSprite.width) - Math.round(cropWidth / 2),
          heroSprite.x + heroSprite.width - cropWidth
        ));

        const cropY = Math.max(0, Math.min(
          heroSprite.y + Math.round(faceCenterY * heroSprite.height) - Math.round(cropHeight / 2),
          heroSprite.y + heroSprite.height - cropHeight
        ));

        iconBuffer = await sharp(sheetPath)
          .extract({
            left: cropX,
            top: cropY,
            width: cropWidth,
            height: cropHeight
          })
          .resize(128, 128, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 90 })
          .toBuffer();
      }

      // Generate filename using only hero.id
      const filename = `${hero.id}.webp`;
      const outputPath = path.join(outputDir, filename);

      fs.writeFileSync(outputPath, iconBuffer);

      // Store mapping
      mapping[hero.id] = filename;

      successCount++;
      if (successCount % 10 === 0) {
        console.log(`✅ Processed ${successCount} heroes...`);
      }

    } catch (error) {
      console.log(`❌ Error processing ${hero.nameCN}: ${error.message}`);
      errorCount++;
    }
  }

  // Save mapping file
  const mappingPath = path.join(outputDir, 'hero-icon-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify({
    _metadata: {
      generatedAt: new Date().toISOString(),
      totalHeroes: heroes.length,
      matchedHeroes: successCount,
      extractionMethod: 'face-anchor-based',
      description: 'Mapping between hero.id and icon filenames'
    },
    mapping
  }, null, 2));

  console.log(`\n✨ Extraction Complete!`);
  console.log(`   ✅ Success: ${successCount} heroes`);
  console.log(`   ❌ Errors: ${errorCount} heroes`);
  console.log(`   📁 Icons: ${outputDir}`);
  console.log(`   📋 Mapping: ${mappingPath}`);
  console.log(`\n💡 File naming: {hero.id}.webp`);
}

// Run extraction
extractHeroIcons().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});


