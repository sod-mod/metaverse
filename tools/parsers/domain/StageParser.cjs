/**
 * Stage Parser
 * Parses tz.json into Stage objects
 */

const path = require('path');
const { C2ArrayParser, TypeConverter } = require('../core/index.cjs');

class StageParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'tz.json');
    super(filePath, options);
  }

  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const stages = this.parseAll((rowData, index) => {
      return this.parseStage(rowData, index);
    });

    return this.getResult(stages);
  }

  parseStage(rowData, index) {
    try {
      // Base stage object matching schema
      const stage = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        universe: TypeConverter.toNumber(rowData[2]),
        stageNumber: TypeConverter.toNumber(rowData[3]),
        
        // Enemies (6 slots) - filter out zeros
        enemies: [
          TypeConverter.toNumber(rowData[4]),
          TypeConverter.toNumber(rowData[5]),
          TypeConverter.toNumber(rowData[6]),
          TypeConverter.toNumber(rowData[7]),
          TypeConverter.toNumber(rowData[8]),
          TypeConverter.toNumber(rowData[9])
        ].filter(id => id > 0),
        
        boss: TypeConverter.toNumber(rowData[10]),
        
        // Item drops (6 slots) - filter out zeros
        itemDrops: [
          TypeConverter.toNumber(rowData[11]),
          TypeConverter.toNumber(rowData[12]),
          TypeConverter.toNumber(rowData[13]),
          TypeConverter.toNumber(rowData[14]),
          TypeConverter.toNumber(rowData[15]),
          TypeConverter.toNumber(rowData[16])
        ].filter(id => id > 0),
        
        weaponType: TypeConverter.toNumber(rowData[17]),
        itemSet: TypeConverter.toNumber(rowData[18]),
        itemLevel: TypeConverter.toNumber(rowData[19]),
        difficulty: TypeConverter.toNumber(rowData[20]),
        unlockCondition: TypeConverter.toNumber(rowData[21]),
        stageType: TypeConverter.toNumber(rowData[22])
      };
      
      // Add multi-language support
      if (this.options.language === 'en') {
        // Lookup name from langParser if available
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(stage.nameCN);
          if (translatedName) {
            stage.nameEN = translatedName;
          }
        }
      } else if (this.options.language === 'ko') {
        // Lookup name from langParser if available
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(stage.nameCN);
          if (translatedName) {
            stage.nameKO = translatedName;
          }
        }
      }
      
      return stage;
      
    } catch (error) {
      throw new Error(`Failed to parse stage at row ${index}: ${error.message}`);
    }
  }

  getStagesByUniverse(universe) {
    const result = this.parse();
    return result.data.filter(stage => stage.universe === universe);
  }

  getSecretStages() {
    const result = this.parse();
    return result.data.filter(stage => stage.stageType === 2);
  }

  getMajorBattles() {
    const result = this.parse();
    return result.data.filter(stage => stage.stageType === 3);
  }
}

module.exports = StageParser;

