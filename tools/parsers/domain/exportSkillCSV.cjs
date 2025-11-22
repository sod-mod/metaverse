#!/usr/bin/env node

/**
 * Export Skill rowData to CSV
 * Extracts all columns from jn.json and exports to CSV format
 */

const fs = require('fs');
const path = require('path');
const { C2ArrayParser, TypeConverter, LanguageParser } = require('../core/index.cjs');

class SkillCSVExporter {
  constructor(sourceDir, outputPath, options = {}) {
    this.sourceDir = sourceDir;
    this.outputPath = outputPath;
    this.filePath = path.join(sourceDir, 'jn.json');
    this.options = {
      language: options.language || 'en',
      ...options
    };
  }

  /**
   * Escape CSV value (handle commas, quotes, newlines)
   */
  escapeCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }
    
    const str = String(value);
    
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    
    return str;
  }

  /**
   * Convert array to CSV row
   */
  arrayToCSVRow(values) {
    return values.map(v => this.escapeCSV(v)).join(',');
  }

  /**
   * Export all rowData to CSV
   */
  export() {
    console.log(`📖 Loading ${this.filePath}...`);
    
    // Load and parse C2Array file
    const parser = new C2ArrayParser(this.filePath);
    if (!parser.load()) {
      throw new Error(`Failed to load file: ${this.filePath}`);
    }

    const dimensions = parser.getDimensions();
    console.log(`📊 Dimensions: ${dimensions.rows} rows × ${dimensions.cols} columns`);

    // Generate CSV header (column indices)
    const headers = [];
    for (let i = 0; i < dimensions.cols; i++) {
      headers.push(`col_${i}`);
    }

    // Build CSV content
    const csvLines = [];
    
    // Add header row
    csvLines.push(this.arrayToCSVRow(headers));
    
    // Add data rows (skip row 0 which is header in C2Array format)
    console.log(`📝 Exporting ${dimensions.rows - 1} rows...`);
    
    for (let rowIndex = 1; rowIndex < dimensions.rows; rowIndex++) {
      const rowData = [];
      
      for (let colIndex = 0; colIndex < dimensions.cols; colIndex++) {
        var value = parser.getValue(rowIndex, colIndex, 0);
        if (colIndex == 1) {
          // Extract skill nameCN and lookup translation
          const nameCN = TypeConverter.toString(value);
          if (this.options.langParser && nameCN) {
            const translatedName = this.options.langParser.lookup(nameCN);
            if (translatedName) {
              value = translatedName;
            }
          }
        }
        rowData.push(value);
      }
      
      csvLines.push(this.arrayToCSVRow(rowData));
      
      if ((rowIndex + 1) % 100 === 0) {
        console.log(`  Processed ${rowIndex + 1} rows...`);
      }
    }

    // Write to file
    const outputDir = path.dirname(this.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(this.outputPath, csvLines.join('\n'), 'utf8');
    
    console.log(`✅ Exported to: ${this.outputPath}`);
    console.log(`   Total rows: ${dimensions.rows - 1}`);
    console.log(`   Total columns: ${dimensions.cols}`);
    
    return {
      success: true,
      outputPath: this.outputPath,
      rows: dimensions.rows - 1,
      cols: dimensions.cols
    };
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  let sourceDir = null;
  let outputPath = null;
  
  // Parse arguments
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key === '--source' || key === '-s') {
      sourceDir = value;
    } else if (key === '--output' || key === '-o') {
      outputPath = value;
    }
  });
  
  // Default values
  if (!sourceDir) {
    sourceDir = path.join(__dirname, '../../../../package_kor');
  }
  
  if (!outputPath) {
    outputPath = path.join(__dirname, '../../../../skill_rowdata.csv');
  }
  
  console.log(`
╔═══════════════════════════════════════╗
║   Skill RowData CSV Exporter          ║
╚═══════════════════════════════════════╝
`);
  console.log(`Source:  ${sourceDir}`);
  console.log(`Output:  ${outputPath}`);
  console.log('');
  
  try {
    // Initialize language parser for Korean translations
    const langParser = new LanguageParser(sourceDir, { language: 'ko' });
    langParser.parse();
    
    const exporter = new SkillCSVExporter(sourceDir, outputPath, { 
      language: 'ko',
      langParser: langParser 
    });
    exporter.export();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

module.exports = SkillCSVExporter;

