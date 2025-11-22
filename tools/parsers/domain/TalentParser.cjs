/**
 * Talent Parser
 * Parses mg.json into Talent objects
 */

const path = require('path');
const fs = require('fs');
const { C2ArrayParser, TypeConverter } = require('../core/index.cjs');

class TalentParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'mg.json');
    super(filePath, options);
    this.effectTypes = null;
    this.loadEffectTypes(sourceDir);
  }

  loadEffectTypes(sourceDir) {
    try {
      const sxPath = path.join(sourceDir, 'sx.json');
      if (fs.existsSync(sxPath)) {
        const sxData = JSON.parse(fs.readFileSync(sxPath, 'utf8'));
        this.effectTypes = {};
        // Parse effect types from sx.json
        for (let i = 1; i < sxData.data.length; i++) {
          const row = sxData.data[i];
          if (row && row[0] && row[0][0]) {
            const id = row[0][0];
            const scale = TypeConverter.toNumber(row[3] || 0);
            const maxValue = TypeConverter.toNumber(row[8] || 0) || TypeConverter.toNumber(row[9] || 0);
            this.effectTypes[id] = { scale, maxValue };
          }
        }
      }
    } catch (error) {
      // Silently fail if sx.json doesn't exist or can't be parsed
      if (this.options.verbose) {
        console.warn(`Warning: Could not load effect types: ${error.message}`);
      }
    }
  }

  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const talents = this.parseAll((rowData, index) => {
      return this.parseTalent(rowData, index);
    });

    return this.getResult(talents);
  }

  parseTalent(rowData, index) {
    try {
      // Base talent object matching schema
      const talent = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        tree: TypeConverter.toNumber(rowData[2]),
        icon: 0, // TODO: deprecate this field
        unknown: TypeConverter.toNumber(rowData[4]), // Field 4: Unknown meaning (previously called maxLevel)
        description: TypeConverter.toString(rowData[5]),
        
        // Prerequisites (3 slots) - NOT prereq IDs, but tree structure coords
        // [6]: tier?, [7]: position?, [8]: tree?
        prerequisites: [
          TypeConverter.toNumber(rowData[6]),
          TypeConverter.toNumber(rowData[7]),
          TypeConverter.toNumber(rowData[8])
        ],
        
        tier: TypeConverter.toNumber(rowData[9]),
        position: TypeConverter.toNumber(rowData[10]),
        
        // Effect information
        effectCategory: TypeConverter.toNumber(rowData[3]), // Icon ID = Effect Type ID in sx.json!
        grade: TypeConverter.toNumber(rowData[12]), // 1-4: talent grade/tier
        cost: TypeConverter.toNumber(rowData[13]), // Talent cost (not related to scale)
        
        // Conditions (6 slots) - Application conditions for hexagon categories
        // Values: 1=Attack, 2=Defense, 3=Special, 4=Common
        // Fields 6-11 are conditions (6 values)
        conditions: [
          TypeConverter.toNumber(rowData[6] || 0),
          TypeConverter.toNumber(rowData[7] || 0),
          TypeConverter.toNumber(rowData[8] || 0),
          TypeConverter.toNumber(rowData[9] || 0),
          TypeConverter.toNumber(rowData[10] || 0),
          TypeConverter.toNumber(rowData[11] || 0)
        ]
      };
      
      // Store effectType scale and maxValue for UI calculation
      // Calculation is done in TalentTooltip component, not here
      if (talent.cost && talent.grade && talent.unknown) {
        const effectType = this.effectTypes && this.effectTypes[talent.effectCategory];
        
        if (effectType && effectType.scale && effectType.maxValue) {
          talent.effectScale = effectType.scale;
          talent.effectMaxValue = effectType.maxValue;
        }
      }
      
      // Add multi-language support
      if (this.options.language === 'en') {
        // Lookup name from langParser if available
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(talent.nameCN);
          if (translatedName) {
            talent.nameEN = translatedName;
          }
        }
      } else if (this.options.language === 'ko') {
        // Lookup name from langParser if available
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(talent.nameCN);
          if (translatedName) {
            talent.nameKO = translatedName;
          }
        }
      }
      
      return talent;
      
    } catch (error) {
      throw new Error(`Failed to parse talent at row ${index}: ${error.message}`);
    }
  }

  getByTree(treeId) {
    const result = this.parse();
    return result.data.filter(talent => talent.tree === treeId);
  }

  getByTier(tier) {
    const result = this.parse();
    return result.data.filter(talent => talent.tier === tier);
  }
}

module.exports = TalentParser;

