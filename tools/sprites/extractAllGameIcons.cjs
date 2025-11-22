const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Extract ALL game icons - Talent, Buff, Skill
 */

async function extractGridIcons(sheetPath, iconSize, outputDir, prefix, iconIds) {
  console.log(`\n📁 ${path.basename(sheetPath)}`);
  
  if (!fs.existsSync(sheetPath)) {
    console.log('   ❌ File not found');
    return [];
  }

  const metadata = await sharp(sheetPath).metadata();
  console.log(`   Size: ${metadata.width}x${metadata.height}`);
  
  const cols = Math.floor(metadata.width / iconSize);
  const rows = Math.floor(metadata.height / iconSize);
  
  const results = [];
  
  // Extract specific icon IDs
  for (const iconId of iconIds) {
    const index = iconId;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const left = col * iconSize;
    const top = row * iconSize;
    
    if (left + iconSize > metadata.width || top + iconSize > metadata.height) {
      console.log(`   ⚠️  Icon ${iconId}: Out of bounds [${row},${col}]`);
      continue;
    }
    
    try {
      const buffer = await sharp(sheetPath)
        .extract({ left, top, width: iconSize, height: iconSize })
        .webp({ quality: 95 })
        .toBuffer();
      
      const filename = `${prefix}_${iconId}.webp`;
      const outputPath = path.join(outputDir, filename);
      fs.writeFileSync(outputPath, buffer);
      
      results.push({ iconId, filename });
    } catch (error) {
      console.log(`   ❌ Icon ${iconId}: ${error.message}`);
    }
  }
  
  console.log(`   ✅ Extracted ${results.length} icons`);
  return results;
}

async function extractAllGameIcons() {
  console.log('🎨 Extracting ALL Game Icons\n');

  // Load data files
  const dataDir = path.join(__dirname, '../../data/extracted');
  const buff = JSON.parse(fs.readFileSync(path.join(dataDir, 'buff.json'), 'utf-8'));
  const skill = JSON.parse(fs.readFileSync(path.join(dataDir, 'skill.json'), 'utf-8'));

  // Collect unique IDs
  const buffIcons = new Set();
  const skillTypes = new Set();

  buff.forEach(b => {
    if (b.icon !== undefined && b.icon !== 0) buffIcons.add(b.icon);
  });

  skill.forEach(s => {
    if (s.type !== undefined) skillTypes.add(s.type);
  });

  console.log('📊 Icons to extract:');
  console.log(`   Buff: ${buffIcons.size} icons`);
  console.log(`   Skill: ${skillTypes.size} types`);
  console.log(`   Talent: 6 icons (already done)`);

  // Create output directories
  const baseDir = path.join(__dirname, '../../public/images');
  const buffDir = path.join(baseDir, 'buffs');
  const skillDir = path.join(baseDir, 'skills');

  [buffDir, skillDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const imageDir = path.join(__dirname, '../../../package_kor/images');

  // Extract Buff icons from buff图标-sheet0.webp
  const buffResults = await extractGridIcons(
    path.join(imageDir, 'buff图标-sheet0.webp'),
    80,  // Icon size
    buffDir,
    'buff',
    Array.from(buffIcons).sort((a,b) => a-b)
  );

  // Extract Skill icons from shared sheets
  // Skills might be in shared-0 or shared-1 sheets
  let skillResults = [];
  
  // Try shared-0-sheet1.webp first
  skillResults = await extractGridIcons(
    path.join(imageDir, 'shared-0-sheet1.webp'),
    80,
    skillDir,
    'skill',
    Array.from(skillTypes).sort((a,b) => a-b)
  );

  // Save info
  const info = {
    _metadata: {
      generatedAt: new Date().toISOString(),
      totalIcons: buffResults.length + skillResults.length + 6
    },
    buffs: {
      count: buffResults.length,
      icons: buffResults,
      spriteSheet: 'buff图标-sheet0.webp',
      iconSize: 80
    },
    skills: {
      count: skillResults.length,
      icons: skillResults,
      spriteSheet: 'shared-0-sheet1.webp',
      iconSize: 80
    },
    talents: {
      count: 6,
      location: '/images/talents/',
      note: 'Already extracted'
    }
  };

  const infoPath = path.join(baseDir, 'game-icons-info.json');
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));

  console.log('\n✨ Extraction complete!');
  console.log(`📁 Buffs: ${buffDir}`);
  console.log(`📁 Skills: ${skillDir}`);
  console.log(`📁 Talents: ${path.join(baseDir, 'talents')}`);
  console.log(`📋 Info: ${infoPath}`);
  
  console.log('\n📊 Summary:');
  console.log(`   Buff icons: ${buffResults.length}/${buffIcons.size}`);
  console.log(`   Skill icons: ${skillResults.length}/${skillTypes.size}`);
  console.log(`   Talent icons: 6/6 ✓`);
}

extractAllGameIcons().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

