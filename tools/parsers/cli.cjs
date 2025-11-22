#!/usr/bin/env node

/**
 * CLI Tool for Game Data Parser
 * Usage: node parsers/cli.js --source=package --lang=en --output=src/data
 */

const path = require('path');
const ParserOrchestrator = require('./index.cjs');

// Parse command line arguments
function parseArgs() {
  const args = {
    source: [],
    output: './src/data',
    validate: false,
    verbose: false,
    files: null,
    help: false
  };

  process.argv.slice(2).forEach(arg => {
    const [key, value] = arg.split('=');
    
    switch (key) {
      case '--source':
      case '-s':
        // Support multiple sources separated by comma
        args.source = value ? value.split(',') : [];
        break;
      case '--output':
      case '-o':
        args.output = value;
        break;
      case '--files':
      case '-f':
        args.files = value ? value.split(',') : null;
        break;
      case '--validate':
      case '-v':
        args.validate = true;
        break;
      case '--verbose':
        args.verbose = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
    }
  });

  return args;
}

// Display help message
function showHelp() {
  console.log(`
Game Data Parser CLI
====================

Usage:
  node parsers/cli.js [options]

Options:
  --source, -s <dirs>   Source directory/directories (required)
                        Single: --source=../package
                        Multiple (multilingual): --source=../package,../package_kor
  
  --output, -o <dir>    Output directory (default: ./src/data)
  
  --files, -f <list>    Specific files to parse (comma-separated)
                        Example: hero,stage,equipment
  
  --validate, -v        Validate cross-references
  
  --verbose             Show detailed progress
  
  --help, -h            Show this help message

Examples:
  # Parse multilingual data (CN + EN + KO)
  node parsers/cli.js --source=../package,../package_kor --output=data/extracted --verbose

  # Parse single language
  node parsers/cli.js --source=../package --output=data/extracted_en
  
  # Parse with validation
  node parsers/cli.js --source=../package,../package_kor --validate --verbose
`);
}

// Main execution
async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.source || args.source.length === 0) {
    console.error('❌ Error: --source directory is required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  console.log(`
╔═══════════════════════════════════════╗
║   Game Data Parser                    ║
╚═══════════════════════════════════════╝
`);

  if (args.source.length > 1) {
    console.log(`Mode:     Multilingual (${args.source.length} sources)`);
    args.source.forEach((src, idx) => {
      const langs = ['CN', 'KO', 'EN'];  // package, package_kor, package_en (if exists)
      console.log(`Source ${idx + 1}: ${src} (${langs[idx] || 'Unknown'})`);
    });
  } else {
    console.log(`Mode:     Single language`);
    console.log(`Source:   ${args.source[0]}`);
  }
  console.log(`Output:   ${args.output}`);
  console.log('');

  try {
    // Initialize orchestrator
    const orchestrator = new ParserOrchestrator(args.source, {
      verbose: args.verbose,
      validateRefs: args.validate
    });

    // Parse all data
    console.log('🚀 Starting parse...\n');
    const results = orchestrator.parseAll();

    // Show statistics
    const stats = orchestrator.getStatistics();
    console.log('\n📊 Statistics:');
    console.log(`   Total Files:   ${stats.totalFiles}`);
    console.log(`   Total Records: ${stats.totalRecords}`);
    console.log(`   Successful:    ${stats.successfulRecords}`);
    console.log(`   Failed:        ${stats.failedRecords}`);
    console.log(`   Errors:        ${stats.totalErrors}`);
    console.log(`   Warnings:      ${stats.totalWarnings}`);

    // Show by-type breakdown
    if (args.verbose) {
      console.log('\n   By Type:');
      for (const [type, typeStats] of Object.entries(stats.byType)) {
        console.log(`     ${type.padEnd(12)} ${typeStats.parsed}/${typeStats.total} parsed, ${typeStats.errors} errors`);
      }
    }

    // Validate references if requested
    if (args.validate) {
      console.log('\n🔍 Validating cross-references...');
      const refErrors = orchestrator.validateReferences();
      
      if (refErrors.length > 0) {
        console.log(`   ⚠️  Found ${refErrors.length} reference errors:`);
        refErrors.slice(0, 10).forEach(err => console.log(`     - ${err}`));
        if (refErrors.length > 10) {
          console.log(`     ... and ${refErrors.length - 10} more`);
        }
      } else {
        console.log('   ✅ All references valid');
      }
    }

    // Export to files
    console.log(`\n💾 Exporting to ${args.output}...`);
    const exports = await orchestrator.exportToFiles(args.output);
    
    console.log(`\n✅ Successfully exported ${Object.keys(exports).length} files!`);
    console.log('');

    // Exit with error code if there were failures
    if (stats.failedRecords > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    if (args.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run CLI
main();

