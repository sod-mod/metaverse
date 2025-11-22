/**
 * Base C2Array Parser
 * Handles parsing of Construct 2 Array format
 */

class C2ArrayParser {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.options = {
      language: options.language || 'en',
      skipErrors: options.skipErrors || false,
      validateRefs: options.validateRefs || false,
      ...options
    };
    this.errors = [];
    this.warnings = [];
    this.rawData = null;
  }

  /**
   * Load and validate C2Array file
   */
  load() {
    const fs = require('fs');
    
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      this.rawData = JSON.parse(content);
      
      if (!this.rawData.c2array) {
        throw new Error('Not a valid c2array format');
      }
      
      return true;
    } catch (error) {
      this.errors.push(`Failed to load file: ${error.message}`);
      return false;
    }
  }

  /**
   * Get dimensions of the array
   */
  getDimensions() {
    if (!this.rawData) return null;
    const [rows, cols, depth] = this.rawData.size;
    return { rows, cols, depth };
  }

  /**
   * Get value at specific position
   */
  getValue(row, col, depth = 0) {
    if (!this.rawData) return null;
    
    try {
      return this.rawData.data[row][col][depth];
    } catch (error) {
      return null;
    }
  }

  /**
   * Get entire row
   */
  getRow(rowIndex) {
    if (!this.rawData) return null;
    
    const { cols } = this.getDimensions();
    const row = {};
    
    for (let i = 0; i < cols; i++) {
      row[i] = this.getValue(rowIndex, i);
    }
    
    return row;
  }

  /**
   * Iterate over all data rows (skipping row 0 which is headers)
   */
  *iterateRows() {
    if (!this.rawData) return;
    
    const { rows } = this.getDimensions();
    
    for (let i = 1; i < rows; i++) {
      yield {
        index: i,
        data: this.getRow(i)
      };
    }
  }

  /**
   * Parse all rows using field mapper
   */
  parseAll(fieldMapper) {
    const results = [];
    
    for (const { index, data } of this.iterateRows()) {
      try {
        const parsed = fieldMapper(data, index);
        if (parsed) {
          results.push(parsed);
        }
      } catch (error) {
        const errorMsg = `Row ${index}: ${error.message}`;
        
        if (this.options.skipErrors) {
          this.errors.push(errorMsg);
        } else {
          throw new Error(errorMsg);
        }
      }
    }
    
    return results;
  }

  /**
   * Get parsing summary
   */
  getSummary(parsedData) {
    return {
      total: this.getDimensions().rows - 1, // excluding header row
      parsed: parsedData.length,
      failed: this.errors.length,
      warnings: this.warnings.length
    };
  }

  /**
   * Get full result with metadata
   */
  getResult(parsedData) {
    return {
      data: parsedData,
      errors: this.errors,
      warnings: this.warnings,
      stats: this.getSummary(parsedData)
    };
  }
}

module.exports = C2ArrayParser;

