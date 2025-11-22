/**
 * Sprite Map Builder
 * Builds spriteMap.json from package/data.json
 * Maps hero.id to sprite coordinates (with frame selection)
 */

const fs = require('fs');
const path = require('path');

class SpriteMapBuilder {
  constructor(options = {}) {
    this.options = {
      packagePath: path.join(__dirname, '../../../package'),
      preferredFrame: 1, // Frame 1 is typically the basic pose
      ...options
    };
    
    this.spritesByHero = {}; // { heroName: [sprite1, sprite2, ...] }
    this.spriteMap = null;
  }

  /**
   * Parse all sprites from data.json
   */
  parseSpritesFromDataJson() {
    try {
      const dataPath = path.join(this.options.packagePath, 'data.json');
      
      if (!fs.existsSync(dataPath)) {
        console.error('❌ data.json not found');
        return false;
      }
      
      console.log('🔍 Parsing sprites from data.json...');
      const content = fs.readFileSync(dataPath, 'utf8');
      
      // Extract ALL sprites for each hero name
      // Pattern: "HeroName",num,false,num,num,false,num,[["images/角色形象-sheetN.webp",size,x,y,width,height,rotated,frame,pivotX,pivotY
      const pattern = /"([\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ffa-zA-Z0-9\s]+)",\d+,false,\d+,\d+,false,\d+,\[\["images\/角色形象-sheet(\d+)\.webp",\d+,(\d+),(\d+),(\d+),(\d+),(true|false),(\d+),([^,]+),([^,]+),/g;
      
      let match;
      let totalCount = 0;
      
      while ((match = pattern.exec(content))) {
        const [, heroName, sheet, x, y, width, height, rotated, frame, pivotX, pivotY] = match;
        
        const sprite = {
          sheet: parseInt(sheet),
          x: parseInt(x),
          y: parseInt(y),
          width: parseInt(width),
          height: parseInt(height),
          rotated: rotated === 'true',
          frame: parseInt(frame),
          pivotX: parseFloat(pivotX),
          pivotY: parseFloat(pivotY)
        };
        
        // Collect all sprites for this hero
        if (!this.spritesByHero[heroName]) {
          this.spritesByHero[heroName] = [];
        }
        this.spritesByHero[heroName].push(sprite);
        totalCount++;
      }
      
      console.log(`   ✅ Found ${totalCount} total sprites for ${Object.keys(this.spritesByHero).length} unique hero names\n`);
      return true;
      
    } catch (error) {
      console.error('❌ Error parsing data.json:', error.message);
      return false;
    }
  }

  /**
   * Select best sprite for each hero
   * Strategy: Choose frame 1 (basic pose), or smallest frame if frame 1 doesn't exist
   */
  selectBestSprites() {
    const spriteMap = {};
    const selectionLog = [];
    
    for (const heroName in this.spritesByHero) {
      const sprites = this.spritesByHero[heroName];
      
      // Sort by frame number
      sprites.sort((a, b) => a.frame - b.frame);
      
      // Try to find preferred frame (typically frame 1 = basic pose)
      let selectedSprite = sprites.find(s => s.frame === this.options.preferredFrame);
      
      // If preferred frame doesn't exist, use the smallest frame
      if (!selectedSprite) {
        selectedSprite = sprites[0];
      }
      
      spriteMap[heroName] = selectedSprite;
      
      // Log selection for heroes with multiple frames
      if (sprites.length > 1) {
        selectionLog.push({
          hero: heroName,
          totalFrames: sprites.length,
          availableFrames: sprites.map(s => s.frame),
          selected: selectedSprite.frame
        });
      }
    }
    
    return { spriteMap, selectionLog };
  }

  /**
   * Map hero names to hero IDs using parsed hero data
   */
  mapToHeroIds(heroes) {
    const spriteMapByName = {};
    
    // First, select best sprites by name
    const { spriteMap, selectionLog } = this.selectBestSprites();
    
    console.log('🔗 Mapping sprites to hero IDs...');
    
    const mappedSprites = {};
    let matchedCount = 0;
    let unmatchedHeroes = [];
    
    heroes.forEach(hero => {
      // Try to match by various name fields
      const namesToTry = [
        hero.nameCN,
        hero.displayName,
        hero.nameEN,
        hero.nameKO
      ].filter(Boolean);
      
      let matched = false;
      for (const name of namesToTry) {
        if (spriteMap[name]) {
          mappedSprites[hero.id] = spriteMap[name];
          matched = true;
          matchedCount++;
          break;
        }
      }
      
      if (!matched) {
        unmatchedHeroes.push({
          id: hero.id,
          nameCN: hero.nameCN,
          displayName: hero.displayName
        });
      }
    });
    
    console.log(`   ✅ Matched: ${matchedCount}/${heroes.length} heroes`);
    
    if (unmatchedHeroes.length > 0) {
      console.log(`   ⚠️  Unmatched: ${unmatchedHeroes.length} heroes`);
      if (unmatchedHeroes.length <= 10) {
        unmatchedHeroes.forEach(h => {
          console.log(`      - ID ${h.id}: ${h.nameCN} / ${h.displayName}`);
        });
      }
    }
    
    return {
      spriteMap: mappedSprites,
      selectionLog,
      matchedCount,
      unmatchedHeroes
    };
  }

  /**
   * Build and export sprite map
   */
  build(heroes, outputPath) {
    // Parse sprites from data.json
    if (!this.parseSpritesFromDataJson()) {
      return { success: false };
    }
    
    // Map to hero IDs
    const result = this.mapToHeroIds(heroes);
    
    // Print selection log for heroes with multiple frames
    if (result.selectionLog.length > 0) {
      console.log('\n📋 Heroes with multiple sprites (frame selection):');
      console.log('─'.repeat(80));
      result.selectionLog.slice(0, 15).forEach(log => {
        const frameList = log.availableFrames.join(', ');
        console.log(`  ${log.hero.padEnd(15)} | Frames: [${frameList}] → Selected: ${log.selected}`);
      });
      
      if (result.selectionLog.length > 15) {
        console.log(`  ... and ${result.selectionLog.length - 15} more heroes with multiple frames`);
      }
    }
    
    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save sprite map
    fs.writeFileSync(outputPath, JSON.stringify(result.spriteMap, null, 2));
    
    console.log(`\n💾 Saved sprite map to: ${path.relative(path.join(__dirname, '../..'), outputPath)}`);
    console.log(`   Total heroes: ${Object.keys(result.spriteMap).length}`);
    console.log(`   Heroes with multiple frames: ${result.selectionLog.length}`);
    
    return {
      success: true,
      spriteMap: result.spriteMap,
      matchedCount: result.matchedCount,
      unmatchedHeroes: result.unmatchedHeroes,
      selectionLog: result.selectionLog
    };
  }

  /**
   * Get sprite data for debugging
   */
  getSpritesByHero() {
    return this.spritesByHero;
  }
}

module.exports = SpriteMapBuilder;

