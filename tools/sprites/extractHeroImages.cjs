const fs = require('fs');
const path = require('path');

/**
 * Extract hero image coordinates from sprite sheets
 * 
 * The hero images are in: package/images/角色形象-sheet*.webp (33 sheets)
 * We need to create a mapping of hero ID → sprite sheet + coordinates
 * 
 * Without image processing libraries, we'll create a simple coordinate mapping
 * that can be used with CSS background-position
 */

console.log('🎨 Hero Image Extraction\n');
console.log('The hero portraits are stored in sprite sheets:');
console.log('  package/images/角色形象-sheet0.webp');
console.log('  package/images/角色形象-sheet1.webp');
console.log('  ... (up to sheet32.webp)\n');

console.log('📋 Options for image handling:\n');

console.log('1. CSS Sprite Sheet Method (Recommended):');
console.log('   - Copy sprite sheets to public/images/heroes/');
console.log('   - Create coordinate mapping JSON');
console.log('   - Use CSS background-position to display specific heroes');
console.log('   - Pros: Fast, no image processing needed');
console.log('   - Cons: Need to manually map each hero position\n');

console.log('2. Image Extraction Method:');
console.log('   - Use sharp/jimp library to extract individual images');
console.log('   - Requires knowing exact coordinates and sizes');
console.log('   - Pros: Individual files, easier to use');
console.log('   - Cons: Requires image processing library\n');

console.log('3. Manual Method:');
console.log('   - Open sprite sheets in image editor');
console.log('   - Manually crop and export each hero');
console.log('   - Pros: Most accurate');
console.log('   - Cons: Time-consuming\n');

// Copy sprite sheets to public directory
const srcDir = path.join(__dirname, '../../../package/images');
const destDir = path.join(__dirname, '../../public/images/heroes');

console.log('📁 Copying sprite sheets...\n');

// Create destination directory
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy hero sprite sheets
const files = fs.readdirSync(srcDir);
let copied = 0;

files.forEach(file => {
  if (file.startsWith('角色形象-sheet') && file.endsWith('.webp')) {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    fs.copyFileSync(src, dest);
    copied++;
  }
});

console.log(`✅ Copied ${copied} hero sprite sheets to public/images/heroes/\n`);

// Create a placeholder coordinate mapping
const coordinateMapping = {
  _comment: "Hero ID → Sprite Sheet coordinate mapping",
  _instructions: "Each hero needs: sheet number, x position, y position, width, height",
  _example: {
    "1": {
      sheet: 0,
      x: 0,
      y: 0,
      width: 128,
      height: 128
    }
  },
  heroes: {
    // This needs to be filled in manually or by analyzing the sprite sheets
    // For now, we'll use a default placeholder
  }
};

const mappingPath = path.join(destDir, 'hero-sprite-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(coordinateMapping, null, 2));

console.log('📄 Created hero-sprite-mapping.json');
console.log('   This file needs to be filled with actual coordinates\n');

console.log('🎯 Next Steps:\n');
console.log('1. Open package/images/角色形象-sheet0.webp in an image viewer');
console.log('2. Identify hero positions and sizes');
console.log('3. Update hero-sprite-mapping.json with coordinates');
console.log('4. Update HeroCard component to use sprite backgrounds\n');

console.log('💡 For now, the wiki will work without images.');
console.log('   Images can be added incrementally as coordinates are mapped.\n');

