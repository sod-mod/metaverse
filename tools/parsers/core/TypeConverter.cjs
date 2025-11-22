/**
 * Type Converter
 * Handles type coercion and validation
 */

class TypeConverter {
  /**
   * Convert value to number
   */
  static toNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Convert value to string
   */
  static toString(value, defaultValue = '') {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    
    return String(value).trim();
  }

  /**
   * Convert value to boolean
   */
  static toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === 'yes' || lower === '1';
    }
    return Boolean(value);
  }

  /**
   * Convert to array
   */
  static toArray(value, separator = ',') {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    
    if (typeof value === 'string') {
      return value.split(separator).map(s => s.trim()).filter(Boolean);
    }
    
    return [value];
  }

  /**
   * Parse formatted text (with color tags, etc.)
   */
  static parseFormattedText(text) {
    if (!text) return '';
    
    // Replace &newline& with actual newlines
    text = text.replace(/&newline&/g, '\n');
    
    // Extract plain text from color tags
    const plainText = text.replace(/\[color=[^\]]+\]([^\[]*)\[\/color\]/g, '$1');
    
    return {
      raw: text,
      plain: plainText,
      formatted: text
    };
  }

  /**
   * Validate ID reference
   */
  static validateId(id, context = '') {
    const numId = this.toNumber(id, -1);
    
    if (numId < 0) {
      throw new Error(`Invalid ID ${id} ${context}`);
    }
    
    return numId;
  }

  /**
   * Convert multilingual text
   */
  static multilingualText(cn, en, ko) {
    return {
      zh: this.toString(cn),
      en: this.toString(en) || undefined,
      ko: this.toString(ko) || undefined
    };
  }

  /**
   * Extract stat bonus array
   */
  static extractStats(rowData, startCol, count) {
    const stats = [];
    
    for (let i = 0; i < count; i++) {
      const value = this.toNumber(rowData[startCol + i], 0);
      if (value !== 0) {
        stats.push(value);
      }
    }
    
    return stats;
  }

  /**
   * Parse enum value
   */
  static toEnum(value, enumValues, defaultValue) {
    if (enumValues.includes(value)) {
      return value;
    }
    
    return defaultValue || enumValues[0];
  }
}

module.exports = TypeConverter;

