/**
 * Field Mapper
 * Maps column indices to field names and handles type conversion
 */

class FieldMapper {
  constructor(mapping, options = {}) {
    this.mapping = mapping;
    this.options = options;
  }

  /**
   * Map raw row data to structured object
   */
  map(rowData) {
    const result = {};
    
    for (const [fieldName, config] of Object.entries(this.mapping)) {
      const value = this.extractValue(rowData, config);
      
      if (value !== undefined) {
        result[fieldName] = value;
      }
    }
    
    return result;
  }

  /**
   * Extract and convert value from row data
   */
  extractValue(rowData, config) {
    // Handle simple column index
    if (typeof config === 'number') {
      return rowData[config];
    }
    
    // Handle config object
    const { col, type, default: defaultValue, transform, required } = config;
    let value = rowData[col];
    
    // Handle missing required fields
    if (required && (value === null || value === undefined || value === '' || value === 0)) {
      if (defaultValue !== undefined) {
        value = defaultValue;
      } else {
        throw new Error(`Required field missing at column ${col}`);
      }
    }
    
    // Apply default
    if ((value === null || value === undefined || value === '' || value === 0) && defaultValue !== undefined) {
      value = defaultValue;
    }
    
    // Type conversion
    if (type && value !== null && value !== undefined) {
      value = this.convertType(value, type);
    }
    
    // Apply transform
    if (transform && typeof transform === 'function') {
      value = transform(value, rowData);
    }
    
    return value;
  }

  /**
   * Convert value to specified type
   */
  convertType(value, type) {
    switch (type) {
      case 'number':
        return Number(value);
      
      case 'string':
        return String(value);
      
      case 'boolean':
        return Boolean(value) && value !== 0;
      
      case 'array':
        return Array.isArray(value) ? value : [value];
      
      default:
        return value;
    }
  }

  /**
   * Create field mapper from column list
   */
  static fromColumns(columns) {
    const mapping = {};
    
    columns.forEach((config, index) => {
      if (typeof config === 'string') {
        mapping[config] = index;
      } else if (config.name) {
        mapping[config.name] = {
          col: index,
          ...config
        };
      }
    });
    
    return new FieldMapper(mapping);
  }

  /**
   * Create multi-language field mapper
   */
  static multiLanguage(fieldName, columns, language = 'en') {
    const langMap = {
      zh: columns.zh || columns.cn,
      en: columns.en,
      ko: columns.ko || columns.kr
    };
    
    // Return the column for requested language, fallback to Chinese
    const colIndex = langMap[language] || langMap.zh;
    
    return {
      [fieldName]: colIndex,
      [`${fieldName}CN`]: langMap.zh,
      [`${fieldName}EN`]: langMap.en,
      [`${fieldName}KO`]: langMap.ko
    };
  }
}

module.exports = FieldMapper;

