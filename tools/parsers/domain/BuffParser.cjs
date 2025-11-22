/**
 * Buff Parser
 * Parses buff.json into Buff objects
 */

const path = require('path');
const { C2ArrayParser, TypeConverter } = require('../core/index.cjs');

class BuffParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'buff.json');
    super(filePath, options);
  }

  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const buffs = this.parseAll((rowData, index) => {
      return this.parseBuff(rowData, index);
    });

    return this.getResult(buffs);
  }

  parseBuff(rowData, index) {
    try {
      // Base buff object matching schema
      const buff = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        displayName: TypeConverter.toString(rowData[2]),
        icon: TypeConverter.toNumber(rowData[3]),
        effectValue: TypeConverter.toNumber(rowData[6]),
        duration: TypeConverter.toNumber(rowData[9]),
        maxStacks: TypeConverter.toNumber(rowData[10]),
        durationType: TypeConverter.toString(rowData[11]),
        buffType: TypeConverter.toString(rowData[12]),
        description: TypeConverter.toString(rowData[13])
      };
      
      // Add multi-language support
      if (this.options.language === 'en') {
        const descEN = TypeConverter.toString(rowData[14]);
        if (descEN) {
          buff.descriptionEN = descEN;
        }
        
        // Lookup name from langParser if available
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(buff.displayName);
          if (translatedName) {
            buff.nameEN = translatedName;
          }
        }
      } else if (this.options.language === 'ko') {
        // Korean description from rowData[14] in package_kor
        const descKO = TypeConverter.toString(rowData[14]);
        if (descKO) {
          buff.descriptionKO = descKO;
        }
        
        // Lookup name from langParser if available
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(buff.displayName);
          if (translatedName) {
            buff.nameKO = translatedName;
          }
        }
      }
      
      return buff;
      
    } catch (error) {
      throw new Error(`Failed to parse buff at row ${index}: ${error.message}`);
    }
  }
}

module.exports = BuffParser;

