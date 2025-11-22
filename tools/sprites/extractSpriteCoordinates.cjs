/**
 * Extract sprite coordinates from data.json
 * 
 * Usage:
 *   node extractSpriteCoordinates.cjs "buff图标-sheet0.webp"
 *   node extractSpriteCoordinates.cjs "物品图标-sheet0.webp"
 */

const fs = require('fs');
const path = require('path');

function extractSpriteCoordinates(spriteSheetName) {
  const dataPath = path.join(__dirname, '../../../package_kor/data.json');
  
  console.log(`Searching for "${spriteSheetName}" sprites in data.json...`);
  
  // Read data.json line by line (it's too large to parse as JSON)
  const content = fs.readFileSync(dataPath, 'utf8');
  const lines = content.split('\n');
  
  const sprites = [];
  // Escape special regex characters
  const escapedName = spriteSheetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Pattern: "images/filename",id,x,y,width,height
  // Note: In data.json, sprite sheets are referenced with "images/" prefix
  const pattern = new RegExp(`"images/${escapedName}",(\\d+),(\\d+),(\\d+),(\\d+),(\\d+)`, 'g');
  
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const [, id, x, y, width, possibleHeight] = match;
    
    // Check if height is provided separately, else use width (square)
    const w = parseInt(width);
    const h = possibleHeight ? parseInt(possibleHeight) : w;
    
    sprites.push({
      id: parseInt(id),
      x: parseInt(x),
      y: parseInt(y),
      width: w,
      height: h
    });
  }
  
  // Sort by y, then x (reading order)
  sprites.sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  
  // Remove duplicates
  const uniqueSprites = [];
  const seen = new Set();
  
  for (const sprite of sprites) {
    const key = `${sprite.x},${sprite.y}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSprites.push(sprite);
    }
  }
  
  console.log(`\nFound ${uniqueSprites.length} unique sprites`);
  console.log(`Icon size: ${uniqueSprites[0]?.width}x${uniqueSprites[0]?.height}`);
  
  return uniqueSprites;
}

function formatAsJSArray(sprites) {
  // Format for direct use in JS code
  const coords = sprites.map(s => `{ x: ${s.x}, y: ${s.y} }`);
  const formatted = [];
  
  for (let i = 0; i < coords.length; i += 6) {
    formatted.push('  ' + coords.slice(i, i + 6).join(', '));
  }
  
  return `[\n${formatted.join(',\n')}\n]`;
}

// CLI usage
if (require.main === module) {
  const spriteSheetName = process.argv[2];
  
  if (!spriteSheetName) {
    console.error('Usage: node extractSpriteCoordinates.cjs <sprite-sheet-name>');
    console.error('Example: node extractSpriteCoordinates.cjs "buff图标-sheet0.webp"');
    process.exit(1);
  }
  
  const sprites = extractSpriteCoordinates(spriteSheetName);
  
  if (sprites.length === 0) {
    console.error('\n❌ No sprites found!');
    process.exit(1);
  }
  
  // Save results
  const outputDir = path.join(__dirname, '../../data/extracted');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const basename = spriteSheetName.replace(/\.[^.]+$/, '').replace(/[^\w\-]/g, '_');
  const outputPath = path.join(outputDir, `${basename}_coordinates.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify(sprites, null, 2));
  console.log(`\n✓ Saved JSON to: ${outputPath}`);
  
  // Also print formatted JS array for copy-paste
  console.log('\n--- Copy-paste for JS code ---\n');
  console.log(`const SPRITE_COORDS = ${formatAsJSArray(sprites)};`);
}

module.exports = { extractSpriteCoordinates, formatAsJSArray };

