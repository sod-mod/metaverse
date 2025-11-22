/**
 * Equipment Parser
 * Parses wp.json into Equipment objects
 */

const path = require('path');
const { C2ArrayParser, TypeConverter } = require('../core/index.cjs');

class EquipmentParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'wp.json');
    super(filePath, options);
  }

  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const equipment = this.parseAll((rowData, index) => {
      return this.parseEquipment(rowData, index);
    });

    return this.getResult(equipment);
  }

  parseEquipment(rowData, index) {
    try {
      // Base equipment object matching schema
      const item = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        displayName: TypeConverter.toString(rowData[2]),
        type: TypeConverter.toNumber(rowData[3]),
        category: TypeConverter.toNumber(rowData[4]),
        slot: TypeConverter.toString(rowData[5]),
        level: TypeConverter.toNumber(rowData[6]),
        rarity: TypeConverter.toNumber(rowData[7]),
        value: TypeConverter.toNumber(rowData[8]),
        sellPrice: TypeConverter.toNumber(rowData[9]),
        description: TypeConverter.toString(rowData[10]),
        
        // Stat bonuses (columns 11-30) - only include non-zero stats
        stats: TypeConverter.extractStats(rowData, 11, 20),
        
        // Additional properties from schema
        setId: TypeConverter.toNumber(rowData[36]),
        weaponType: TypeConverter.toNumber(rowData[37]),
        gemSlots: TypeConverter.toNumber(rowData[38])
      };
      
      // Add multi-language support
      if (this.options.language === 'en') {
        // Lookup name from langParser if available
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(item.displayName);
          if (translatedName) {
            item.nameEN = translatedName;
          }
        }
      } else if (this.options.language === 'ko') {
        // Lookup name from langParser if available
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(item.displayName);
          if (translatedName) {
            item.nameKO = translatedName;
          }
        }
      }
      
      return item;
      
    } catch (error) {
      throw new Error(`Failed to parse equipment at row ${index}: ${error.message}`);
    }
  }

  getByRarity(rarity) {
    const result = this.parse();
    return result.data.filter(item => item.rarity === rarity);
  }

  getPurpleItems() {
    return this.getByRarity(4);
  }

  getOrangeItems() {
    return this.getByRarity(5);
  }

  getBySet(setId) {
    const result = this.parse();
    return result.data.filter(item => item.setId === setId);
  }

  getByWeaponType(weaponType) {
    const result = this.parse();
    return result.data.filter(item => item.weaponType === weaponType);
  }
}

module.exports = EquipmentParser;

