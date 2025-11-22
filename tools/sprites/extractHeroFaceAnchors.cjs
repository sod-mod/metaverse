/**
 * Extract Hero Face Anchor Points
 * 
 * This script extracts the precise face anchor points for each hero sprite
 * by combining sprite coordinates from heroes.json with image points from data.json
 */

const fs = require('fs');
const path = require('path');

// Paths
const WIKI_ROOT = path.join(__dirname, '..');
const HEROES_JSON = path.join(WIKI_ROOT, 'src', 'data', 'heroes.json');
const PACKAGE_DATA = path.join(WIKI_ROOT, '..', 'package', 'data.json');
const OUTPUT_FILE = path.join(WIKI_ROOT, 'public', 'images', 'heroes', 'hero-face-anchors.json');

console.log('🎯 Extracting Hero Face Anchor Points\n');

// Step 1: Load heroes data
console.log('📖 Loading heroes data...');
const heroes = JSON.parse(fs.readFileSync(HEROES_JSON, 'utf8'));
console.log(`   Found ${heroes.length} heroes\n`);

// Step 2: Parse sprite image points from data.json
console.log('🔍 Parsing sprite image points from package data...');
console.log('   (This may take a moment due to large file size)\n');

// Read the data.json file in chunks to find the sprite definitions
const dataContent = fs.readFileSync(PACKAGE_DATA, 'utf8');

// Find the "角色形象" (Hero Portrait) sprite definition section
const spriteDefMatch = dataContent.match(/"角色形象"[^[]*\[([^\]]+(?:\[[^\]]*\][^\]]*)*)\]/);

if (!spriteDefMatch) {
  console.error('❌ Could not find sprite definition in data.json');
  process.exit(1);
}

console.log('✅ Found sprite definition section\n');

// Step 3: Extract all sprite animations and their image points
console.log('🎨 Extracting sprite animations and image points...');

// Parse sprite animation definitions
const animationPattern = /\["([^"]+)",5,false,1,0,false,\d+,\[\["images\/角色形象-sheet(\d+)\.webp",\d+,(\d+),(\d+),(\d+),(\d+),[^,]+,[^,]+,[^,]+,[^,]+,(\[[^\]]*(?:\[[^\]]*\][^\]]*)*\])/g;

const spriteMap = {};
let match;

while ((match = animationPattern.exec(dataContent)) !== null) {
  const [_, heroName, sheet, x, y, width, height, imagePointsStr] = match;
  
  try {
    // Parse image points array
    let imagePoints = [];
    if (imagePointsStr && imagePointsStr.trim() !== '[]') {
      // Try to parse the image points
      const pointsMatch = imagePointsStr.match(/\["[^"]+",[\d.]+,[\d.]+\]/g);
      if (pointsMatch) {
        imagePoints = pointsMatch.map(pointStr => {
          const [name, xRatio, yRatio] = pointStr
            .slice(2, -1) // Remove ["  and ]
            .split(/",|,/)
            .map((s, i) => i === 0 ? s : parseFloat(s));
          return { name, x: xRatio, y: yRatio };
        });
      }
    }
    
    spriteMap[heroName] = {
      sheet: parseInt(sheet),
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
      imagePoints
    };
  } catch (err) {
    console.warn(`   ⚠️  Could not parse image points for ${heroName}`);
  }
}

console.log(`   Found ${Object.keys(spriteMap).length} sprite definitions\n`);

// Step 4: Match heroes with their sprite data and calculate face anchors
console.log('🧩 Matching heroes with sprite data...');

const heroAnchors = {};
let matchedCount = 0;
let unmatchedHeroes = [];

heroes.forEach(hero => {
  const heroName = hero.name; // Chinese name
  
  if (spriteMap[heroName]) {
    const spriteData = spriteMap[heroName];
    
    // Calculate absolute pixel positions for each image point
    const anchors = spriteData.imagePoints.map(point => ({
      name: point.name,
      // Relative to sprite origin (top-left)
      relativeX: point.x,
      relativeY: point.y,
      // Absolute pixel position within the sprite
      pixelX: Math.round(point.x * spriteData.width),
      pixelY: Math.round(point.y * spriteData.height)
    }));
    
    // Find the "face center" - usually "Image Point 1" or calculate from available points
    let faceCenter = { x: 0.5, y: 0.4 }; // Default: center-top
    
    if (anchors.length > 0) {
      // "Image Point 1" is typically the center
      const centerPoint = anchors.find(a => a.name === "Image Point 1");
      if (centerPoint) {
        faceCenter = {
          x: centerPoint.relativeX,
          y: centerPoint.relativeY
        };
      }
    }
    
    heroAnchors[hero.id] = {
      heroId: hero.id,
      name: hero.name,
      nameEn: hero.names?.en || '',
      nameKo: hero.names?.ko || '',
      sheet: spriteData.sheet,
      spriteX: spriteData.x,
      spriteY: spriteData.y,
      spriteWidth: spriteData.width,
      spriteHeight: spriteData.height,
      faceCenter: {
        relativeX: faceCenter.x,
        relativeY: faceCenter.y,
        pixelX: Math.round(faceCenter.x * spriteData.width),
        pixelY: Math.round(faceCenter.y * spriteData.height)
      },
      imagePoints: anchors,
      // CSS positioning for face center
      cssBackgroundPosition: `-${spriteData.x + Math.round(faceCenter.x * spriteData.width)}px -${spriteData.y + Math.round(faceCenter.y * spriteData.height)}px`,
      cssTransform: `translate(-${spriteData.x + Math.round(faceCenter.x * spriteData.width)}px, -${spriteData.y + Math.round(faceCenter.y * spriteData.height)}px)`
    };
    
    matchedCount++;
  } else {
    unmatchedHeroes.push({ id: hero.id, name: heroName });
  }
});

console.log(`   ✅ Matched: ${matchedCount} heroes`);
console.log(`   ❌ Unmatched: ${unmatchedHeroes.length} heroes\n`);

if (unmatchedHeroes.length > 0 && unmatchedHeroes.length < 10) {
  console.log('Unmatched heroes:');
  unmatchedHeroes.forEach(h => console.log(`   - ${h.name} (ID: ${h.id})`));
  console.log('');
}

// Step 5: Generate output JSON
console.log('💾 Generating output file...\n');

const output = {
  _metadata: {
    generatedAt: new Date().toISOString(),
    totalHeroes: heroes.length,
    matchedHeroes: matchedCount,
    unmatchedHeroes: unmatchedHeroes.length,
    description: "Hero face anchor points extracted from sprite sheets. Each hero has face center coordinates relative to their sprite, plus all available image points.",
    usage: {
      faceCenter: "The faceCenter property indicates where the hero's face is positioned within the sprite (0-1 range, where 0.5,0.5 is center)",
      imagePoints: "Additional anchor points defined in the game engine (e.g., attachment points, origin points)",
      cssBackgroundPosition: "CSS background-position to center the face (for use with background-image)",
      cssTransform: "CSS transform to center the face (for use with img element)"
    }
  },
  heroes: heroAnchors,
  unmatchedHeroes: unmatchedHeroes.length > 0 ? unmatchedHeroes : undefined
};

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

console.log(`✅ Saved face anchor data to: ${path.relative(WIKI_ROOT, OUTPUT_FILE)}`);
console.log(`   Total size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB\n`);

// Step 6: Generate summary statistics
console.log('📊 Face Anchor Statistics:\n');

const anchorStats = {
  totalImagePoints: 0,
  heroesWithImagePoints: 0,
  avgImagePointsPerHero: 0
};

Object.values(heroAnchors).forEach(hero => {
  if (hero.imagePoints.length > 0) {
    anchorStats.heroesWithImagePoints++;
    anchorStats.totalImagePoints += hero.imagePoints.length;
  }
});

if (anchorStats.heroesWithImagePoints > 0) {
  anchorStats.avgImagePointsPerHero = (anchorStats.totalImagePoints / anchorStats.heroesWithImagePoints).toFixed(2);
}

console.log(`   Heroes with image points: ${anchorStats.heroesWithImagePoints}`);
console.log(`   Total image points: ${anchorStats.totalImagePoints}`);
console.log(`   Average points per hero: ${anchorStats.avgImagePointsPerHero}`);

console.log('\n✨ Face Anchor Extraction Complete!\n');

