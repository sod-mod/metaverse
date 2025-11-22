/**
 * Sprite Coordinate Generator
 * Extracts sprite sheet coordinates from package/data.json
 * 
 * Based on extractHeroFaceAnchors.cjs logic:
 * - Parses data.json to find sprite definitions
 * - Extracts sheet, x, y, width, height for each hero
 * - Calculates face anchor points from image points
 */

const fs = require('fs');
const path = require('path');

class SpriteCoordinateGenerator {
  constructor(options = {}) {
    this.options = {
      packagePath: path.join(__dirname, '../../../package'),
      ...options
    };
    
    // Cache for sprite data
    this.spriteCache = new Map();
    this.spriteMap = null;
    
    // Load sprite data from data.json
    this.loadSpriteData();
  }

  /**
   * Load sprite data from public/spriteMap.json
   * This file contains sprite coordinates indexed by spriteId
   */
  loadSpriteData() {
    try {
      // Try to load from public/spriteMap.json first
      const spriteMapPath = path.join(__dirname, '../../public/spriteMap.json');
      
      if (fs.existsSync(spriteMapPath)) {
        console.log('📖 Loading sprite data from spriteMap.json...');
        const spriteMapData = JSON.parse(fs.readFileSync(spriteMapPath, 'utf8'));
        
        this.spriteMap = {};
        let count = 0;
        
        // Convert spriteMap to our format
        for (const [spriteId, data] of Object.entries(spriteMapData)) {
          // Calculate face center from pivot
          const faceCenter = {
            x: data.pivotX || 0.5,
            y: (data.pivotY || 0.5) * 0.7 // Adjust pivot to face level (70% of pivot height)
          };
          
          this.spriteMap[spriteId] = {
            sheet: data.sheet,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            rotated: data.rotated || false,
            frame: data.frame,
            pivotX: data.pivotX,
            pivotY: data.pivotY,
            faceCenter,
            imagePoints: []
          };
          count++;
        }
        
        console.log(`   ✅ Loaded ${count} sprite definitions from spriteMap.json`);
        return;
      }
      
      // Fallback: try to load from data.json
      console.log('📖 Loading sprite data from data.json...');
      const dataPath = path.join(this.options.packagePath, 'data.json');
      
      if (!fs.existsSync(dataPath)) {
        console.warn('⚠️  Neither spriteMap.json nor data.json found');
        return;
      }
      const dataContent = fs.readFileSync(dataPath, 'utf8');
      
      // Find the "角色形象" (Hero Portrait) sprite definition section
      const spriteDefMatch = dataContent.match(/"角色形象"[^[]*\[([^\]]+(?:\[[^\]]*\][^\]]*)*)\]/);
      
      if (!spriteDefMatch) {
        console.warn('⚠️  Could not find sprite definition in data.json');
        return;
      }
      
      // Parse sprite animation definitions
      // Format: ["HeroName",5,false,1,0,false,frame,[["images/角色形象-sheetN.webp",guid,x,y,width,height,rotated,...,imagePoints]]]
      const animationPattern = /\["([^"]+)",5,false,1,0,false,(\d+),\[\["images\/角色形象-sheet(\d+)\.webp",\d+,(\d+),(\d+),(\d+),(\d+),([^,]+),([^,]+),[^,]+,[^,]+,(\[[^\]]*(?:\[[^\]]*\][^\]]*)*\])/g;
      
      this.spriteMap = {};
      let match;
      let count = 0;
      
      while ((match = animationPattern.exec(dataContent)) !== null) {
        const [_, heroName, frame, sheet, x, y, width, height, rotated, pivotX, imagePointsStr] = match;
        
        try {
          // Parse image points array for face anchor
          let imagePoints = [];
          if (imagePointsStr && imagePointsStr.trim() !== '[]') {
            const pointsMatch = imagePointsStr.match(/\["[^"]+",[\d.]+,[\d.]+\]/g);
            if (pointsMatch) {
              imagePoints = pointsMatch.map(pointStr => {
                const parts = pointStr.slice(2, -1).split(/",|,/);
                return {
                  name: parts[0],
                  x: parseFloat(parts[1]),
                  y: parseFloat(parts[2])
                };
              });
            }
          }
          
          // Find face center from image points (typically "Image Point 1")
          let faceCenter = { x: 0.5, y: 0.35 }; // Default: center-top
          const centerPoint = imagePoints.find(p => p.name === "Image Point 1");
          if (centerPoint) {
            faceCenter = { x: centerPoint.x, y: centerPoint.y };
          }
          
          this.spriteMap[heroName] = {
            sheet: parseInt(sheet),
            x: parseInt(x),
            y: parseInt(y),
            width: parseInt(width),
            height: parseInt(height),
            rotated: rotated === 'true',
            frame: parseInt(frame),
            pivotX: parseFloat(pivotX),
            imagePoints,
            faceCenter
          };
          
          count++;
        } catch (err) {
          console.warn(`   ⚠️  Could not parse sprite data for ${heroName}: ${err.message}`);
        }
      }
      
      console.log(`   ✅ Loaded ${count} sprite definitions from data.json`);
      
    } catch (error) {
      console.warn('⚠️  Error loading sprite data:', error.message);
      this.spriteMap = null;
    }
  }

  /**
   * Get sprite coordinates for a hero
   * @param {Object} hero - Hero object with nameCN, displayName, etc.
   * @returns {Object} Sprite coordinates {sheet, x, y, frame, width, height, faceCenter}
   */
  getSpriteCoordinates(hero) {
    const spriteId = hero.spriteId;
    
    // Check cache
    if (this.spriteCache.has(spriteId)) {
      return this.spriteCache.get(spriteId);
    }
    
    // Try to find in sprite map from data.json
    const spriteData = this.findInSpriteMap(hero);
    if (spriteData) {
      this.spriteCache.set(spriteId, spriteData);
      return spriteData;
    }
    
    // Fallback: generate basic coordinates
    const generated = this.generateFallbackCoordinates(spriteId);
    this.spriteCache.set(spriteId, generated);
    return generated;
  }

  /**
   * Find sprite data by matching hero spriteId with spriteMap
   */
  findInSpriteMap(hero) {
    if (!this.spriteMap) {
      return null;
    }
    
    // Match by spriteId (primary key in spriteMap.json)
    const spriteId = String(hero.spriteId);
    const spriteData = this.spriteMap[spriteId];
    
    if (spriteData) {
      return {
        sheet: spriteData.sheet,
        x: spriteData.x,
        y: spriteData.y,
        width: spriteData.width,
        height: spriteData.height,
        frame: spriteData.frame,
        rotated: spriteData.rotated,
        faceCenter: spriteData.faceCenter,
        imagePoints: spriteData.imagePoints,
        source: 'spriteMap.json'
      };
    }
    
    return null;
  }

  /**
   * Generate fallback sprite coordinates for heroes not found in data.json
   * This is a simple estimation and should rarely be used
   */
  generateFallbackCoordinates(spriteId) {
    console.warn(`⚠️  Using fallback coordinates for spriteId ${spriteId}`);
    
    // Estimate based on spriteId
    // Most sprites are around 300-400px wide/tall
    const estimatedSize = 350;
    const sheet = Math.floor(spriteId / 10); // ~10 sprites per sheet
    
    return {
      sheet,
      x: 0,
      y: 0,
      width: estimatedSize,
      height: estimatedSize,
      frame: spriteId,
      faceCenter: { x: 0.5, y: 0.35 }, // Default face position
      source: 'fallback'
    };
  }

  /**
   * Get all sprite coordinates for multiple heroes
   */
  getBatchCoordinates(heroes) {
    const results = [];
    
    for (const hero of heroes) {
      const coords = this.getSpriteCoordinates(hero);
      results.push({
        heroId: hero.id,
        spriteId: hero.spriteId,
        name: hero.nameCN,
        ...coords
      });
    }
    
    return results;
  }

  /**
   * Get statistics about sprite coordinate generation
   */
  getStatistics() {
    let knownCount = 0;
    let generatedCount = 0;
    
    for (const coord of this.coordinateCache.values()) {
      if (coord.source === 'known_mapping') {
        knownCount++;
      } else {
        generatedCount++;
      }
    }
    
    return {
      total: this.coordinateCache.size,
      knownMappings: knownCount,
      generated: generatedCount
    };
  }
}

module.exports = SpriteCoordinateGenerator;

