const fs = require('fs');
const path = require('path');

const mgPath = path.join(__dirname, '..', '..', 'package', 'mg.json');
const mg = JSON.parse(fs.readFileSync(mgPath, 'utf8'));

function findByNameContains(name) {
  const results = [];
  for (let i = 1; i < mg.data.length; i++) {
    const row = mg.data[i];
    if (row && row[1] && row[1][0] && row[1][0].includes(name)) {
      results.push({
        id: row[0][0],
        name: row[1][0],
        data: row.map(col => col[0])
      });
    }
  }
  return results;
}

// Find 순식 (瞬袭)
const sunsik = findByNameContains('瞬');
console.log('순식 관련 검색:');
sunsik.forEach(r => {
  console.log(`ID ${r.id}: ${r.name}`);
  console.log(`  Raw data:`, JSON.stringify(r.data));
});

// Find 인점 (인점)
const injeom = findByNameContains('点');
console.log('\n인점 관련 검색:');
injeom.forEach(r => {
  console.log(`ID ${r.id}: ${r.name}`);
  console.log(`  Raw data:`, JSON.stringify(r.data));
});

// Also check 극속 for comparison
const geuk = mg.data.find((r, idx) => idx > 0 && r[0] && r[0][0] === 179);
if (geuk) {
  console.log('\n극속 (ID 179):');
  console.log(`  Raw data:`, JSON.stringify(geuk.map(col => col[0])));
}

