const fs = require('fs');
const path = require('path');

const mgPath = path.join(__dirname, '..', '..', 'package', 'mg.json');
const mg = JSON.parse(fs.readFileSync(mgPath, 'utf8'));

function getRow(id) {
  const row = mg.data.find((r, idx) => idx > 0 && r[0] && r[0][0] === id);
  return row ? row.map(col => col[0]) : null;
}

function analyze(id, expectedPercent) {
  const row = getRow(id);
  if (!row) return null;
  const baseValue = row[13];
  const grade = row[12];
  const maxLevel = row[4];
  const field11 = row[11];
  const field10 = row[10];
  const field9 = row[9];
  const field8 = row[8];
  const field7 = row[7];
  const field6 = row[6];
  const field3 = row[3]; // effectCategory
  const multiplier = expectedPercent / baseValue;
  return {
    id,
    name: row[1],
    grade,
    baseValue,
    maxLevel,
    field3,
    field6,
    field7,
    field8,
    field9,
    field10,
    field11,
    expectedPercent,
    multiplier
  };
}

const results = [
  analyze(298, 11.25), // 여룡
  analyze(179, 2),     // 극속
  analyze(212, 6.25),  // 마도
  analyze(81, 6)       // 중격
];

console.log('Talent multiplier analysis:');
results.forEach(r => {
  console.log(`\n${r.name} (ID ${r.id}):`);
  console.log(`  Grade: ${r.grade}, BaseValue: ${r.baseValue}, MaxLevel: ${r.maxLevel}`);
  console.log(`  Expected: ${r.expectedPercent}%, Multiplier: ${r.multiplier}`);
  console.log(`  Fields: [6]=${r.field6}, [7]=${r.field7}, [8]=${r.field8}, [9]=${r.field9}, [10]=${r.field10}, [11]=${r.field11}`);
  console.log(`  EffectCategory (field3): ${r.field3}`);
});

// Try to find pattern
console.log('\n\nPattern analysis:');
console.log('Looking for correlation between multiplier and fields...');

// Check if multiplier correlates with maxLevel
console.log('\nMaxLevel correlation:');
results.forEach(r => {
  console.log(`  ${r.name}: maxLevel=${r.maxLevel}, multiplier=${r.multiplier}, ratio=${r.multiplier / r.maxLevel}`);
});

// Check if multiplier correlates with field11
console.log('\nField11 correlation:');
results.forEach(r => {
  console.log(`  ${r.name}: field11=${r.field11}, multiplier=${r.multiplier}`);
});

// Check if multiplier correlates with effectCategory
console.log('\nEffectCategory correlation:');
results.forEach(r => {
  console.log(`  ${r.name}: effectCategory=${r.field3}, multiplier=${r.multiplier}`);
});

// Try baseValue / maxLevel hypothesis
console.log('\n\nbaseValue / maxLevel hypothesis:');
results.forEach(r => {
  const ratio = r.baseValue / r.maxLevel;
  const constant = r.multiplier / ratio;
  console.log(`  ${r.name}: baseValue/maxLevel=${ratio.toFixed(4)}, multiplier=${r.multiplier.toFixed(6)}, constant=${constant.toFixed(6)}`);
});

// Try maxLevel / baseValue hypothesis
console.log('\n\nmaxLevel / baseValue hypothesis:');
results.forEach(r => {
  const ratio = r.maxLevel / r.baseValue;
  const constant = r.multiplier * ratio;
  console.log(`  ${r.name}: maxLevel/baseValue=${ratio.toFixed(4)}, multiplier=${r.multiplier.toFixed(6)}, constant=${constant.toFixed(6)}`);
});

// Try baseValue * maxLevel hypothesis
console.log('\n\nbaseValue * maxLevel hypothesis:');
results.forEach(r => {
  const product = r.baseValue * r.maxLevel;
  const constant = r.multiplier / product;
  console.log(`  ${r.name}: baseValue*maxLevel=${product}, multiplier=${r.multiplier.toFixed(6)}, constant=${constant.toFixed(10)}`);
});

