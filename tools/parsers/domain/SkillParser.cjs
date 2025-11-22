/**
 * Skill Parser
 * Parses jn.json into Skill objects
 */

const path = require('path');
const fs = require('fs');
const { C2ArrayParser, TypeConverter } = require('../core/index.cjs');

class SkillParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'jn.json');
    super(filePath, options);
    this.sourceDir = sourceDir;
    this.mcData = null;
    this.lauData = null; // Current source's lau.json (EN for package, KO for package_kor)
  }

  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const skills = this.parseAll((rowData, index) => {
      return this.parseSkill(rowData, index);
    });

    return this.getResult(skills);
  }

  /**
   * Parse skill class from mc.json and lau.json
   * Mapping: classId -> mc.json -> lau.json -> label sprite ID
   * @param {number} classId - Class ID from skill data (1-16)
   * @returns {object|null} Object with { labelSpriteId, classNameCN, classNameEN, classNameKO } or null
   */
  parseClassType(classId) {
    try {
      // Load mc.json if not already loaded
      if (!this.mcData) {
        const mcPath = path.join(this.sourceDir, 'mc.json');
        if (fs.existsSync(mcPath)) {
          this.mcData = JSON.parse(fs.readFileSync(mcPath, 'utf8'));
        } else {
          return null;
        }
      }

      // Load lau.json from current source directory
      // For 'en' language: uses package/lau.json (EN translations)
      // For 'ko' language: uses package_kor/lau.json (KO translations)
      if (!this.lauData) {
        const lauPath = path.join(this.sourceDir, 'lau.json');
        if (fs.existsSync(lauPath)) {
          this.lauData = JSON.parse(fs.readFileSync(lauPath, 'utf8'));
        } else {
          return null;
        }
      }

      // Find classId in mc.json (column 0 = ID, column 2 = class name)
      if (!this.mcData.data) {
        return null;
      }

      // Search for row where column 0 matches classId
      let mcRow = null;
      for (const row of this.mcData.data) {
        if (row && row[0] && row[0][0] === classId) {
          mcRow = row;
          break;
        }
      }

      if (!mcRow || !mcRow[2] || !mcRow[2][0]) {
        return null;
      }

      const classNameCN = TypeConverter.toString(mcRow[2][0]);
      if (!classNameCN) {
        return null;
      }

      // Find classNameCN in lau.json - column 1 = Chinese text, column 0 = ID, column 2 = Translated name
      // For 'en' language: column 2 contains English
      // For 'ko' language: column 2 contains Korean
      let labelSpriteId = null;
      let classNameTranslated = null;

      for (const lauRow of this.lauData.data) {
        if (lauRow && lauRow[1] && lauRow[1][0] === classNameCN) {
          labelSpriteId = TypeConverter.toNumber(lauRow[0][0]);
          // Get translated name (column 2) - EN for package, KO for package_kor
          if (lauRow[2] && lauRow[2][0]) {
            const translated = TypeConverter.toString(lauRow[2][0]);
            // Remove markup tags like [size=20]
            classNameTranslated = translated.replace(/\[.*?\]/g, '').trim();
          }
          break;
        }
      }

      if (labelSpriteId === null) {
        return null;
      }

      return {
        labelSpriteId,
        classNameCN,
        classNameTranslated // EN for package, KO for package_kor
      };
    } catch (error) {
      console.warn(`Failed to parse skill class for classId ${classId}: ${error.message}`);
      return null;
    }
  }

  parseSkill(rowData, index) {
    try {

      // Base skill object matching schema
      const skill = {
        id: TypeConverter.toNumber(rowData[0]),
        nameCN: TypeConverter.toString(rowData[1]),
        spriteId: TypeConverter.toNumber(rowData[2]),

        // 1: common, ...
        classId: TypeConverter.toNumber(rowData[4]),
        type: TypeConverter.toString(rowData[5]),
        rarity: TypeConverter.toNumber(rowData[6]),
        manaCost: TypeConverter.toNumber(rowData[19]), // [19] is mana cost (0-5)
        universe: TypeConverter.toNumber(rowData[47]), // [47] is universe (0-13)
        place: TypeConverter.toNumber(rowData[49]), // [48] is place (0-13)

        // 131: health, 132: speed, 133: attack, 134: defense, 135: magic attack, 136: magic defense
        passiveId1: TypeConverter.toNumber(rowData[8]), // First passive stat ID
        passiveValue1: TypeConverter.toNumber(rowData[9]), // First passive stat value
        passiveId2: TypeConverter.toNumber(rowData[10]), // Second passive stat ID
        passiveValue2: TypeConverter.toNumber(rowData[11]), // Second passive stat value
        
        // Language-specific effect description
        effectDescription: TypeConverter.toString(rowData[14]),
        skillCategory: TypeConverter.toString(rowData[15]),
        
        buffType: TypeConverter.toNumber(rowData[18]), // buff type
        damageType: TypeConverter.toString(rowData[26]),

        basePower: TypeConverter.toNumber(rowData[29]), // Main damage %
        basePower2: TypeConverter.toNumber(rowData[33]), // Secondary damage % (for multi-hit skills)
        buffChance: TypeConverter.toNumber(rowData[22]), // Buff application chance %

        // 1: single, 17: around 4, 25: around 9, 33: all
        targetType: TypeConverter.toString(rowData[37]) // target type 
      };
      
      // Parse skill class from mc.json and lau.json
      const classTypeInfo = this.parseClassType(skill.classId);
      if (classTypeInfo) {
        skill.class = skill.classId; // Save class as id (1-16)
        skill.classLabelSpriteId = classTypeInfo.labelSpriteId;
        skill.classNameCN = classTypeInfo.classNameCN;
        // Store English translated name only (from package/lau.json)
        if (classTypeInfo.classNameTranslated && this.options.language === 'en') {
          skill.classNameEN = classTypeInfo.classNameTranslated;
        }
      } else {
        // Fallback: use classId as class if parsing fails
        skill.class = skill.classId;
      }
      
      return skill;
      
    } catch (error) {
      throw new Error(`Failed to parse skill at row ${index}: ${error.message}`);
    }
  }
}

module.exports = SkillParser;

