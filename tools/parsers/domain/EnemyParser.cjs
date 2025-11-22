/**
 * Enemy Parser
 * Parses dr.json into Enemy objects
 */

const path = require('path');
const { C2ArrayParser, TypeConverter } = require('../core/index.cjs');

class EnemyParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'dr.json');
    super(filePath, options);
  }

  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const enemies = this.parseAll((rowData, index) => {
      return this.parseEnemy(rowData, index);
    });

    return this.getResult(enemies);
  }

  parseEnemy(rowData, index) {
    try {
      const enemy = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        level: TypeConverter.toNumber(rowData[2]),
        type: TypeConverter.toNumber(rowData[3]),
        rank: TypeConverter.toNumber(rowData[4]),
        enemyClass: TypeConverter.toString(rowData[5]),
        
        // Additional stats
        field6: TypeConverter.toNumber(rowData[6]),
        field7: TypeConverter.toNumber(rowData[7]),
        field8: TypeConverter.toNumber(rowData[8]),
        field9: TypeConverter.toNumber(rowData[9]),
        field10: TypeConverter.toNumber(rowData[10]),
        field11: TypeConverter.toNumber(rowData[11]),
        field12: TypeConverter.toNumber(rowData[12]),
        field13: TypeConverter.toNumber(rowData[13]),
        field14: TypeConverter.toNumber(rowData[14])
      };
      
      return enemy;
      
    } catch (error) {
      throw new Error(`Failed to parse enemy at row ${index}: ${error.message}`);
    }
  }

  getBosses() {
    const result = this.parse();
    return result.data.filter(enemy => enemy.enemyClass === 'Boss');
  }

  getElites() {
    const result = this.parse();
    return result.data.filter(enemy => enemy.enemyClass === '精英');
  }

  getMinions() {
    const result = this.parse();
    return result.data.filter(enemy => enemy.enemyClass === '小怪');
  }
}

module.exports = EnemyParser;

