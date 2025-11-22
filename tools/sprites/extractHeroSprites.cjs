const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Extract individual hero sprites from sprite sheets
 * Saves full sprite (with rotation applied) as webp
 */

async function extractHeroSprites() {
  console.log('🎨 Extracting individual hero sprites...\n');

  // Load sprite map
  const spriteMapPath = path.join(__dirname, '../../public/spriteMap.json');
  const spriteMap = JSON.parse(fs.readFileSync(spriteMapPath, 'utf8'));

  // Load heroes.json for English names
  const heroesPath = path.join(__dirname, '../../data/extracted/hero.json');
  const heroes = JSON.parse(fs.readFileSync(heroesPath, 'utf8'));

  // Create output directory
  const outputDir = path.join(__dirname, '../../public/images/heroes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Output directory: ${outputDir}\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process each hero
  for (const hero of heroes) {
    try {
      const chineseName = hero.names?.zh || hero.name;
      const englishName = hero.names?.en || hero.fullName || chineseName;
      const spriteInfo = spriteMap[chineseName];

      if (!spriteInfo) {
        console.log(`⚠️  No sprite info for: ${chineseName} (${englishName})`);
        errorCount++;
        continue;
      }

      const { sheet, x, y, width, height, rotated } = spriteInfo;

      // Input sprite sheet path
      const sheetPath = path.join(__dirname, `../../package/images/角色形象-sheet${sheet}.webp`);
      
      if (!fs.existsSync(sheetPath)) {
        console.log(`⚠️  Sheet not found: sheet${sheet}.webp for ${englishName}`);
        errorCount++;
        continue;
      }

      // Extract FULL sprite (no cropping)
      let extractedBuffer;
      
      if (rotated) {
        // For rotated sprites: extract and rotate back to upright
        extractedBuffer = await sharp(sheetPath)
          .extract({
            left: Math.round(x),
            top: Math.round(y),
            width: Math.round(height), // swapped because rotated in sheet
            height: Math.round(width)
          })
          .rotate(-90) // Rotate back to normal orientation
          .webp({ quality: 90 })
          .toBuffer();
      } else {
        // For normal sprites: extract directly
        extractedBuffer = await sharp(sheetPath)
          .extract({
            left: Math.round(x),
            top: Math.round(y),
            width: Math.round(width),
            height: Math.round(height)
          })
          .webp({ quality: 90 })
          .toBuffer();
      }

      // Save with English name (sanitized for filename)
      const sanitizedName = englishName
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toLowerCase();
      
      const outputPath = path.join(outputDir, `${hero.id}_${sanitizedName}.webp`);
      fs.writeFileSync(outputPath, extractedBuffer);

      successCount++;
      if (successCount % 10 === 0) {
        console.log(`✅ Processed ${successCount} heroes...`);
      }

    } catch (error) {
      console.log(`❌ Error processing ${hero.name}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n✨ Complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Output: ${outputDir}`);
}

// Run extraction
extractHeroSprites().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
