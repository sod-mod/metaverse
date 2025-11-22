const fs = require('fs');
const path = require('path');

/**
 * Analyze Face Anchor Positions within Sprites
 * 
 * 스프라이트 내에서 실제 얼굴의 앵커 포인트(중심점)를 추정합니다.
 * 게임 캐릭터는 보통 일정한 위치에 얼굴이 배치되어 있습니다.
 */

console.log('🔍 Analyzing Face Anchor Positions\n');

// Load heroes data
const heroesPath = path.join(__dirname, '../../data/extracted/hero.json');
const heroes = JSON.parse(fs.readFileSync(heroesPath, 'utf-8'));

const spriteSize = 256; // Estimated sprite size
const analysis = {
  heroes: [],
  patterns: {
    byFrame: {},
    bySheet: {},
    positionClusters: []
  }
};

console.log('📊 Analyzing sprite patterns for face anchor detection...\n');

// Process each hero
heroes.forEach(hero => {
  if (hero.sprite) {
    const sprite = hero.sprite;
    
    // Calculate potential face center within the sprite
    // 일반적으로 캐릭터 초상화는:
    // - 가로: 중앙에서 약간 오프셋 (보통 중심 ±10%)
    // - 세로: 상단 1/3 지점 (얼굴이 위쪽에 위치)
    
    const estimatedFaceAnchor = {
      // 스프라이트 원점에서의 오프셋
      offsetX: spriteSize * 0.5,  // 중앙
      offsetY: spriteSize * 0.35, // 상단 35% 지점 (일반적인 초상화)
      
      // 절대 좌표 (시트 내)
      absoluteX: sprite.x + (spriteSize * 0.5),
      absoluteY: sprite.y + (spriteSize * 0.35)
    };
    
    analysis.heroes.push({
      id: hero.id,
      name: hero.name,
      sprite: sprite,
      faceAnchor: estimatedFaceAnchor
    });
    
    // Group by frame for pattern detection
    if (!analysis.patterns.byFrame[sprite.frame]) {
      analysis.patterns.byFrame[sprite.frame] = [];
    }
    analysis.patterns.byFrame[sprite.frame].push({
      id: hero.id,
      x: sprite.x,
      y: sprite.y
    });
    
    // Group by sheet
    if (!analysis.patterns.bySheet[sprite.sheet]) {
      analysis.patterns.bySheet[sprite.sheet] = [];
    }
    analysis.patterns.bySheet[sprite.sheet].push({
      id: hero.id,
      x: sprite.x,
      y: sprite.y,
      frame: sprite.frame
    });
  }
});

console.log(`✅ Analyzed ${analysis.heroes.length} heroes\n`);

// Analyze position clustering to refine face anchor
console.log('🎯 Detecting position patterns...\n');

// Look for sheets with multiple heroes (can reveal grid patterns)
const multiHeroSheets = Object.entries(analysis.patterns.bySheet)
  .filter(([sheet, heroes]) => heroes.length >= 2)
  .map(([sheet, heroes]) => ({
    sheet: parseInt(sheet),
    count: heroes.length,
    heroes: heroes.sort((a, b) => a.frame - b.frame)
  }))
  .sort((a, b) => b.count - a.count);

console.log('📋 Sheets with multiple heroes (top 10):');
multiHeroSheets.slice(0, 10).forEach(sheet => {
  console.log(`\n  Sheet ${sheet.sheet}: ${sheet.count} heroes`);
  
  // Calculate spacing between heroes
  if (sheet.heroes.length >= 2) {
    const spacings = [];
    for (let i = 0; i < sheet.heroes.length - 1; i++) {
      const h1 = sheet.heroes[i];
      const h2 = sheet.heroes[i + 1];
      const dx = Math.abs(h2.x - h1.x);
      const dy = Math.abs(h2.y - h1.y);
      
      if (dx > 0 && dx < spriteSize * 2) {
        spacings.push({ type: 'horizontal', value: dx, heroes: [h1.id, h2.id] });
      }
      if (dy > 0 && dy < spriteSize * 2) {
        spacings.push({ type: 'vertical', value: dy, heroes: [h1.id, h2.id] });
      }
    }
    
    if (spacings.length > 0) {
      console.log('    Spacing patterns:');
      spacings.forEach(s => {
        console.log(`      ${s.type}: ${s.value}px between heroes ${s.heroes.join(' & ')}`);
      });
    }
  }
});

// Detect common spacing/grid patterns
console.log('\n\n🔍 Analyzing grid patterns...\n');

const allSpacings = {
  horizontal: [],
  vertical: []
};

multiHeroSheets.forEach(sheet => {
  for (let i = 0; i < sheet.heroes.length - 1; i++) {
    const h1 = sheet.heroes[i];
    const h2 = sheet.heroes[i + 1];
    const dx = Math.abs(h2.x - h1.x);
    const dy = Math.abs(h2.y - h1.y);
    
    if (dx > 0 && dx < spriteSize * 2) allSpacings.horizontal.push(dx);
    if (dy > 0 && dy < spriteSize * 2) allSpacings.vertical.push(dy);
  }
});

// Find most common spacings
const findMostCommon = (arr) => {
  const counts = {};
  arr.forEach(val => {
    const rounded = Math.round(val / 10) * 10; // Round to nearest 10
    counts[rounded] = (counts[rounded] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([val, count]) => ({ value: parseInt(val), count }));
};

const commonHorizontal = findMostCommon(allSpacings.horizontal);
const commonVertical = findMostCommon(allSpacings.vertical);

console.log('Most common horizontal spacings:');
commonHorizontal.forEach(s => {
  console.log(`  ${s.value}px (${s.count} occurrences)`);
});

console.log('\nMost common vertical spacings:');
commonVertical.forEach(s => {
  console.log(`  ${s.value}px (${s.count} occurrences)`);
});

// Estimate face anchor based on patterns
console.log('\n\n🎯 Face Anchor Position Estimation:\n');

// If we see common spacings, the face center is likely in the middle of that spacing
const estimatedFaceWidth = commonHorizontal.length > 0 ? commonHorizontal[0].value : spriteSize;
const estimatedFaceHeight = commonVertical.length > 0 ? commonVertical[0].value : spriteSize;

console.log(`Estimated face region size: ${estimatedFaceWidth}×${estimatedFaceHeight}px`);

// Face anchor is typically:
// - Horizontally: center of face region
// - Vertically: at eye level (about 40-45% from top of face region)
const faceAnchorOffset = {
  x: estimatedFaceWidth * 0.5,   // 얼굴 가로 중심
  y: estimatedFaceHeight * 0.40  // 눈 높이 (얼굴 상단에서 40%)
};

console.log(`\nFace anchor offset from sprite origin:`);
console.log(`  X: ${faceAnchorOffset.x.toFixed(1)}px (center of face)`);
console.log(`  Y: ${faceAnchorOffset.y.toFixed(1)}px (eye level)`);

// Additional analysis: look at frame numbers vs positions
console.log('\n\n📊 Frame Number Analysis:\n');

const framePositions = Object.entries(analysis.patterns.byFrame)
  .map(([frame, heroes]) => ({
    frame: parseInt(frame),
    count: heroes.length,
    avgX: heroes.reduce((sum, h) => sum + h.x, 0) / heroes.length,
    avgY: heroes.reduce((sum, h) => sum + h.y, 0) / heroes.length
  }))
  .sort((a, b) => a.frame - b.frame);

console.log('Frame number correlation with position (sample):');
framePositions.slice(0, 10).forEach(f => {
  console.log(`  Frame ${String(f.frame).padStart(3)}: ${f.count} hero(es), avg pos (${f.avgX.toFixed(0)}, ${f.avgY.toFixed(0)})`);
});

// Generate enhanced mapping with face anchors
console.log('\n\n💾 Generating enhanced sprite mapping with face anchors...\n');

const enhancedMapping = {
  _metadata: {
    totalHeroes: analysis.heroes.length,
    spriteSize: {
      width: spriteSize,
      height: spriteSize
    },
    faceAnchor: {
      description: "얼굴의 중심점 (눈 높이) - 스프라이트 원점으로부터의 오프셋",
      offsetX: faceAnchorOffset.x,
      offsetY: faceAnchorOffset.y,
      method: "pattern analysis + common portrait layouts"
    },
    estimatedFaceRegion: {
      width: estimatedFaceWidth,
      height: estimatedFaceHeight
    },
    sheetPath: "images/heroes/角色形象-sheet{n}.webp",
    generatedAt: new Date().toISOString()
  },
  heroes: {}
};

analysis.heroes.forEach(hero => {
  enhancedMapping.heroes[hero.id] = {
    name: hero.name,
    sprite: {
      sheet: hero.sprite.sheet,
      x: hero.sprite.x,
      y: hero.sprite.y,
      frame: hero.sprite.frame,
      width: spriteSize,
      height: spriteSize
    },
    faceAnchor: {
      // 스프라이트 내에서의 상대 위치
      relativeX: faceAnchorOffset.x,
      relativeY: faceAnchorOffset.y,
      
      // 시트 내에서의 절대 위치
      absoluteX: hero.sprite.x + faceAnchorOffset.x,
      absoluteY: hero.sprite.y + faceAnchorOffset.y,
      
      // CSS용 (얼굴 중심을 기준으로 표시하기 위한 값)
      cssTransform: `translate(-${hero.sprite.x + faceAnchorOffset.x}px, -${hero.sprite.y + faceAnchorOffset.y}px)`
    }
  };
});

// Save enhanced mapping
const outputPath = path.join(__dirname, '../../public/images/heroes/hero-sprite-mapping-with-anchors.json');
fs.writeFileSync(outputPath, JSON.stringify(enhancedMapping, null, 2));

console.log(`✅ Saved enhanced mapping to: hero-sprite-mapping-with-anchors.json`);
console.log(`   Total heroes: ${Object.keys(enhancedMapping.heroes).length}\n`);

// Generate visualization HTML with face anchor markers
const visualizationHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hero Face Anchor Analysis</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #1a1a1a;
      color: #fff;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .hero-card {
      background: #2a2a2a;
      padding: 15px;
      border-radius: 8px;
    }
    .hero-sprite-container {
      width: 256px;
      height: 256px;
      position: relative;
      margin: 0 auto;
      background: #000;
      border: 2px solid #444;
    }
    .hero-sprite {
      width: 256px;
      height: 256px;
      overflow: hidden;
      position: relative;
    }
    .hero-sprite img {
      position: absolute;
      image-rendering: auto;
    }
    .face-anchor {
      position: absolute;
      width: 20px;
      height: 20px;
      background: rgba(255, 0, 0, 0.7);
      border: 2px solid #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 10;
    }
    .face-anchor::before,
    .face-anchor::after {
      content: '';
      position: absolute;
      background: rgba(255, 255, 255, 0.5);
    }
    .face-anchor::before {
      width: 2px;
      height: 40px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .face-anchor::after {
      width: 40px;
      height: 2px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .hero-info {
      margin-top: 10px;
      font-size: 14px;
    }
    .hero-name {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 5px;
    }
    .anchor-coords {
      color: #ff6b6b;
      font-family: monospace;
      font-size: 12px;
    }
    .info-panel {
      background: #2a2a2a;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>🎯 Hero Face Anchor Analysis</h1>
  
  <div class="info-panel">
    <h2>Face Anchor Information</h2>
    <p><strong>Red crosshair</strong> = Estimated face center (eye level)</p>
    <p><strong>Offset from sprite origin:</strong> (${faceAnchorOffset.x.toFixed(1)}px, ${faceAnchorOffset.y.toFixed(1)}px)</p>
    <p><strong>Estimated face region:</strong> ${estimatedFaceWidth}×${estimatedFaceHeight}px</p>
    <p><strong>Method:</strong> Pattern analysis from ${multiHeroSheets.length} multi-hero sheets</p>
  </div>
  
  <div class="hero-grid" id="heroGrid"></div>
  
  <script>
    fetch('/images/heroes/hero-sprite-mapping-with-anchors.json')
      .then(res => res.json())
      .then(data => {
        const grid = document.getElementById('heroGrid');
        const heroes = Object.entries(data.heroes).slice(0, 20);
        
        heroes.forEach(([id, hero]) => {
          const card = document.createElement('div');
          card.className = 'hero-card';
          
          const container = document.createElement('div');
          container.className = 'hero-sprite-container';
          
          const sprite = document.createElement('div');
          sprite.className = 'hero-sprite';
          
          const img = document.createElement('img');
          const sheetUrl = \`/images/heroes/角色形象-sheet\${hero.sprite.sheet}.webp\`;
          img.src = sheetUrl;
          img.style.transform = \`translate(-\${hero.sprite.x}px, -\${hero.sprite.y}px)\`;
          
          sprite.appendChild(img);
          
          // Add face anchor marker
          const anchor = document.createElement('div');
          anchor.className = 'face-anchor';
          anchor.style.left = \`\${hero.faceAnchor.relativeX}px\`;
          anchor.style.top = \`\${hero.faceAnchor.relativeY}px\`;
          
          container.appendChild(sprite);
          container.appendChild(anchor);
          
          const info = document.createElement('div');
          info.className = 'hero-info';
          
          const name = document.createElement('div');
          name.className = 'hero-name';
          name.textContent = \`#\${id}: \${hero.name}\`;
          
          const coords = document.createElement('div');
          coords.className = 'anchor-coords';
          coords.innerHTML = \`
            Sprite: (\${hero.sprite.x}, \${hero.sprite.y})<br>
            Face anchor: (\${hero.faceAnchor.relativeX.toFixed(1)}, \${hero.faceAnchor.relativeY.toFixed(1)})<br>
            Sheet: \${hero.sprite.sheet}, Frame: \${hero.sprite.frame}
          \`;
          
          info.appendChild(name);
          info.appendChild(coords);
          
          card.appendChild(container);
          card.appendChild(info);
          grid.appendChild(card);
        });
      });
  </script>
</body>
</html>
`;

const htmlPath = path.join(__dirname, '../../public/images/heroes/face-anchor-analysis.html');
fs.writeFileSync(htmlPath, visualizationHTML);

console.log(`🌐 Generated visualization: face-anchor-analysis.html\n`);

// Create updated HeroSprite component with face anchor support
const componentCode = `import React, { useState } from 'react';
import heroMapping from '../../public/images/heroes/hero-sprite-mapping-with-anchors.json';

/**
 * HeroSprite Component with Face Anchor Support
 * Displays hero portrait centered on the face anchor point
 */
export const HeroSpriteWithAnchor = ({ 
  heroId, 
  size = 64, 
  className = '',
  showAnchor = false  // 디버깅용: 앵커 포인트 표시
}) => {
  const [spriteError, setSpriteError] = useState(false);
  const hero = heroMapping.heroes[heroId];
  
  if (!hero || spriteError) {
    return (
      <div 
        className={\`hero-sprite-placeholder \${className}\`} 
        style={{ width: size, height: size, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        #{heroId}
      </div>
    );
  }
  
  const sheetUrl = \`/images/heroes/角色形象-sheet\${hero.sprite.sheet}.webp\`;
  const scale = size / heroMapping._metadata.spriteSize.width;
  
  // 얼굴 중심을 기준으로 표시
  const faceAnchor = hero.faceAnchor;
  
  return (
    <div 
      className={\`hero-sprite \${className}\`}
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        position: 'relative',
      }}
      title={\`\${hero.name} (Face Anchor: \${faceAnchor.relativeX.toFixed(0)}, \${faceAnchor.relativeY.toFixed(0)})\`}
    >
      <img
        src={sheetUrl}
        alt={hero.name}
        style={{
          position: 'absolute',
          // 얼굴 앵커를 중심으로 배치
          left: \`\${size / 2}px\`,
          top: \`\${size / 2}px\`,
          transform: \`translate(-\${faceAnchor.absoluteX * scale}px, -\${faceAnchor.absoluteY * scale}px) scale(\${scale})\`,
          transformOrigin: '0 0',
          imageRendering: 'auto',
        }}
        onError={() => setSpriteError(true)}
        loading="lazy"
      />
      
      {showAnchor && (
        <div 
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '10px',
            height: '10px',
            background: 'red',
            border: '2px solid white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
};

export default HeroSpriteWithAnchor;
`;

const componentPath = path.join(__dirname, '../../src/components/HeroSpriteWithAnchor.jsx');
fs.writeFileSync(componentPath, componentCode);

console.log(`⚛️  Generated React component: HeroSpriteWithAnchor.jsx\n`);

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('✨ Face Anchor Analysis Complete!\n');
console.log('📊 Results:');
console.log(`   • Analyzed ${analysis.heroes.length} heroes`);
console.log(`   • Estimated face anchor offset: (${faceAnchorOffset.x.toFixed(1)}, ${faceAnchorOffset.y.toFixed(1)}) px`);
console.log(`   • Estimated face region: ${estimatedFaceWidth}×${estimatedFaceHeight} px`);
console.log(`   • Pattern analysis from ${multiHeroSheets.length} multi-hero sheets\n`);

console.log('📦 Generated Files:');
console.log('   1. hero-sprite-mapping-with-anchors.json - Enhanced mapping');
console.log('   2. face-anchor-analysis.html - Visual analysis');
console.log('   3. HeroSpriteWithAnchor.jsx - React component\n');

console.log('🎯 Usage:');
console.log('   import { HeroSpriteWithAnchor } from "./components/HeroSpriteWithAnchor";');
console.log('   <HeroSpriteWithAnchor heroId={1} size={128} showAnchor={true} />\n');

console.log('🌐 View Analysis:');
console.log('   Open: public/images/heroes/face-anchor-analysis.html\n');

