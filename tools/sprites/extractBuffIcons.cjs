/**
 * Extract all buff icons from sprite sheet
 * 
 * Mapping logic:
 * 1. Load buff.json to determine icon appearance order
 * 2. Icon ID → Sprite Index = first appearance order in buff.json
 * 3. Sprite Index → x,y coordinates from data.json (extracted dynamically)
 * 4. Extract each icon using exact x,y coordinates
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { extractSpriteCoordinates } = require('./extractSpriteCoordinates.cjs');

async function extractBuffIcons() {
  const buffPath = path.join(__dirname, '../../data/extracted/buff.json');
  const sheetName = 'buff图标-sheet0.webp';
  const sheetPath = path.join(__dirname, '../../../package_kor/images', sheetName);
  const outputDir = path.join(__dirname, '../../public/images/buffs');
  
  // Extract sprite coordinates from data.json
  console.log('Extracting sprite coordinates from data.json...');
  const sprites = extractSpriteCoordinates(sheetName);
  
  if (sprites.length === 0) {
    throw new Error('No sprite coordinates found!');
  }
  
  console.log(`Found ${sprites.length} sprites (${sprites[0].width}x${sprites[0].height})\n`);
  
  // Load buff data
  const buffData = JSON.parse(fs.readFileSync(buffPath, 'utf8'));
  
  // Build Icon ID → Sprite Index mapping based on first appearance in buff.json
  const iconToSpriteIndex = {};
  const uniqueIcons = [];
  
  buffData.forEach((buff) => {
    if (!iconToSpriteIndex.hasOwnProperty(buff.icon)) {
      iconToSpriteIndex[buff.icon] = uniqueIcons.length;
      uniqueIcons.push(buff.icon);
    }
  });
  
  console.log(`Found ${uniqueIcons.length} unique buff icons\n`);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Extract each icon
  const iconMapping = {};
  let successCount = 0;
  const iconSize = sprites[0].width; // All sprites should have same size
  
  for (const [iconId, spriteIdx] of Object.entries(iconToSpriteIndex)) {
    if (spriteIdx >= sprites.length) {
      console.error(`✗ Icon ${iconId}: Sprite[${spriteIdx}] out of range`);
      continue;
    }
    
    const sprite = sprites[spriteIdx];
    const outputPath = path.join(outputDir, `buff_${iconId}.webp`);
    
    try {
      await sharp(sheetPath)
        .extract({ left: sprite.x, top: sprite.y, width: sprite.width, height: sprite.height })
        .toFile(outputPath);
      
      successCount++;
      iconMapping[iconId] = { 
        spriteIndex: spriteIdx, 
        x: sprite.x, 
        y: sprite.y, 
        width: sprite.width, 
        height: sprite.height 
      };
      
      if (successCount <= 5 || successCount === uniqueIcons.length) {
        console.log(`✓ Icon ${String(iconId).padStart(3)} → Sprite[${spriteIdx}] (x=${sprite.x}, y=${sprite.y})`);
      } else if (successCount === 6) {
        console.log(`  ... extracting remaining icons ...`);
      }
    } catch (error) {
      console.error(`✗ Icon ${iconId}: ${error.message}`);
    }
  }
  
  // Save mapping metadata
  const mappingPath = path.join(outputDir, 'buff-icon-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify({
    _metadata: {
      generatedAt: new Date().toISOString(),
      spriteSheet: sheetName,
      iconSize: iconSize,
      totalIcons: Object.keys(iconMapping).length,
      mappingLogic: 'Icon ID → First appearance in buff.json → Sprite position in data.json'
    },
    icons: iconMapping
  }, null, 2));
  
  console.log(`\n✓ Successfully extracted ${successCount}/${uniqueIcons.length} buff icons`);
  console.log(`✓ Saved to: ${outputDir}`);
  console.log(`✓ Mapping: ${mappingPath}`);
}

// Run if called directly
if (require.main === module) {
  extractBuffIcons().catch(console.error);
}

module.exports = { extractBuffIcons };

