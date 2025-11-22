const fs = require('fs');
const path = require('path');

/**
 * Copy Hero Sprite Sheets
 * 
 * Copies all hero portrait sprite sheets from package/images to public/images/heroes
 */

console.log('📦 Copying Hero Sprite Sheets\n');

const srcDir = path.join(__dirname, '../../../package/images');
const destDir = path.join(__dirname, '../../public/images/heroes');

// Create destination directory
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('✅ Created directory: public/images/heroes\n');
}

// Copy hero sprite sheets
const files = fs.readdirSync(srcDir);
let copied = 0;
let skipped = 0;
let totalSize = 0;

console.log('📋 Copying sprite sheets...\n');

files.forEach(file => {
  if (file.startsWith('角色形象-sheet') && file.endsWith('.webp')) {
    const src = path.join(srcDir, file);
    // Rename to English: 角色形象-sheetN.webp -> hero-sprites-sheetN.webp
    const englishFilename = file.replace('角色形象-sheet', 'hero-sprites-sheet');
    const dest = path.join(destDir, englishFilename);

    // Get file size
    const stats = fs.statSync(src);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    // Copy file with new name
    fs.copyFileSync(src, dest);
    copied++;
    totalSize += stats.size;

    console.log(`  ✓ ${file} -> ${englishFilename} (${fileSizeMB} MB)`);
  }
});

const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`\n✅ Copy Complete!`);
console.log(`   Copied: ${copied} files`);
console.log(`   Total size: ${totalSizeMB} MB\n`);

console.log('🎨 Sprite sheets are ready for use!');
console.log('   Location: public/images/heroes/\n');

console.log('💡 Next Steps:');
console.log('   1. Use the HeroSprite component: <HeroSprite heroId={1} size={64} />');
console.log('   2. Open public/images/heroes/reference.html to view all heroes');
console.log('   3. Check hero-sprite-mapping.json for sprite coordinates\n');

