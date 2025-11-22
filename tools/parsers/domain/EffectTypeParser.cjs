const path = require('path');
const { C2ArrayParser, TypeConverter } = require('../core/index.cjs');

/**
 * EffectTypeParser
 * Parses sx.json into EffectType objects
 * sx.json contains the effect type definitions (속성 = Attribute/Effect Types)
 */
class EffectTypeParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'sx.json');
    super(filePath, options);
  }

  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const effectTypes = this.parseAll((rowData, index) => {
      return this.parseEffectType(rowData, index);
    });

    return this.getResult(effectTypes);
  }

  parseEffectType(rowData, index) {
    try {
      const effectType = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        category: TypeConverter.toString(rowData[2]), // Field 2: Category (资质/特殊/技能效果/etc)
        scale: TypeConverter.toNumber(rowData[3]), // Field 3: Scale/Multiplier value (possibly used in percentage calculations)
        valueType: TypeConverter.toString(rowData[4]), // Field 4: Value type (小数/百分比)
        field5: TypeConverter.toNumber(rowData[5] || 0), // Field 5: Unknown
        calculationType: TypeConverter.toString(rowData[6]), // Field 6: Calculation type (乘法/加法/etc)
        description: TypeConverter.toString(rowData[7] || ''), // Field 7: Description
        maxValue: TypeConverter.toNumber(rowData[8] || 0), // Field 8: Max value
        field9: TypeConverter.toNumber(rowData[9] || 0), // Field 9: unknown
        field10: TypeConverter.toNumber(rowData[10] || 0), // Field 10: Unknown
        field11: TypeConverter.toNumber(rowData[11] || 0) // Field 11: Unknown
      };
      
      // Add English language support only (from package/lau.json)
      if (this.options.language === 'en') {
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(effectType.nameCN);
          if (translatedName) {
            effectType.nameEN = translatedName;
          }
        }
      }
      
      return effectType;
      
    } catch (error) {
      throw new Error(`Failed to parse effect type at row ${index}: ${error.message}`);
    }
  }
}

module.exports = EffectTypeParser;

