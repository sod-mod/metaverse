/**
 * Shop Parser
 * Parses ss.json into Shop/Counter objects
 */

const path = require('path');
const { C2ArrayParser, TypeConverter } = require('../core/index.cjs');

class ShopParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'ss.json');
    super(filePath, options);
  }

  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const shops = this.parseAll((rowData, index) => {
      return this.parseShop(rowData, index);
    });

    return this.getResult(shops);
  }

  parseShop(rowData, index) {
    try {
      const shop = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        displayName: TypeConverter.toString(rowData[2]),
        icon: TypeConverter.toNumber(rowData[3]),
        capacity: TypeConverter.toNumber(rowData[4]),
        itemSlots: TypeConverter.toNumber(rowData[5]),
        upgradeCost: TypeConverter.toNumber(rowData[6]),
        level: TypeConverter.toNumber(rowData[7]),
        effectDescription: TypeConverter.toString(rowData[8]),
        upgradeBonus: TypeConverter.toNumber(rowData[9]),
        unknown10: TypeConverter.toNumber(rowData[10]),
        descriptionEN: TypeConverter.toString(rowData[11])
      };
      
      if (this.options.language === 'en' && shop.descriptionEN) {
        shop.description = shop.descriptionEN;
      } else {
        shop.description = shop.effectDescription;
      }
      
      return shop;
      
    } catch (error) {
      throw new Error(`Failed to parse shop at row ${index}: ${error.message}`);
    }
  }
}

module.exports = ShopParser;

