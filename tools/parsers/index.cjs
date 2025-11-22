/**
 * Parser Orchestrator
 * Coordinates all parsers and combines multilingual outputs
 */

const fs = require('fs');
const path = require('path');
const HeroParser = require('./domain/HeroParser.cjs');
const StageParser = require('./domain/StageParser.cjs');
const EquipmentParser = require('./domain/EquipmentParser.cjs');
const TalentParser = require('./domain/TalentParser.cjs');
const SkillParser = require('./domain/SkillParser.cjs');
const BuffParser = require('./domain/BuffParser.cjs');
const ShopParser = require('./domain/ShopParser.cjs');
const EnemyParser = require('./domain/EnemyParser.cjs');
const SpriteParser = require('./domain/SpriteParser.cjs');
const SpriteMapBuilder = require('./domain/SpriteMapBuilder.cjs');
const JobParser = require('./domain/JobParser.cjs');
const EffectTypeParser = require('./domain/EffectTypeParser.cjs');
const { RelationResolver } = require('./core/index.cjs');

class ParserOrchestrator {
  constructor(sourceDirs, options = {}) {
    // Support single source directory (package) for parsing CN + EN data
    // Korean translations are handled separately by generate-i18n script
    this.sourceDirs = Array.isArray(sourceDirs) ? sourceDirs : [sourceDirs];
    this.options = {
      validateRefs: options.validateRefs !== false,
      skipErrors: options.skipErrors || false,
      verbose: options.verbose || false,
      multilingual: false, // Always single source now
      ...options
    };
    
    this.parsers = {};
    this.results = {};
    this.resolver = new RelationResolver();
  }

  /**
   * Initialize parsers for a specific source
   */
  initializeParsers(sourceDir, language) {
    const { LanguageParser } = require('./core/index.cjs');
    
    // Parse language file first
    const langParser = new LanguageParser(sourceDir, { language });
    langParser.parse();
    
    return {
      hero: new HeroParser(sourceDir, { ...this.options, language, langParser }),
      stage: new StageParser(sourceDir, { ...this.options, language, langParser }),
      equipment: new EquipmentParser(sourceDir, { ...this.options, language, langParser }),
      job: new JobParser(sourceDir, { ...this.options, language, langParser }),
      effectType: new EffectTypeParser(sourceDir, { ...this.options, language, langParser }),
      talent: new TalentParser(sourceDir, { ...this.options, language, langParser }),
      skill: new SkillParser(sourceDir, { ...this.options, language, langParser }),
      buff: new BuffParser(sourceDir, { ...this.options, language, langParser }),
      shop: new ShopParser(sourceDir, { ...this.options, language, langParser }),
      enemy: new EnemyParser(sourceDir, { ...this.options, language, langParser })
    };
  }

  /**
   * Merge multilingual data by ID
   * NOTE: This method is kept for backward compatibility but is no longer used
   * since parse-data now only uses single source (package) for CN + EN data.
   * Korean translations are handled by generate-i18n script.
   */
  mergeMultilingualData(dataByLanguage) {
    const languages = Object.keys(dataByLanguage);
    if (languages.length === 0) return [];
    
    // Use 'zh' as base if available
    const baseData = dataByLanguage['zh'] || dataByLanguage[languages[0]];
    const merged = baseData.map(item => ({ ...item }));
    
    // Merge other languages (only EN now, KO is handled by generate-i18n)
    languages.forEach(lang => {
      if (lang === 'zh') return; // Skip base language
      
      const langData = dataByLanguage[lang];
      if (!langData) return;
      
      langData.forEach(langItem => {
        const baseItem = merged.find(m => m.id === langItem.id);
        if (!baseItem) return;
        
        // Merge only English language-specific fields (nameEN, descriptionEN, etc.)
        Object.keys(langItem).forEach(key => {
          // Skip base fields that shouldn't be copied
          if (['id', 'nameCN', 'race', 'displayName', 'spriteId', 'universe', 'stage', 
               'stats', 'jobLevels', 'talents', 'description', 'gender', 'rarity',
               'recruitCost', 'title', 'unlocked', 'type', 'category', 'level', 
               'weaponType', 'setId', 'baseValue', 'buffId', 'skillIds', 'cost',
               'currency', 'requirements', 'dropRate', 'hp', 'atk', 'def', 'spd',
               'magic', 'sprite'].includes(key)) {
            return;
          }
          
          // Copy only English language-specific fields (ending with EN)
          if (key.endsWith('EN')) {
            baseItem[key] = langItem[key];
          }
        });
      });
    });
    
    return merged;
  }

  /**
   * Parse all data files in dependency order
   */
  parseAll() {
    const parseOrder = ['buff', 'skill', 'talent', 'equipment', 'enemy', 'job', 'effectType', 'hero', 'stage', 'shop'];
    
    // Single source parsing (package) - extracts CN + EN data
    // Korean translations are handled separately by generate-i18n script
    const sourceDir = this.sourceDirs[0];
    const parsers = this.initializeParsers(sourceDir, this.options.language || 'en');
    
    for (const key of parseOrder) {
      if (this.options.verbose) {
        console.log(`Parsing ${key}...`);
      }
      
      try {
        const result = parsers[key].parse();
        this.results[key] = result;
        
        // Register in resolver for cross-references
        this.resolver.registerData(key, result.data);
        
        if (this.options.verbose) {
          console.log(`  ✅ ${result.stats.parsed} ${key}(s) parsed, ${result.stats.failed} errors`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to parse ${key}: ${error.message}`);
        this.results[key] = {
          data: [],
          errors: [error.message],
          warnings: [],
          stats: { total: 0, parsed: 0, failed: 1 }
        };
      }
    }
    
    return this.results;
  }

  /**
   * Get combined statistics
   */
  getStatistics() {
    const stats = {
      totalFiles: 0,
      totalRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      totalErrors: 0,
      totalWarnings: 0,
      byType: {}
    };
    
    for (const [type, result] of Object.entries(this.results)) {
      stats.totalFiles++;
      stats.totalRecords += result.stats.total;
      stats.successfulRecords += result.stats.parsed;
      stats.failedRecords += result.stats.failed;
      stats.totalErrors += result.errors.length;
      stats.totalWarnings += result.warnings.length;
      
      stats.byType[type] = {
        total: result.stats.total,
        parsed: result.stats.parsed,
        failed: result.stats.failed,
        errors: result.errors.length
      };
    }
    
    return stats;
  }

  /**
   * Validate cross-references
   */
  validateReferences() {
    const errors = [];
    
    // Validate hero talents reference talent IDs
    for (const hero of this.results.hero.data) {
      for (const talentId of hero.talents) {
        if (talentId > 0 && !this.resolver.resolve(talentId, 'talent')) {
          errors.push(`Hero ${hero.id} (${hero.nameCN}) references invalid talent ${talentId}`);
        }
      }
    }
    
    // Validate stage enemies reference enemy IDs
    for (const stage of this.results.stage.data) {
      for (const enemyId of stage.enemies) {
        if (enemyId > 0 && !this.resolver.resolve(enemyId, 'enemy')) {
          errors.push(`Stage ${stage.id} (${stage.nameCN}) references invalid enemy ${enemyId}`);
        }
      }
    }
    
    // Validate stage item drops reference equipment IDs
    for (const stage of this.results.stage.data) {
      for (const itemId of stage.itemDrops) {
        if (itemId > 0 && !this.resolver.resolve(itemId, 'equipment')) {
          errors.push(`Stage ${stage.id} (${stage.nameCN}) references invalid item ${itemId}`);
        }
      }
    }
    
    return errors;
  }

  /**
   * Export to JSON files
   */
  async exportToFiles(outputDir) {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const exports = {};
    
    for (const [type, result] of Object.entries(this.results)) {
      const filename = `${type}.json`;
      const filePath = path.join(outputDir, filename);
      
      fs.writeFileSync(filePath, JSON.stringify(result.data, null, 2));
      exports[type] = {
        filename,
        records: result.data.length
      };
      
      if (this.options.verbose) {
        console.log(`  ✅ Exported ${result.data.length} ${type}(s) to ${filename}`);
      }
    }
    
    // Export summary
    const summaryPath = path.join(outputDir, 'parse-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      sourceDirs: this.sourceDirs,
      multilingual: this.options.multilingual,
      statistics: this.getStatistics(),
      exports
    }, null, 2));
    
    // Generate sprite mappings if heroes exist
    if (this.results.hero && this.results.hero.data.length > 0) {
      await this.generateSpriteMappings(outputDir);
    }
    
    return exports;
  }

  /**
   * Generate sprite and icon mappings
   */
  async generateSpriteMappings(outputDir) {
    console.log('\n🎨 Generating sprite mappings...');
    
    const heroes = this.results.hero.data;
    
    // Step 1: Build spriteMap.json from package/data.json (hero.id → sprite coords)
    console.log('\n📋 Step 1: Building spriteMap.json from data.json...');
    const spriteMapBuilder = new SpriteMapBuilder({
      packagePath: this.sourceDirs[0] // Use first source directory (package/)
    });
    const spriteMapPath = path.join(__dirname, '../public/spriteMap.json');
    const buildResult = spriteMapBuilder.build(heroes, spriteMapPath);
    
    if (!buildResult.success) {
      console.error('❌ Failed to build sprite map');
      return;
    }
    
    if (this.options.verbose) {
      console.log(`  ✅ Built sprite map: ${buildResult.matchedCount}/${heroes.length} heroes matched`);
    }
    
    // Step 2: Extract individual hero sprites from sprite sheets
    console.log('\n📋 Step 2: Extracting hero sprites...');
    const spriteParser = new SpriteParser();
    const spriteSheetDir = path.join(__dirname, '../../package/images');
    const heroesDirectory = path.join(__dirname, '../public/images/heroes');
    
    try {
      const extractResult = await spriteParser.extractHeroSprites(heroes, spriteSheetDir, heroesDirectory);
      
      if (this.options.verbose) {
        console.log(`  ✅ Extracted ${extractResult.successCount}/${extractResult.totalHeroes} hero sprites`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error extracting sprites: ${error.message}`);
    }
  }

  /**
   * Get data by type
   */
  getData(type) {
    return this.results[type]?.data || [];
  }
}

module.exports = ParserOrchestrator;
