const examples = [
  {name: '순식', baseValue: 10, maxLevel: 40, expected: 1, grade: 1},
  {name: '극속', baseValue: 80, maxLevel: 80, expected: 2, grade: 3},
  {name: '마도', baseValue: 80, maxLevel: 100, expected: 6.25, grade: 3},
  {name: '중격', baseValue: 40, maxLevel: 60, expected: 6, grade: 2},
  {name: '여룡', baseValue: 160, maxLevel: 180, expected: 11.25, grade: 4}
];

console.log('모든 예시 분석:');
examples.forEach(ex => {
  const ratio = ex.baseValue / ex.maxLevel;
  const multiplier = ex.expected / ex.baseValue;
  console.log(`${ex.name}: baseValue=${ex.baseValue}, maxLevel=${ex.maxLevel}, ratio=${ratio.toFixed(4)}, multiplier=${multiplier.toFixed(6)}, grade=${ex.grade}`);
});

console.log('\n\n가설 1: percentagePerLevel = (baseValue * 상수) / maxLevel');
examples.forEach(ex => {
  const constant = (ex.expected * ex.maxLevel) / ex.baseValue;
  console.log(`${ex.name}: 상수 = ${constant.toFixed(4)}`);
});

console.log('\n\n가설 2: percentagePerLevel = baseValue / maxLevel * 상수');
examples.forEach(ex => {
  const constant = ex.expected / (ex.baseValue / ex.maxLevel);
  console.log(`${ex.name}: 상수 = ${constant.toFixed(4)}`);
});

console.log('\n\n가설 3: percentagePerLevel = baseValue * gradeMultiplier / maxLevel * 상수');
examples.forEach(ex => {
  // Try different grade multipliers
  const gradeMultipliers = {1: 1, 2: 1, 3: 1, 4: 1};
  const constant = (ex.expected * ex.maxLevel) / (ex.baseValue * gradeMultipliers[ex.grade]);
  console.log(`${ex.name}: grade=${ex.grade}, 상수 = ${constant.toFixed(4)}`);
});

console.log('\n\n가설 4: percentagePerLevel = baseValue / maxLevel * maxLevel / 25 * 상수');
examples.forEach(ex => {
  const constant = ex.expected / ((ex.baseValue / ex.maxLevel) * (ex.maxLevel / 25));
  console.log(`${ex.name}: 상수 = ${constant.toFixed(4)}`);
});

console.log('\n\n가설 5: percentagePerLevel = baseValue * maxLevel / (25 * 상수)');
examples.forEach(ex => {
  const constant = (ex.baseValue * ex.maxLevel) / (25 * ex.expected);
  console.log(`${ex.name}: 상수 = ${constant.toFixed(4)}`);
});

