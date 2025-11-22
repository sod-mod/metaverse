const fs = require('fs');
const path = require('path');

console.log('🎨 Extracting sprite metadata from data.json...\n');

const dataPath = path.join(__dirname, '../../../package/data.json');
const content = fs.readFileSync(dataPath, 'utf8');

// Find all sprite sheet references with their metadata
const pattern = /"images\/角色形象-sheet(\d+)\.webp",(\d+),(\d+),(\d+),(\d+),(\d+),([^,]+),(\d+),([^,]+),([^,]+),\[/g;

let match;
const sprites = [];
let count = 0;

while ((match = pattern.exec(content)) && count < 20) {
  const [full, sheet, size, x, y, width, height, rotated, frame, pivotX, pivotY] = match;
  sprites.push({
    sheet: parseInt(sheet),
    x: parseInt(x),
    y: parseInt(y),
    width: parseInt(width),
    height: parseInt(height),
    rotated: rotated === 'true',
    frame: parseInt(frame),
    pivotX: parseFloat(pivotX),
    pivotY: parseFloat(pivotY)
  });
  count++;
}

console.log(`Found ${sprites.length} sprite entries:\n`);
sprites.forEach((s, i) => {
  console.log(`[${i}] Sheet ${s.sheet}: pos(${s.x}, ${s.y}), size(${s.width}x${s.height}), rotated=${s.rotated}, pivot(${s.pivotX.toFixed(3)}, ${s.pivotY.toFixed(3)})`);
});

// Save to JSON
const outputPath = path.join(__dirname, 'sprite_metadata_sample.json');
fs.writeFileSync(outputPath, JSON.stringify(sprites, null, 2));
console.log(`\n✅ Sample saved to: ${outputPath}`);

