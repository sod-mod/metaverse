/**
 * Hero Parser
 * Parses js.json into Hero objects
 */

const path = require('path');
const { C2ArrayParser, FieldMapper, TypeConverter } = require('../core/index.cjs');
const SpriteCoordinateGenerator = require('./SpriteCoordinateGenerator.cjs');

class HeroParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'js.json');
    super(filePath, options);
    
    // Initialize sprite coordinate generator
    this.spriteGenerator = new SpriteCoordinateGenerator();
  }

  /**
   * Parse all heroes
   */
  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const heroes = this.parseAll((rowData, index) => {
      return this.parseHero(rowData, index);
    });

    return this.getResult(heroes);
  }

  /**
   * Parse single hero from row data
   */
  parseHero(rowData, index) {
    try {
      // Base hero object matching schema
      const hero = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        race: TypeConverter.toString(rowData[2]),
        displayName: TypeConverter.toString(rowData[3]),
        spriteId: TypeConverter.toNumber(rowData[0]), // spriteId = id (for spriteMap.json matching)
        universe: TypeConverter.toNumber(rowData[5]),
        stage: TypeConverter.toNumber(rowData[6]),
        
        // Stats object (required by schema)
        stats: {
          hp: TypeConverter.toNumber(rowData[7]),
          atk: TypeConverter.toNumber(rowData[8]),
          def: TypeConverter.toNumber(rowData[9]),
          spd: TypeConverter.toNumber(rowData[10]),
          magic: TypeConverter.toNumber(rowData[11])
        },
        
        // Job levels (10 slots: columns 12-21) - required by schema
        jobLevels: [
          TypeConverter.toNumber(rowData[12]),
          TypeConverter.toNumber(rowData[13]),
          TypeConverter.toNumber(rowData[14]),
          TypeConverter.toNumber(rowData[15]),
          TypeConverter.toNumber(rowData[16]),
          TypeConverter.toNumber(rowData[17]),
          TypeConverter.toNumber(rowData[18]),
          TypeConverter.toNumber(rowData[19]),
          TypeConverter.toNumber(rowData[20]),
          TypeConverter.toNumber(rowData[21])
        ],
        
        // Initial job class ID (references zy.json)
        // jobLevels array index maps to job class IDs 1-6
        // Index 0 → Job 1 (白丁/평민), Index 1 → Job 2 (护卫/호위), etc.
        initialJobId: (() => {
          const jobLevels = [
            TypeConverter.toNumber(rowData[12]),
            TypeConverter.toNumber(rowData[13]),
            TypeConverter.toNumber(rowData[14]),
            TypeConverter.toNumber(rowData[15]),
            TypeConverter.toNumber(rowData[16]),
            TypeConverter.toNumber(rowData[17]),
            TypeConverter.toNumber(rowData[18]),
            TypeConverter.toNumber(rowData[19]),
            TypeConverter.toNumber(rowData[20]),
            TypeConverter.toNumber(rowData[21])
          ];
          // Find first non-zero index, map to job ID (1-based)
          const firstNonZeroIndex = jobLevels.findIndex(level => level > 0);
          // Basic job classes are IDs 1-6
          return firstNonZeroIndex >= 0 && firstNonZeroIndex < 6 
            ? firstNonZeroIndex + 1 
            : null;
        })(),
        
        // Talent slots (4 slots: columns 28-31) - required by schema
        talents: [
          TypeConverter.toNumber(rowData[28]),
          TypeConverter.toNumber(rowData[29]),
          TypeConverter.toNumber(rowData[30]),
          TypeConverter.toNumber(rowData[31])
        ],
        
        // Description (language-specific)
        description: TypeConverter.toString(rowData[23]),
        
        // Gender (enum: 男, 女)
        gender: TypeConverter.toString(rowData[24]),
        
        // Rarity
        rarity: TypeConverter.toNumber(rowData[25]),
        
        // Recruit cost
        recruitCost: TypeConverter.toNumber(rowData[26]),
        
        // Title
        title: TypeConverter.toString(rowData[27]),
        
        // Unlocked status
        unlocked: TypeConverter.toBoolean(rowData[33])
      };
      
      // Add multi-language support based on language option
      if (this.options.language === 'en') {
        const descEN = TypeConverter.toString(rowData[34]);
        if (descEN) {
          hero.descriptionEN = descEN;
        }
        
        // Lookup name from langParser if available (use nameCN, not displayName)
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(hero.nameCN);
          if (translatedName) {
            hero.nameEN = translatedName;
          }
        }
      } else if (this.options.language === 'ko') {
        // Korean description from rowData[34] in package_kor
        const descKO = TypeConverter.toString(rowData[34]);
        if (descKO) {
          hero.descriptionKO = descKO;
        }
        
        // Lookup name from langParser if available (use nameCN, not displayName)
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(hero.nameCN);
          if (translatedName) {
            hero.nameKO = translatedName;
          }
        }
      }
      
      // Add sprite coordinates (only on first parse, not for language-specific passes)
      if (!this.options.language || this.options.language === 'zh') {
        const spriteCoords = this.spriteGenerator.getSpriteCoordinates(hero);
        hero.sprite = {
          sheet: spriteCoords.sheet,
          x: spriteCoords.x,
          y: spriteCoords.y,
          width: spriteCoords.width,
          height: spriteCoords.height,
          frame: spriteCoords.frame,
          rotated: spriteCoords.rotated,
          faceCenter: spriteCoords.faceCenter
        };
      }
      
      return hero;
      
    } catch (error) {
      throw new Error(`Failed to parse hero at row ${index}: ${error.message}`);
    }
  }

  /**
   * Get hero by ID
   */
  getHeroById(id) {
    const result = this.parse();
    return result.data.find(hero => hero.id === id);
  }

  /**
   * Get heroes by universe
   */
  getHeroesByUniverse(universe) {
    const result = this.parse();
    return result.data.filter(hero => hero.universe === universe);
  }
}

module.exports = HeroParser;

