/**
 * Extract all item icons from sprite sheets
 * 
 * Mapping logic:
 * 1. Load item data (from wp.json or similar) to get item icon IDs
 * 2. Icon ID → Sprite Index = direct or sequential mapping
 * 3. Sprite Index → x,y coordinates from data.json (extracted dynamically)
 * 4. Extract each icon using exact x,y coordinates
 * 
 * Note: This is a template. Item data source needs to be configured.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { extractSpriteCoordinates } = require('./extractSpriteCoordinates.cjs');

async function extractItemIcons(sheetName = '物品图标-sheet0.webp', itemDataSource = null) {
  const sheetPath = path.join(__dirname, '../../../package_kor/images', sheetName);
  const outputDir = path.join(__dirname, '../../public/images/items');

  // Convert Chinese filename to English for output
  const englishSheetName = sheetName.replace('物品图标-sheet', 'item-icons-sheet');

  // Extract sprite coordinates from data.json
  console.log(`Extracting sprite coordinates from data.json for ${sheetName}...`);
  const sprites = extractSpriteCoordinates(sheetName);
  
  if (sprites.length === 0) {
    throw new Error('No sprite coordinates found!');
  }
  
  console.log(`Found ${sprites.length} sprites (${sprites[0].width}x${sprites[0].height})\n`);
  
  // If no item data source provided, extract ALL icons by sprite index
  if (!itemDataSource) {
    console.log('No item data source provided. Extracting all icons by sprite index...\n');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let successCount = 0;
    
    for (let i = 0; i < sprites.length; i++) {
      const sprite = sprites[i];
      const outputPath = path.join(outputDir, `item_${englishSheetName.replace('.webp', '')}_${i}.webp`);
      
      try {
        await sharp(sheetPath)
          .extract({ left: sprite.x, top: sprite.y, width: sprite.width, height: sprite.height })
          .toFile(outputPath);
        
        successCount++;
        
        if (successCount <= 5 || successCount === sprites.length) {
          console.log(`✓ Icon ${String(i).padStart(3)} → (x=${sprite.x}, y=${sprite.y})`);
        } else if (successCount === 6) {
          console.log(`  ... extracting remaining icons ...`);
        }
      } catch (error) {
        console.error(`✗ Icon ${i}: ${error.message}`);
      }
    }
    
    console.log(`\n✓ Successfully extracted ${successCount}/${sprites.length} item icons`);
    console.log(`✓ Saved to: ${outputDir}`);
    
    return;
  }
  
  // TODO: Implement mapping logic if item data source is provided
  console.log('Item data source mapping not yet implemented.');
}

// Run if called directly
if (require.main === module) {
  const sheetArg = process.argv[2] || '物品图标-sheet0.webp';
  extractItemIcons(sheetArg).catch(console.error);
}

module.exports = { extractItemIcons };

