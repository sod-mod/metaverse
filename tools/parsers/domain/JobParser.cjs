const path = require('path');
const { C2ArrayParser, TypeConverter, LanguageParser } = require('../core/index.cjs');

/**
 * JobParser
 * Parses job/class data from zy.json (职业 = Job/Class/Profession)
 * 
 * File: package/zy.json
 * Structure:
 * - Column [0]: Job ID
 * - Column [1]: Job Name (Chinese)
 * - Column [2]: Category? (1-6, appears to be tier/rank)
 * - Column [3]: Sub-category?
 * - Column [4]: Type?
 * - Column [5]: Description
 * - Column [6-11]: Unknown (sprite/icon related?)
 * - Column [12-23]: Stat modifiers (HP, ATK, DEF, SPD, etc.)
 * - Column [24-31]: Unknown
 * - Column [32]: Last column (string/reference?)
 */
class JobParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'zy.json');
    super(filePath, options);
    
    this.languageParser = new LanguageParser(sourceDir);
    this.languageParser.parse(); // Initialize language data
  }

  parse() {
    // Load the C2Array data
    if (!this.load()) {
      return this.getResult([]);
    }
    
    const rawData = this.rawData.data;
    
    const jobs = rawData.slice(1).map((rowData, index) => this.parseJob(rowData, index)).filter(j => j !== null);
    
    return this.getResult(jobs);
  }

  /**
   * Parse single job from row data
   */
  parseJob(rowData, index) {
    try {
      const jobId = TypeConverter.toNumber(rowData[0]);
      const nameCN = TypeConverter.toString(rowData[1]);
      
      // Base job object
      const job = {
        id: jobId,
        nameCN: nameCN,
        
        tier: TypeConverter.toNumber(rowData[2]),
        category: TypeConverter.toNumber(rowData[3]),
        type: TypeConverter.toNumber(rowData[4]),
        description: TypeConverter.toString(rowData[5]),
        
        // Icon/sprite related (columns 6-11)
        icon: TypeConverter.toNumber(rowData[6]),
        
        // Stat modifiers (columns 12-23)
        // These appear to be base stat values or growth rates
        statModifiers: {
          stat1: TypeConverter.toString(rowData[12]),
          stat2: TypeConverter.toString(rowData[13]),
          stat3: TypeConverter.toString(rowData[14]),
          stat4: TypeConverter.toString(rowData[15]),
          stat5: TypeConverter.toString(rowData[16]),
          stat6: TypeConverter.toString(rowData[17]),
          stat7: TypeConverter.toString(rowData[18]),
          stat8: TypeConverter.toString(rowData[19]),
          stat9: TypeConverter.toString(rowData[20]),
          stat10: TypeConverter.toString(rowData[21]),
          stat11: TypeConverter.toString(rowData[22]),
          stat12: TypeConverter.toString(rowData[23])
        },
        
        // Additional properties (columns 24-31)
        rank: TypeConverter.toNumber(rowData[24]),
        subRank: TypeConverter.toNumber(rowData[25]),
        flag1: TypeConverter.toNumber(rowData[26]),
        flag2: TypeConverter.toNumber(rowData[27]),
        relatedId1: TypeConverter.toNumber(rowData[28]),
        relatedId2: TypeConverter.toNumber(rowData[29]),
        unknown1: TypeConverter.toNumber(rowData[30]),
        unknown2: TypeConverter.toNumber(rowData[31]),
        reference: TypeConverter.toString(rowData[32])
      };
      
      // Add multilingual names based on language option
      if (this.options.language === 'en') {
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(job.nameCN);
          if (translatedName) {
            job.nameEN = translatedName;
          }
        }
      } else if (this.options.language === 'ko') {
        if (this.options.langParser) {
          const translatedName = this.options.langParser.lookup(job.nameCN);
          if (translatedName) {
            job.nameKO = translatedName;
          }
        }
      }

      return job;
    } catch (error) {
      this.errors.push(`Row ${index}: ${error.message}`);
      if (!this.options.skipErrors) {
        throw error;
      }
      return null;
    }
  }
}

module.exports = JobParser;

