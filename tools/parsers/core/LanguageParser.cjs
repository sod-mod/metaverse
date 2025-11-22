const C2ArrayParser = require('./C2ArrayParser.cjs');
const TypeConverter = require('./TypeConverter.cjs');
const path = require('path');

/**
 * Parser for lau.json language/localization file
 * Maps string IDs to Chinese/English/Korean translations
 */
class LanguageParser extends C2ArrayParser {
  constructor(sourceDir, options = {}) {
    const filePath = path.join(sourceDir, 'lau.json');
    super(filePath, options);
    this.languageMap = new Map(); // Map<stringCN, {id, cn, translated}>
  }

  /**
   * Parse language file and build lookup map
   */
  parse() {
    if (!this.load()) {
      return this.getResult([]);
    }

    const entries = this.parseAll((rowData, index) => {
      return this.parseRow(rowData, index);
    });
    
    // Build language map for quick lookup
    entries.forEach(entry => {
      this.languageMap.set(entry.cn, {
        id: entry.id,
        cn: entry.cn,
        translated: entry.translated
      });
    });
    
    return this.getResult(entries);
  }

  /**
   * Parse single language entry from row data
   */
  parseRow(rowData, index) {
    try {
      return {
        id: TypeConverter.toNumber(rowData[0]),
        cn: TypeConverter.toString(rowData[1]),
        translated: TypeConverter.toString(rowData[2])
      };
    } catch (error) {
      throw new Error(`Failed to parse language entry at row ${index}: ${error.message}`);
    }
  }

  /**
   * Lookup translated string by Chinese text
   * @param {string} chineseText - Chinese text to lookup
   * @returns {string|null} Translated text or null if not found
   */
  lookup(chineseText) {
    if (!chineseText) return null;
    const entry = this.languageMap.get(chineseText.trim());
    return entry ? entry.translated : null;
  }

  /**
   * Lookup by ID
   * @param {number} id - Language string ID
   * @returns {object|null} Language entry or null if not found
   */
  lookupById(id) {
    for (const entry of this.languageMap.values()) {
      if (entry.id === id) {
        return entry;
      }
    }
    return null;
  }
  
  /**
   * Get all entries as array
   * @returns {Array} All language entries
   */
  getAll() {
    return Array.from(this.languageMap.values());
  }
  
  /**
   * Get map for direct access
   * @returns {Map} Language map
   */
  getMap() {
    return this.languageMap;
  }
}

module.exports = { LanguageParser };

