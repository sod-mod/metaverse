// Display face anchor data
const data = require('../public/images/heroes/hero-face-anchors.json');
const heroes = Object.values(data.heroes).slice(0, 10);

console.log('\n📊 Sample Hero Face Anchors:\n');
console.log('ID  | Name        | Sheet | Face Center    | Pixel Offset');
console.log('----|-------------|-------|----------------|---------------');

heroes.forEach(h => {
  const id = h.heroId.toString().padStart(3);
  const name = h.name.padEnd(12).substring(0, 12);
  const sheet = h.sheet.toString().padStart(5);
  const faceX = h.faceCenter.relativeX.toFixed(2);
  const faceY = h.faceCenter.relativeY.toFixed(2);
  const pixelX = h.faceCenter.pixelX;
  const pixelY = h.faceCenter.pixelY;
  
  console.log(`${id} | ${name} | ${sheet} | (${faceX}, ${faceY}) | (${pixelX}px, ${pixelY}px)`);
});

console.log('\n✨ Face anchor extraction complete!');
console.log(`\nℹ️  Total heroes with anchors: ${Object.keys(data.heroes).length}`);

