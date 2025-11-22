const fs = require('fs');
const path = require('path');

/**
 * Analyze the structure of c2array JSON files
 */
function analyzeFile(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  
  if (!json.c2array) {
    console.log(`${fileName}: Not a c2array format`);
    return;
  }
  
  const [rows, cols, depth] = json.size;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 ${fileName}`);
  console.log(`   Size: ${rows} rows × ${cols} columns`);
  
  // Sample first non-empty row
  let sampleRow = null;
  for (let i = 0; i < Math.min(rows, 10); i++) {
    const hasData = json.data[i].some(cell => {
      const val = cell[0];
      return val !== 0 && val !== '' && val !== null;
    });
    if (hasData) {
      sampleRow = i;
      break;
    }
  }
  
  if (sampleRow !== null) {
    console.log(`   Sample row ${sampleRow}:`);
    for (let j = 0; j < Math.min(cols, 10); j++) {
      const value = json.data[sampleRow][j][0];
      if (value !== 0 && value !== '') {
        console.log(`     [${j}]: ${JSON.stringify(value)}`);
      }
    }
  }
}

// Key files to analyze (based on likely content)
const packagePath = path.join(__dirname, '../../../package');
const keyFiles = [
  'hh.json',    // Likely: Heroes/Characters (英雄)
  'jn.json',    // Likely: Skills (技能)
  'wp.json',    // Likely: Weapons/Equipment (武品/物品)
  'buff.json',  // Buffs
  'js.json',    // Likely: Roles (角色)
  'jz.json',    // Likely: Equipment (装备)
  'cj.json',    // ?
  'fw.json',    // ?
  'dl.json',    // ?
  'dr.json',    // ?
];

console.log('🔍 Analyzing Multiverse Loot Hunter data structure...\n');

keyFiles.forEach(filename => {
  const filePath = path.join(packagePath, filename);
  if (fs.existsSync(filePath)) {
    try {
      analyzeFile(filePath);
    } catch (error) {
      console.log(`\n❌ Error analyzing ${filename}: ${error.message}`);
    }
  } else {
    console.log(`\n⚠️  ${filename} not found`);
  }
});

console.log(`\n${'='.repeat(60)}\n`);
console.log('💡 Recommendations:');
console.log('   - hh.json appears to contain hero/character data');
console.log('   - jn.json appears to contain skill data');
console.log('   - wp.json appears to contain weapon/equipment data');
console.log('   - Use CSV as cross-reference for validation');

