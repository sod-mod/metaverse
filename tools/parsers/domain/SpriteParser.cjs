/**
 * Sprite Parser
 * Generates sprite mapping with face anchors from hero data
 * Based on FACE_ANCHOR_ANALYSIS_REPORT.md
 * Also handles hero icon generation from sprite sheets
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class SpriteParser {
  constructor(options = {}) {
    this.options = {
      spriteSize: { width: 256, height: 256 },
      faceAnchor: {
        offsetX: 128,  // 50% - horizontal center
        offsetY: 90    // 35% - eye level (standard portrait)
      },
      ...options
    };
  }

  /**
   * Parse heroes and generate sprite mapping with face anchors
   * @param {Array} heroes - Array of hero objects from HeroParser
   * @returns {Object} Sprite mapping with metadata
   */
  generateSpriteMapping(heroes) {
    const mapping = {
      _metadata: {
        totalHeroes: heroes.length,
        heroesWithSprites: 0,
        spriteSize: this.options.spriteSize,
        faceAnchor: {
          description: "Face center point (eye level) - offset from sprite origin",
          offsetX: this.options.faceAnchor.offsetX,
          offsetY: this.options.faceAnchor.offsetY,
          method: "pattern analysis + standard portrait composition"
        },
        note: "Sprite coordinates not available from game data. Using hero.id for compatibility.",
        generatedAt: new Date().toISOString()
      },
      heroes: {}
    };

    heroes.forEach(hero => {
      // Check if hero has sprite data (from old format compatibility)
      if (hero.sprite && hero.sprite.sheet !== undefined) {
        this.addSpriteEntry(mapping, hero, hero.sprite);
        mapping._metadata.heroesWithSprites++;
      } else {
        // Generate placeholder entry using hero.id
        // This maintains compatibility with existing icon/sprite files
        this.addPlaceholderEntry(mapping, hero);
        mapping._metadata.heroesWithSprites++;
      }
    });

    return mapping;
  }

  /**
   * Add sprite entry with face anchor
   */
  addSpriteEntry(mapping, hero, sprite) {
    const relativeX = this.options.faceAnchor.offsetX;
    const relativeY = this.options.faceAnchor.offsetY;

    mapping.heroes[hero.id] = {
      id: hero.id,
      spriteId: hero.spriteId,
      name: hero.nameCN,
      nameEN: hero.nameEN || hero.displayName,
      nameKO: hero.nameKO || hero.displayName,
      
      // Sprite sheet information
      sheet: sprite.sheet,
      x: sprite.x,
      y: sprite.y,
      frame: sprite.frame,
      
      // CSS helpers
      cssBackgroundPosition: `-${sprite.x}px -${sprite.y}px`,
      cssTransform: `translate(-${sprite.x}px, -${sprite.y}px)`,
      
      // Face anchor points
      faceAnchor: {
        relativeX: relativeX,
        relativeY: relativeY,
        absoluteX: sprite.x + relativeX,
        absoluteY: sprite.y + relativeY,
        
        // For centered display
        centerTransform: `translate(-${sprite.x + relativeX}px, -${sprite.y + relativeY}px)`
      },
      
      // Sprite dimensions
      spriteWidth: this.options.spriteSize.width,
      spriteHeight: this.options.spriteSize.height
    };
  }

  /**
   * Add placeholder entry for heroes without sprite data
   * Uses hero.id for compatibility with existing icon files
   */
  addPlaceholderEntry(mapping, hero) {
    const relativeX = this.options.faceAnchor.offsetX;
    const relativeY = this.options.faceAnchor.offsetY;

    mapping.heroes[hero.id] = {
      id: hero.id,
      spriteId: hero.spriteId,
      name: hero.nameCN,
      nameEN: hero.nameEN || hero.displayName,
      nameKO: hero.nameKO || hero.displayName,
      
      // Placeholder: sprite coordinates not available
      sheet: null,
      x: null,
      y: null,
      
      // Face anchor points (relative only)
      faceAnchor: {
        relativeX: relativeX,
        relativeY: relativeY,
        note: "Sprite coordinates not available from game data"
      },
      
      // Sprite dimensions
      spriteWidth: this.options.spriteSize.width,
      spriteHeight: this.options.spriteSize.height
    };
  }

  /**
   * Generate icon mapping from hero data
   * Maps hero.id to icon filename by matching hero names
   */
  generateIconMapping(heroes, iconDirectory) {
    const mapping = {
      _metadata: {
        generatedAt: new Date().toISOString(),
        totalHeroes: heroes.length,
        matchedHeroes: 0,
        note: "Generated from hero.json - maps hero.id to icon filename"
      },
      mapping: {}
    };

    // Get list of icon files if directory exists
    let iconFiles = [];
    if (fs.existsSync(iconDirectory)) {
      iconFiles = fs.readdirSync(iconDirectory).filter(f => f.endsWith('.webp'));
    }

    heroes.forEach(hero => {
      // Try multiple matching strategies
      let matchedFile = null;
      
      // Strategy 1: Match by file prefix (old hero ID from icon filename)
      const filePrefix = iconFiles.find(f => {
        const prefix = f.split('_')[0];
        return prefix === String(hero.id) || prefix === String(hero.spriteId);
      });
      
      if (filePrefix) {
        matchedFile = filePrefix;
      }
      
      // Strategy 2: Match by sanitized English name in filename
      if (!matchedFile && hero.nameEN) {
        const sanitizedEN = hero.nameEN
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_');
        
        matchedFile = iconFiles.find(f => {
          const namePart = f.split('_').slice(1).join('_').replace('.webp', '');
          return namePart === sanitizedEN;
        });
      }
      
      // Strategy 3: Match by Chinese name (for files that might use pinyin)
      if (!matchedFile) {
        // Try to find by partial name match
        const cnLower = hero.nameCN.toLowerCase();
        const displayLower = hero.displayName.toLowerCase();
        
        matchedFile = iconFiles.find(f => {
          const fLower = f.toLowerCase();
          return fLower.includes(cnLower) || fLower.includes(displayLower);
        });
      }

      if (matchedFile) {
        mapping.mapping[hero.id] = matchedFile;
        mapping._metadata.matchedHeroes++;
      }
    });

    return mapping;
  }

  /**
   * Export sprite mapping to file
   */
  exportSpriteMapping(heroes, outputPath) {
    const mapping = this.generateSpriteMapping(heroes);
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
    
    return {
      success: true,
      path: outputPath,
      heroesWithSprites: mapping._metadata.heroesWithSprites,
      totalHeroes: mapping._metadata.totalHeroes
    };
  }

  /**
   * Export icon mapping to file
   */
  exportIconMapping(heroes, iconDirectory, outputPath) {
    const mapping = this.generateIconMapping(heroes, iconDirectory);
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
    
    return {
      success: true,
      path: outputPath,
      matchedHeroes: mapping._metadata.matchedHeroes,
      totalHeroes: mapping._metadata.totalHeroes
    };
  }

  /**
   * Extract individual hero sprites from sprite sheets
   * Saves full sprite images with face center data embedded
   */
  async extractHeroSprites(heroes, spriteSheetDir, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎨 Extracting hero sprites from sprite sheets...');
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const hero of heroes) {
      try {
        // Skip heroes without sprite data
        if (!hero.sprite || hero.sprite.sheet === null || hero.sprite.sheet === undefined) {
          console.log(`⚠️  No sprite data for hero ID ${hero.id}: ${hero.nameCN}`);
          errors.push({ hero: hero.id, reason: 'No sprite data' });
          errorCount++;
          continue;
        }

        const sprite = hero.sprite;
        const sheetPath = path.join(spriteSheetDir, `角色形象-sheet${sprite.sheet}.webp`);

        if (!fs.existsSync(sheetPath)) {
          console.log(`⚠️  Sprite sheet ${sprite.sheet} not found for ${hero.nameCN}`);
          errors.push({ hero: hero.id, reason: `Sheet ${sprite.sheet} not found` });
          errorCount++;
          continue;
        }

        // Sanitize hero name for filename
        const sanitizedName = (hero.nameEN || hero.displayName || hero.nameCN)
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');

        const outputPath = path.join(outputDir, `${hero.id}_${sanitizedName}.webp`);

        // Extract sprite region
        let image = sharp(sheetPath);

        // Handle rotated sprites
        if (sprite.rotated) {
          // For rotated sprites: extract with swapped dimensions, then rotate
          await image
            .extract({
              left: sprite.x,
              top: sprite.y,
              width: sprite.height,  // Swapped
              height: sprite.width   // Swapped
            })
            .rotate(-90)
            .webp({ quality: 95 })
            .toFile(outputPath);
        } else {
          // Normal extraction
          await image
            .extract({
              left: sprite.x,
              top: sprite.y,
              width: sprite.width,
              height: sprite.height
            })
            .webp({ quality: 95 })
            .toFile(outputPath);
        }

        successCount++;

        // Log progress every 20 heroes
        if (successCount % 20 === 0) {
          console.log(`   ✅ Extracted ${successCount} sprites...`);
        }

      } catch (error) {
        console.error(`   ❌ Error extracting sprite for ${hero.nameCN}: ${error.message}`);
        errors.push({ hero: hero.id, reason: error.message });
        errorCount++;
      }
    }

    console.log('   ✨ Sprite extraction complete!');
    console.log(`   ✅ Success: ${successCount}/${heroes.length}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }

    return {
      successCount,
      errorCount,
      totalHeroes: heroes.length,
      errors
    };
  }

  /**
   * Generate hero icons from sprite sheets
   * Extracts face regions based on sprite data and face anchors
   * @deprecated Use extractHeroSprites instead - icons should be generated client-side
   */
  async generateHeroIcons(heroes, spriteSheetDir, outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎨 Generating hero icons from sprite sheets...');
    
    let successCount = 0;
    let errorCount = 0;
    const mapping = {};

    for (const hero of heroes) {
      try {
        // Skip heroes without sprite data
        if (!hero.sprite || hero.sprite.sheet === null || hero.sprite.sheet === undefined) {
          console.log(`⚠️  No sprite data for hero ID ${hero.id}: ${hero.nameCN}`);
          errorCount++;
          continue;
        }

        const sprite = hero.sprite;
        const sheetPath = path.join(spriteSheetDir, `角色形象-sheet${sprite.sheet}.webp`);

        if (!fs.existsSync(sheetPath)) {
          console.log(`⚠️  Sprite sheet ${sprite.sheet} not found for ${hero.nameCN}`);
          errorCount++;
          continue;
        }

        // Calculate face crop region (based on extractHeroIconsImproved.cjs)
        const faceCenter = sprite.faceCenter || { x: 0.5, y: 0.35 };
        const isRotated = sprite.rotated || false;
        
        // For rotated sprites, dimensions are swapped in the sheet
        const spriteWidth = sprite.width || 300;
        const spriteHeight = sprite.height || 400;

        // Crop size: 60% of sprite width for face area, 50% of height for upper body
        const cropWidth = Math.round(spriteWidth * 0.6);
        const cropHeight = Math.round(spriteHeight * 0.5);

        // Calculate crop position (face-centered)
        // Face center in absolute pixels within sprite
        const faceCenterX = Math.round(faceCenter.x * spriteWidth);
        const faceCenterY = Math.round(faceCenter.y * spriteHeight);

        // Crop position: center the crop on the face
        const cropX = Math.max(0, Math.min(
          sprite.x + faceCenterX - Math.round(cropWidth / 2),
          sprite.x + spriteWidth - cropWidth
        ));

        const cropY = Math.max(0, Math.min(
          sprite.y + faceCenterY - Math.round(cropHeight / 2),
          sprite.y + spriteHeight - cropHeight
        ));

        // Generate output filename
        const sanitizedName = (hero.nameEN || hero.nameCN)
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_');
        const outputFilename = `${hero.id}_${sanitizedName}.webp`;
        const outputPath = path.join(outputDir, outputFilename);

        // Extract sprite with rotation handling
        let sharpPipeline = sharp(sheetPath);
        
        if (isRotated) {
          // For rotated sprites: extract with swapped dimensions, then rotate back
          sharpPipeline = sharpPipeline
            .extract({
              left: Math.round(cropX),
              top: Math.round(cropY),
              width: Math.round(cropHeight), // swapped because rotated in sheet
              height: Math.round(cropWidth)
            })
            .rotate(-90); // Rotate back to normal orientation
        } else {
          // For normal sprites: extract directly
          sharpPipeline = sharpPipeline
            .extract({
              left: Math.round(cropX),
              top: Math.round(cropY),
              width: Math.round(cropWidth),
              height: Math.round(cropHeight)
            });
        }
        
        // Resize to icon and save
        await sharpPipeline
          .resize(128, 128, { fit: 'cover', position: 'center' })
          .webp({ quality: 90 })
          .toFile(outputPath);

        mapping[hero.id] = outputFilename;
        successCount++;

        if (successCount % 20 === 0) {
          console.log(`   ✅ Generated ${successCount} icons...`);
        }

      } catch (error) {
        console.log(`   ❌ Error generating icon for ${hero.nameCN}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`   ✨ Icon generation complete!`);
    console.log(`   ✅ Success: ${successCount}/${heroes.length}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    return {
      success: true,
      successCount,
      errorCount,
      mapping
    };
  }

  /**
   * Generate HTML visualization for sprite mapping
   */
  generateVisualization(heroes, outputPath) {
    const mapping = this.generateSpriteMapping(heroes);
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hero Sprite Mapping Visualization</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #1a1a1a;
      color: #fff;
      padding: 20px;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .hero-card {
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 15px;
      position: relative;
    }
    .sprite-container {
      width: 256px;
      height: 256px;
      position: relative;
      background: #333;
      margin: 0 auto 10px;
      border: 2px solid #555;
    }
    .sprite-img {
      position: absolute;
    }
    .anchor-point {
      position: absolute;
      width: 10px;
      height: 10px;
      background: red;
      border-radius: 50%;
      transform: translate(-5px, -5px);
      z-index: 10;
    }
    .anchor-crosshair {
      position: absolute;
      z-index: 9;
    }
    .anchor-crosshair::before,
    .anchor-crosshair::after {
      content: '';
      position: absolute;
      background: rgba(255, 0, 0, 0.5);
    }
    .anchor-crosshair::before {
      width: 256px;
      height: 1px;
      left: 0;
      top: 0;
    }
    .anchor-crosshair::after {
      width: 1px;
      height: 256px;
      left: 0;
      top: 0;
    }
    .hero-info {
      text-align: center;
    }
    .hero-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .hero-details {
      font-size: 12px;
      color: #aaa;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
      text-align: center;
    }
    .stat-box {
      background: #2a2a2a;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #444;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #4CAF50;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 Hero Sprite Mapping Visualization</h1>
    <p>Face Anchor Point: (${this.options.faceAnchor.offsetX}, ${this.options.faceAnchor.offsetY})</p>
  </div>
  
  <div class="stats">
    <div class="stat-box">
      <div class="stat-value">${mapping._metadata.totalHeroes}</div>
      <div>Total Heroes</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${mapping._metadata.heroesWithSprites}</div>
      <div>With Sprites</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${this.options.spriteSize.width}×${this.options.spriteSize.height}</div>
      <div>Sprite Size</div>
    </div>
  </div>

  <div class="hero-grid" id="heroGrid"></div>

  <script>
    const mapping = ${JSON.stringify(mapping, null, 2)};
    const grid = document.getElementById('heroGrid');
    
    Object.values(mapping.heroes).slice(0, 30).forEach(hero => {
      const card = document.createElement('div');
      card.className = 'hero-card';
      
      const spriteContainer = document.createElement('div');
      spriteContainer.className = 'sprite-container';
      
      // Sprite image
      const img = document.createElement('img');
      img.className = 'sprite-img';
      img.src = \`/images/heroes/角色形象-sheet\${hero.sheet}.webp\`;
      img.style.transform = hero.cssTransform;
      spriteContainer.appendChild(img);
      
      // Face anchor point
      const anchor = document.createElement('div');
      anchor.className = 'anchor-point';
      anchor.style.left = hero.faceAnchor.relativeX + 'px';
      anchor.style.top = hero.faceAnchor.relativeY + 'px';
      anchor.title = \`Face Anchor: (\${hero.faceAnchor.relativeX}, \${hero.faceAnchor.relativeY})\`;
      spriteContainer.appendChild(anchor);
      
      // Crosshair
      const crosshair = document.createElement('div');
      crosshair.className = 'anchor-crosshair';
      crosshair.style.left = hero.faceAnchor.relativeX + 'px';
      crosshair.style.top = hero.faceAnchor.relativeY + 'px';
      spriteContainer.appendChild(crosshair);
      
      card.appendChild(spriteContainer);
      
      // Hero info
      const info = document.createElement('div');
      info.className = 'hero-info';
      info.innerHTML = \`
        <div class="hero-name">\${hero.name}</div>
        <div class="hero-details">
          ID: \${hero.id} | Sprite: \${hero.spriteId}<br>
          Sheet \${hero.sheet} | (\${hero.x}, \${hero.y})<br>
          Anchor: (\${hero.faceAnchor.absoluteX}, \${hero.faceAnchor.absoluteY})
        </div>
      \`;
      card.appendChild(info);
      
      grid.appendChild(card);
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(outputPath, html);
    
    return {
      success: true,
      path: outputPath
    };
  }
}

module.exports = SpriteParser;

