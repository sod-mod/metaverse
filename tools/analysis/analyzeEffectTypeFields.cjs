const fs = require('fs');
const path = require('path');

const sxPath = path.join(__dirname, '..', '..', 'package', 'sx.json');
const sx = JSON.parse(fs.readFileSync(sxPath, 'utf8'));

console.log('EffectType Field Value Distribution Analysis');
console.log('='.repeat(60));
console.log(`Total rows: ${sx.size[0] - 1} (excluding header)`);
console.log(`Total columns: ${sx.size[1]}`);
console.log('');

// Analyze each field
for (let fieldIdx = 0; fieldIdx < sx.size[1]; fieldIdx++) {
  const fieldValues = [];
  const valueCounts = {};
  const valueTypes = new Set();
  
  // Collect values from all rows (skip header row 0)
  for (let rowIdx = 1; rowIdx < sx.data.length; rowIdx++) {
    const row = sx.data[rowIdx];
    if (row && row[fieldIdx]) {
      const value = row[fieldIdx][0];
      fieldValues.push(value);
      valueTypes.add(typeof value);
      
      // Count occurrences
      const key = String(value);
      valueCounts[key] = (valueCounts[key] || 0) + 1;
    }
  }
  
  // Determine field type
  const isNumber = Array.from(valueTypes).every(t => t === 'number');
  const isString = Array.from(valueTypes).every(t => t === 'string');
  const isMixed = valueTypes.size > 1;
  
  console.log(`Field ${fieldIdx}:`);
  console.log(`  Type: ${isNumber ? 'number' : isString ? 'string' : 'mixed'}`);
  console.log(`  Total values: ${fieldValues.length}`);
  console.log(`  Unique values: ${Object.keys(valueCounts).length}`);
  
  if (isNumber) {
    const nums = fieldValues.filter(v => typeof v === 'number');
    const sorted = [...new Set(nums)].sort((a, b) => a - b);
    console.log(`  Min: ${Math.min(...nums)}`);
    console.log(`  Max: ${Math.max(...nums)}`);
    console.log(`  Sample values: ${sorted.slice(0, 10).join(', ')}${sorted.length > 10 ? '...' : ''}`);
    
    // Show value distribution
    const sortedCounts = Object.entries(valueCounts)
      .map(([val, count]) => ({ val: parseFloat(val), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    console.log(`  Top 10 values:`);
    sortedCounts.forEach(({ val, count }) => {
      console.log(`    ${val}: ${count} occurrences`);
    });
  } else if (isString) {
    const strings = fieldValues.filter(v => typeof v === 'string');
    const uniqueStrings = [...new Set(strings)];
    console.log(`  Sample values: ${uniqueStrings.slice(0, 10).join(', ')}${uniqueStrings.length > 10 ? '...' : ''}`);
    
    // Show value distribution
    const sortedCounts = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log(`  Top 10 values:`);
    sortedCounts.forEach(([val, count]) => {
      console.log(`    "${val}": ${count} occurrences`);
    });
  } else {
    // Mixed type
    const numCount = fieldValues.filter(v => typeof v === 'number').length;
    const strCount = fieldValues.filter(v => typeof v === 'string').length;
    console.log(`  Numbers: ${numCount}, Strings: ${strCount}`);
    console.log(`  Sample values: ${fieldValues.slice(0, 10).map(v => JSON.stringify(v)).join(', ')}`);
  }
  
  console.log('');
}

