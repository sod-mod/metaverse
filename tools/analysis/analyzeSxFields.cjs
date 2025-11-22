const fs = require('fs');
const path = require('path');

const sxPath = path.join(__dirname, '..', '..', 'package', 'sx.json');
const sx = JSON.parse(fs.readFileSync(sxPath, 'utf8'));

console.log('sx.json 구조:');
console.log('Rows:', sx.size[0], 'Cols:', sx.size[1]);

console.log('\n첫 5개 행의 필드:');
for (let i = 1; i < Math.min(6, sx.data.length); i++) {
  const row = sx.data[i];
  console.log(`\nRow ${i} (ID ${row[0][0]}, Name: ${row[1][0]}):`);
  row.forEach((col, idx) => {
    console.log(`  Field ${idx}:`, JSON.stringify(col[0]));
  });
}

console.log('\n\n특정 effectType ID 확인 (37=극속, 70=마도, 92=여룡, 13=중격):');
const ids = [37, 70, 92, 13];
ids.forEach(id => {
  const row = sx.data.find((r, idx) => idx > 0 && r[0] && r[0][0] === id);
  if (row) {
    console.log(`\nID ${id} (${row[1][0]}):`);
    row.forEach((col, idx) => {
      console.log(`  Field ${idx}:`, JSON.stringify(col[0]));
    });
  } else {
    console.log(`\nID ${id}: Not found`);
  }
});

console.log('\n\nField 3 (숫자 필드) 값 분포 확인:');
const field3Values = [];
for (let i = 1; i < sx.data.length; i++) {
  const row = sx.data[i];
  if (row && row[3] && typeof row[3][0] === 'number') {
    field3Values.push({ id: row[0][0], name: row[1][0], value: row[3][0] });
  }
}

// Count unique values
const valueCounts = {};
field3Values.forEach(item => {
  valueCounts[item.value] = (valueCounts[item.value] || 0) + 1;
});

console.log('Field 3 값 분포:');
Object.keys(valueCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(val => {
  console.log(`  ${val}: ${valueCounts[val]}개`);
});

// Show examples for each value
console.log('\nField 3 값별 예시:');
const uniqueValues = [...new Set(field3Values.map(item => item.value))].sort((a, b) => a - b);
uniqueValues.slice(0, 10).forEach(val => {
  const examples = field3Values.filter(item => item.value === val).slice(0, 3);
  console.log(`\n  값 ${val}:`);
  examples.forEach(ex => {
    console.log(`    ID ${ex.id}: ${ex.name}`);
  });
});

