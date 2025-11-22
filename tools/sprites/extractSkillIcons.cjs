/**
 * Extract all skill icons from sprite sheet
 * 
 * Mapping logic:
 * 1. Parse data.json to extract sprite ID -> coordinates mapping
 * 2. Load skill.json to get skill.spriteId
 * 3. Match skill.spriteId with sprite ID from data.json
 * 4. Extract each icon using exact x,y coordinates
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Parse sprite ID -> coordinates mapping from data.json
 * Format: ["防御",5,false,1,0,false,211946584453841,[["images/技能图标-sheet0.webp",2997144,133,1,64,64,false,1,0.5,0.5,[],[],""]]]
 * Returns: Map<spriteId, {x, y, width, height}>
 */
function parseSpriteIdMap(sheetName) {
  const dataPath = path.join(__dirname, '../../../package_kor/data.json');
  console.log(`Parsing sprite ID mapping from data.json for "${sheetName}"...`);
  
  const content = fs.readFileSync(dataPath, 'utf8');
  const spriteMap = new Map();
  
  // Escape special regex characters
  const escapedName = sheetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Pattern: ["spriteId",...,[["images/sheetName",size,x,y,width,height,...]]]
  // Match the full array structure
  const pattern = new RegExp(`\\["([^"]+)",[^\\[]*\\[\\["images/${escapedName}",(\\d+),(\\d+),(\\d+),(\\d+),(\\d+)`, 'g');
  
  let match;
  let count = 0;
  
  while ((match = pattern.exec(content)) !== null) {
    const [, spriteId, size, x, y, width, height] = match;
    
    spriteMap.set(spriteId, {
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height)
    });
    count++;
  }
  
  console.log(`Found ${count} sprites mapped by ID\n`);
  return spriteMap;
}

async function extractSkillIcons() {
  const skillPath = path.join(__dirname, '../../data/extracted/skill.json');
  const jnPath = path.join(__dirname, '../../../package_kor/jn.json');
  const sheetName = '技能图标-sheet0.webp';
  const sheetPath = path.join(__dirname, '../../../package_kor/images', sheetName);
  const outputDir = path.join(__dirname, '../../public/images/skills');
  
  // Parse sprite ID -> coordinates mapping from data.json
  const spriteIdMap = parseSpriteIdMap(sheetName);
  
  if (spriteIdMap.size === 0) {
    throw new Error('No sprite coordinates found in data.json!');
  }
  
  // Load skill data
  const skillData = JSON.parse(fs.readFileSync(skillPath, 'utf8'));
  const jnData = JSON.parse(fs.readFileSync(jnPath, 'utf8'));
  
  console.log(`Loading ${jnData.data.length - 1} skills from jn.json`);
  console.log(`Skill.json has ${skillData.length} skills\n`);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Extract icon for each skill ID
  const iconMapping = {};
  let successCount = 0;
  let missingCount = 0;
  
  for (const skill of skillData) {
    const skillId = skill.id;
    const spriteId = skill.spriteId;
    
    // Get sprite coordinates by spriteId (try both string and number)
    const sprite = spriteIdMap.get(String(spriteId)) || spriteIdMap.get(spriteId);
    
    if (!sprite) {
      console.error(`✗ Skill ${skillId}: Sprite ID ${spriteId} (${typeof spriteId}) not found in data.json`);
      missingCount++;
      continue;
    }
    
    const outputPath = path.join(outputDir, `skill_${skillId}.webp`);
    
    try {
      await sharp(sheetPath)
        .extract({ left: sprite.x, top: sprite.y, width: sprite.width, height: sprite.height })
        .toFile(outputPath);
      
      successCount++;
      iconMapping[skillId] = { 
        skillId: skillId,
        spriteId: spriteId,
        x: sprite.x, 
        y: sprite.y, 
        width: sprite.width, 
        height: sprite.height 
      };
      
      if (successCount <= 10 || successCount === skillData.length) {
        console.log(`✓ Skill ${String(skillId).padStart(3)} (spriteId: ${spriteId}) → [${sprite.x}, ${sprite.y}]`);
      } else if (successCount === 11) {
        console.log(`  ... extracting remaining ${skillData.length - 10} skill icons ...`);
      }
    } catch (error) {
      console.error(`✗ Skill ${skillId}: ${error.message}`);
      missingCount++;
    }
  }
  
  if (missingCount > 0) {
    console.log(`\n⚠️  ${missingCount} skills could not be extracted`);
  }
  
  // Save mapping metadata
  const iconSize = Object.values(iconMapping)[0]?.width || 64;
  const mappingPath = path.join(outputDir, 'skill-icon-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify({
    _metadata: {
      generatedAt: new Date().toISOString(),
      spriteSheet: sheetName,
      iconSize: iconSize,
      totalSkills: skillData.length,
      totalIcons: Object.keys(iconMapping).length,
      mappingLogic: 'skill.spriteId → sprite ID in data.json'
    },
    icons: iconMapping
  }, null, 2));
  
  // Generate reference HTML
  await generateReferenceHTML(outputDir, iconMapping, skillData);
  
  console.log(`\n✓ Successfully extracted ${successCount}/${skillData.length} skill icons`);
  console.log(`✓ Saved to: ${outputDir}`);
  console.log(`✓ Mapping: ${mappingPath}`);
}

// Run if called directly
if (require.main === module) {
  extractSkillIcons().catch(console.error);
}

/**
 * Generate reference HTML file showing all extracted skill icons in order
 */
async function generateReferenceHTML(outputDir, iconMapping, skillData) {
  // Sort skill IDs numerically
  const sortedSkillIds = Object.keys(iconMapping)
    .map(id => parseInt(id))
    .sort((a, b) => a - b);
  
  // Build skill data map for additional info
  const skillDataMap = {};
  for (const skill of skillData) {
    skillDataMap[skill.id] = skill;
  }
  
  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skill Icons Reference</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #1a1a1a;
      color: #e0e0e0;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }
    
    .header h1 {
      color: #fff;
      margin-bottom: 10px;
    }
    
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 15px;
      font-size: 14px;
      color: #999;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .icon-card {
      background: #2a2a2a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .icon-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-color: #555;
    }
    
    .icon-card img {
      width: 64px;
      height: 64px;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      margin-bottom: 8px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    
    .icon-id {
      font-weight: bold;
      color: #4a9eff;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .icon-name {
      font-size: 11px;
      color: #aaa;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
    
    .icon-info {
      font-size: 10px;
      color: #666;
      margin-top: 4px;
    }
    
    .missing {
      opacity: 0.5;
      border-color: #444;
    }
    
    .missing img {
      filter: grayscale(100%);
    }
    
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 10px;
      }
      
      .icon-card img {
        width: 48px;
        height: 48px;
      }
      
      .icon-id {
        font-size: 12px;
      }
      
      .icon-name {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Skill Icons Reference</h1>
    <div class="stats">
      <span>Total Icons: ${sortedSkillIds.length}</span>
      <span>Generated: ${new Date().toLocaleString()}</span>
    </div>
  </div>
  
  <div class="grid">
${sortedSkillIds.map(skillId => {
  const mapping = iconMapping[skillId];
  const skill = skillDataMap[skillId];
  const iconPath = `skill_${skillId}.webp`;
  const nameCN = skill?.nameCN || '';
  const nameEN = skill?.nameEN || '';
  const displayName = nameEN || nameCN || `Skill ${skillId}`;
  
  return `    <div class="icon-card">
      <img src="${iconPath}" alt="Skill ${skillId}" loading="lazy" onerror="this.parentElement.classList.add('missing')">
      <div class="icon-id">#${skillId}</div>
      <div class="icon-name" title="${displayName}">${displayName}</div>
      ${mapping ? `<div class="icon-info">Sprite[${mapping.spriteIndex}]</div>` : ''}
    </div>`;
}).join('\n')}
  </div>
</body>
</html>`;
  
  const htmlPath = path.join(outputDir, 'reference.html');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`✓ Reference HTML: ${htmlPath}`);
}

module.exports = { extractSkillIcons };

