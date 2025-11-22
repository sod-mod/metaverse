const fs = require('fs');
const path = require('path');

/**
 * Datamine Hero Sprite Positions
 * 
 * Extracts sprite sheet coordinates from heroes.json and creates a comprehensive mapping
 * that can be used to display hero faces in the wiki.
 * 
 * The heroes.json already contains sprite data with:
 * - sheet: sprite sheet number (0-32)
 * - x, y: position in pixels
 * - frame: frame number
 */

console.log('🔍 Datamining Hero Sprite Positions\n');

// Load heroes data
const heroesPath = path.join(__dirname, '../../data/extracted/hero.json');
const heroes = JSON.parse(fs.readFileSync(heroesPath, 'utf-8'));

console.log(`📊 Found ${heroes.length} heroes in database\n`);

// Analyze sprite data
const spriteAnalysis = {
  totalHeroes: heroes.length,
  heroesWithSprites: 0,
  heroesWithoutSprites: 0,
  sheetUsage: {},
  positionRanges: {
    x: { min: Infinity, max: -Infinity },
    y: { min: Infinity, max: -Infinity }
  },
  uniqueFrames: new Set(),
  heroes: []
};

// Process each hero
heroes.forEach(hero => {
  if (hero.sprite && hero.sprite.sheet !== undefined) {
    spriteAnalysis.heroesWithSprites++;
    
    const sheet = hero.sprite.sheet;
    const x = hero.sprite.x;
    const y = hero.sprite.y;
    const frame = hero.sprite.frame;
    
    // Track sheet usage
    if (!spriteAnalysis.sheetUsage[sheet]) {
      spriteAnalysis.sheetUsage[sheet] = [];
    }
    spriteAnalysis.sheetUsage[sheet].push({
      id: hero.id,
      name: hero.name,
      x, y, frame
    });
    
    // Track position ranges
    if (x < spriteAnalysis.positionRanges.x.min) spriteAnalysis.positionRanges.x.min = x;
    if (x > spriteAnalysis.positionRanges.x.max) spriteAnalysis.positionRanges.x.max = x;
    if (y < spriteAnalysis.positionRanges.y.min) spriteAnalysis.positionRanges.y.min = y;
    if (y > spriteAnalysis.positionRanges.y.max) spriteAnalysis.positionRanges.y.max = y;
    
    // Track unique frames
    spriteAnalysis.uniqueFrames.add(frame);
    
    // Add to mapping
    spriteAnalysis.heroes.push({
      id: hero.id,
      name: hero.name,
      nameEn: hero.names?.en || hero.name,
      nameKo: hero.names?.ko || hero.name,
      sprite: hero.sprite
    });
  } else {
    spriteAnalysis.heroesWithoutSprites++;
  }
});

// Print analysis
console.log('📈 Sprite Data Analysis:');
console.log(`  ✅ Heroes with sprites: ${spriteAnalysis.heroesWithSprites}`);
console.log(`  ❌ Heroes without sprites: ${spriteAnalysis.heroesWithoutSprites}`);
console.log(`  📄 Sprite sheets used: ${Object.keys(spriteAnalysis.sheetUsage).length}/33`);
console.log(`  🎯 Unique frames: ${spriteAnalysis.uniqueFrames.size}`);
console.log(`  📐 X position range: ${spriteAnalysis.positionRanges.x.min} - ${spriteAnalysis.positionRanges.x.max}`);
console.log(`  📐 Y position range: ${spriteAnalysis.positionRanges.y.min} - ${spriteAnalysis.positionRanges.y.max}\n`);

// Sheet usage statistics
console.log('📊 Sheet Usage Statistics:');
const sortedSheets = Object.keys(spriteAnalysis.sheetUsage)
  .map(Number)
  .sort((a, b) => a - b);

sortedSheets.forEach(sheet => {
  const heroes = spriteAnalysis.sheetUsage[sheet];
  console.log(`  Sheet ${sheet.toString().padStart(3)}: ${heroes.length.toString().padStart(3)} heroes`);
});
console.log();

// Estimate sprite size
// Analyze adjacent sprites to estimate dimensions
console.log('🔍 Analyzing sprite dimensions...');

const spriteSamples = [];
sortedSheets.slice(0, 5).forEach(sheet => {
  const heroes = spriteAnalysis.sheetUsage[sheet]
    .sort((a, b) => a.frame - b.frame)
    .slice(0, 10);
  
  if (heroes.length > 1) {
    for (let i = 0; i < heroes.length - 1; i++) {
      const h1 = heroes[i];
      const h2 = heroes[i + 1];
      
      const dx = Math.abs(h2.x - h1.x);
      const dy = Math.abs(h2.y - h1.y);
      
      if (dx > 0 && dx < 500) {
        spriteSamples.push({ type: 'width', value: dx });
      }
      if (dy > 0 && dy < 500) {
        spriteSamples.push({ type: 'height', value: dy });
      }
    }
  }
});

// Find most common dimensions
const dimensionCounts = {};
spriteSamples.forEach(sample => {
  const key = `${sample.type}:${sample.value}`;
  dimensionCounts[key] = (dimensionCounts[key] || 0) + 1;
});

const sortedDimensions = Object.entries(dimensionCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

console.log('  Most common sprite dimensions (estimated):');
sortedDimensions.forEach(([key, count]) => {
  const [type, value] = key.split(':');
  console.log(`    ${type}: ${value}px (${count} occurrences)`);
});
console.log();

// Estimate standard sprite size based on analysis
// Looking at the position ranges and sheet layout
const estimatedSpriteWidth = 256;  // Common size for character portraits
const estimatedSpriteHeight = 256;

console.log(`  📏 Estimated standard sprite size: ${estimatedSpriteWidth}x${estimatedSpriteHeight}px\n`);

// Create comprehensive mapping for the wiki
const heroSpriteMapping = {
  _metadata: {
    totalHeroes: spriteAnalysis.totalHeroes,
    heroesWithSprites: spriteAnalysis.heroesWithSprites,
    sheetCount: 33,
    estimatedSpriteSize: {
      width: estimatedSpriteWidth,
      height: estimatedSpriteHeight
    },
    sheetPath: 'images/heroes/hero-sprites-sheet{n}.webp',
    generatedAt: new Date().toISOString()
  },
  heroes: {}
};

// Add all heroes with sprite data
spriteAnalysis.heroes.forEach(hero => {
  heroSpriteMapping.heroes[hero.id] = {
    name: hero.name,
    nameEn: hero.nameEn,
    nameKo: hero.nameKo,
    sheet: hero.sprite.sheet,
    x: hero.sprite.x,
    y: hero.sprite.y,
    frame: hero.sprite.frame,
    // CSS background-position values (negative to position correctly)
    cssBackgroundPosition: `-${hero.sprite.x}px -${hero.sprite.y}px`,
    // Alternative: use transform for better performance
    cssTransform: `translate(-${hero.sprite.x}px, -${hero.sprite.y}px)`
  };
});

// Save the mapping
const outputDir = path.join(__dirname, '../../public/images/heroes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'hero-sprite-mapping.json');
fs.writeFileSync(outputPath, JSON.stringify(heroSpriteMapping, null, 2));

console.log(`✅ Saved comprehensive sprite mapping to: ${path.relative(path.join(__dirname, '..'), outputPath)}`);
console.log(`   Total heroes mapped: ${Object.keys(heroSpriteMapping.heroes).length}\n`);

// Generate sample CSS for using the sprites
const sampleCSS = `
/* Sample CSS for displaying hero sprites */

.hero-sprite {
  display: inline-block;
  width: ${estimatedSpriteWidth}px;
  height: ${estimatedSpriteHeight}px;
  overflow: hidden;
  position: relative;
}

.hero-sprite-image {
  width: auto;
  height: auto;
  position: absolute;
  top: 0;
  left: 0;
  /* Use background-position from the mapping */
  /* For hero ID 1 (张角): */
  background-image: url('/images/heroes/hero-sprites-sheet32.webp');
  background-position: -74px -10px;
  background-repeat: no-repeat;
  width: ${estimatedSpriteWidth}px;
  height: ${estimatedSpriteHeight}px;
}

/* Or use IMG with clip-path (better performance for many images) */
.hero-sprite img {
  position: absolute;
  /* Use transform from the mapping */
  /* For hero ID 1 (张角): */
  transform: translate(-74px, -10px);
}
`;

const cssOutputPath = path.join(outputDir, 'hero-sprite-example.css');
fs.writeFileSync(cssOutputPath, sampleCSS);

console.log(`📝 Saved sample CSS to: ${path.relative(path.join(__dirname, '..'), cssOutputPath)}\n`);

// Generate a React component example
const reactComponent = `import React from 'react';
import heroSpriteMapping from './hero-sprite-mapping.json';

/**
 * HeroSprite Component
 * Displays a hero portrait from sprite sheets
 */
export const HeroSprite = ({ heroId, size = 64, className = '' }) => {
  const sprite = heroSpriteMapping.heroes[heroId];
  
  if (!sprite) {
    return <div className={\`hero-sprite-placeholder \${className}\`} style={{ width: size, height: size }} />;
  }
  
  const sheetUrl = \`/images/heroes/hero-sprites-sheet\${sprite.sheet}.webp\`;
  const scale = size / heroSpriteMapping._metadata.estimatedSpriteSize.width;
  
  return (
    <div 
      className={\`hero-sprite \${className}\`}
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        position: 'relative'
      }}
      title={sprite.nameEn}
    >
      <img
        src={sheetUrl}
        alt={sprite.nameEn}
        style={{
          position: 'absolute',
          transform: \`translate(-\${sprite.x * scale}px, -\${sprite.y * scale}px) scale(\${scale})\`,
          transformOrigin: '0 0',
          imageRendering: 'auto'
        }}
        loading="lazy"
      />
    </div>
  );
};

export default HeroSprite;
`;

const componentOutputPath = path.join(__dirname, '../../src/components/HeroSprite.jsx');
fs.writeFileSync(componentOutputPath, reactComponent);

console.log(`⚛️  Generated React component: ${path.relative(path.join(__dirname, '..'), componentOutputPath)}\n`);

// Create a reference HTML file
const htmlReference = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hero Sprite Reference</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #1a1a1a;
      color: #fff;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .hero-card {
      text-align: center;
      background: #2a2a2a;
      padding: 10px;
      border-radius: 8px;
    }
    .hero-sprite {
      width: 128px;
      height: 128px;
      overflow: hidden;
      position: relative;
      margin: 0 auto;
      background: #000;
      border-radius: 4px;
    }
    .hero-sprite img {
      position: absolute;
      image-rendering: auto;
    }
    .hero-name {
      margin-top: 10px;
      font-size: 14px;
    }
    .hero-id {
      color: #888;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Hero Sprite Reference (First 50 Heroes)</h1>
  <div class="hero-grid" id="heroGrid"></div>
  
  <script>
    // Load the sprite mapping
    fetch('/images/heroes/hero-sprite-mapping.json')
      .then(res => res.json())
      .then(data => {
        const grid = document.getElementById('heroGrid');
        const heroes = Object.entries(data.heroes).slice(0, 50);
        
        heroes.forEach(([id, hero]) => {
          const card = document.createElement('div');
          card.className = 'hero-card';
          
          const sprite = document.createElement('div');
          sprite.className = 'hero-sprite';
          
          const img = document.createElement('img');
          const sheetUrl = \`/images/heroes/角色形象-sheet\${hero.sheet}.webp\`;
          img.src = sheetUrl;
          img.style.transform = \`translate(-\${hero.x}px, -\${hero.y}px)\`;
          
          sprite.appendChild(img);
          
          const name = document.createElement('div');
          name.className = 'hero-name';
          name.textContent = hero.nameEn || hero.name;
          
          const idDiv = document.createElement('div');
          idDiv.className = 'hero-id';
          idDiv.textContent = \`ID: \${id} | Sheet: \${hero.sheet} | Frame: \${hero.frame}\`;
          
          card.appendChild(sprite);
          card.appendChild(name);
          card.appendChild(idDiv);
          grid.appendChild(card);
        });
      });
  </script>
</body>
</html>
`;

const htmlOutputPath = path.join(outputDir, 'reference.html');
fs.writeFileSync(htmlOutputPath, htmlReference);

console.log(`🌐 Generated HTML reference: ${path.relative(path.join(__dirname, '..'), htmlOutputPath)}\n`);

// Summary
console.log('✨ Datamining Complete!\n');
console.log('📦 Generated Files:');
console.log('  1. hero-sprite-mapping.json - Complete mapping of all heroes');
console.log('  2. hero-sprite-example.css - Sample CSS for sprites');
console.log('  3. ../src/components/HeroSprite.jsx - React component');
console.log('  4. reference.html - Visual reference of heroes\n');

console.log('🚀 Next Steps:');
console.log('  1. Copy sprite sheets: npm run copy-sprites');
console.log('  2. Import HeroSprite in your components');
console.log('  3. Use: <HeroSprite heroId={1} size={64} />');
console.log('  4. Open reference.html to see all heroes\n');

console.log('💡 Usage Example:');
console.log('  import { HeroSprite } from "./components/HeroSprite";');
console.log('  <HeroSprite heroId={1} size={128} className="my-hero" />\n');

