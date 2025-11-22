const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Extract the 6 unique talent icon designs
 * 
 * Icon IDs: 20, 40, 60, 80, 100, 180
 * 
 * Based on user info:
 * - shared-5-sheet1.webp: Rarity 4 icons (Icon ID 180)
 * - shared-6-sheet0.webp: Rarity 3 icons (Icon ID 100, possibly 80)
 * - shared-6-sheet1.webp: Rarity 1, 2 icons (Icon ID 40, 60, possibly 20)
 */

// Icon positions - need to find these by inspecting the grid
// Format: { iconId: { sheet, size, row, col } }
const ICON_POSITIONS = {
  // Rarity 4 - Red star
  180: {
    sheet: 'shared-5-sheet1.webp',
    size: 100,
    row: 0,  // Will need to update after finding
    col: 0
  },
  // Rarity 3 - Purple/Pink star
  100: {
    sheet: 'shared-6-sheet0.webp',
    size: 100,
    row: 0,
    col: 0
  },
  80: {
    sheet: 'shared-6-sheet0.webp',
    size: 100,
    row: 0,
    col: 1  // Different position from 100
  },
  // Rarity 2 - Blue star
  60: {
    sheet: 'shared-6-sheet1.webp',
    size: 100,
    row: 0,
    col: 0
  },
  // Rarity 1 - Green star
  40: {
    sheet: 'shared-6-sheet1.webp',
    size: 100,
    row: 0,
    col: 1  // Different position from 60
  },
  20: {
    sheet: 'shared-6-sheet1.webp',
    size: 100,
    row: 0,
    col: 2  // Different position from 40 and 60
  }
};

async function extractIconAtPosition(sheetPath, iconSize, row, col) {
  const left = col * iconSize;
  const top = row * iconSize;
  
  return await sharp(sheetPath)
    .extract({ left, top, width: iconSize, height: iconSize })
    .webp({ quality: 95 })
    .toBuffer();
}

async function extractTalentIconsByPosition() {
  console.log('🎨 Extracting Talent Icons by Position\n');

  // Load icon mapping
  const mappingPath = path.join(__dirname, '../../public/images/talents/all_icons_grid/icon-mapping.json');
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

  console.log('📊 Icon IDs to extract:', mapping._metadata.uniqueIconIds);
  console.log();

  // Create output directory
  const outputDir = path.join(__dirname, '../../public/images/talents/icons');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const imageDir = path.join(__dirname, '../../../package_kor/images');
  const results = [];

  // Extract each icon
  for (const iconId of mapping._metadata.uniqueIconIds) {
    const position = ICON_POSITIONS[iconId];
    
    if (!position) {
      console.log(`⚠️  Icon ID ${iconId}: Position not configured yet`);
      continue;
    }

    const sheetPath = path.join(imageDir, position.sheet);
    
    if (!fs.existsSync(sheetPath)) {
      console.log(`❌ Icon ID ${iconId}: Sheet not found - ${position.sheet}`);
      continue;
    }

    try {
      const buffer = await extractIconAtPosition(
        sheetPath,
        position.size,
        position.row,
        position.col
      );

      const filename = `icon_${iconId}.webp`;
      const outputPath = path.join(outputDir, filename);
      fs.writeFileSync(outputPath, buffer);

      const talents = mapping.talentsByIconId[iconId];
      const rarities = [...new Set(talents.map(t => t.rarity))];
      
      console.log(`✅ Icon ID ${iconId}: ${position.sheet} [${position.row},${position.col}]`);
      console.log(`   → ${filename} (Used by ${talents.length} talents, Rarity ${rarities.join(',')})`);
      console.log(`   Examples: ${talents.slice(0, 3).map(t => t.name_en).join(', ')}`);
      console.log();

      results.push({
        iconId,
        filename,
        sheet: position.sheet,
        position: { row: position.row, col: position.col },
        talentCount: talents.length,
        rarities
      });

    } catch (error) {
      console.log(`❌ Icon ID ${iconId}: Extraction failed - ${error.message}`);
    }
  }

  // Save extraction info
  const infoPath = path.join(outputDir, 'icon-info.json');
  fs.writeFileSync(infoPath, JSON.stringify({
    _metadata: {
      generatedAt: new Date().toISOString(),
      totalIcons: results.length,
      expectedIcons: mapping._metadata.uniqueIconIds.length
    },
    icons: results
  }, null, 2));

  console.log('✨ Extraction complete!');
  console.log(`📁 Output: ${outputDir}`);
  console.log(`📋 Info: ${infoPath}`);
  
  if (results.length < mapping._metadata.uniqueIconIds.length) {
    console.log('\n⚠️  Some icons need position configuration.');
    console.log('💡 Check the grid_extraction folders to find exact positions.');
  }
}

// Run extraction
extractTalentIconsByPosition().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

