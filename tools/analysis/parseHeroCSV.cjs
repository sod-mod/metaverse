const fs = require('fs');
const path = require('path');

// Universe name mapping
const universeMapping = {
  '3 Kingdoms': '3 Kingdoms',
  'Jianghu': 'Jianghu',
  'Mojin': 'Mojin',
  'Crusades': 'Crusades',
  'Liaozhai': 'Liaozhai',
  'Japan': 'Japan',
  'WW2': 'WW2',
  'Mortal Cultivation': 'Mortal Cultivation',
  'Planet Wars': 'Planet Wars',
  'Qi Continent': 'Qi Continent',
  'Eldermyst': 'Eldermyst',
  'Superhero': 'Superhero',
  'Journey to the West': 'Journey to the West',
  'Free': 'Free'
};

// Class mapping
const classMapping = {
  'Scholar': 'Scholar',
  'Medic': 'Medic',
  'Warrior': 'Warrior',
  'Guard': 'Guard',
  'Archer': 'Archer'
};

// Read the CSV file
const csvPath = path.join(__dirname, '../../Multiverse Loot Hunter - hero.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Split into lines
const lines = csvContent.split('\n');

// Row 6 (index 5) contains the actual headers
const headerLine = lines[5];
console.log('📋 Headers:', headerLine.substring(0, 200));

// Parse heroes starting from row 7 (index 6)
const heroes = [];

for (let i = 6; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parse CSV line (handle commas inside quoted strings)
  const values = parseCSVLine(line);
  
  // Column 2 (index 1) is Hero Name
  const heroName = values[1] ? values[1].trim() : '';
  if (!heroName || heroName === '') continue;
  
  // Column 1 (index 0) is the hero ID
  const heroId = parseInt(values[0]) || null;
  
  // Column 3 (index 2) is # (hero number in universe)
  const heroNumber = values[2] ? values[2].trim() : '';
  
  // Column 4 (index 3) is Universe
  const universe = values[3] ? values[3].trim() : '';
  
  // Column 5 (index 4) is Stage
  const stage = values[4] ? values[4].trim() : '';
  
  // Column 6 (index 5) is Class
  const heroClass = values[5] ? values[5].trim() : '';
  
  // Column 7 (index 6) is Talent Weapon
  const talentWeapon = values[6] ? values[6].trim() : '';
  
  // Talent levels (columns 8-11, indices 7-10)
  const talentLevels = {
    level1: parseInt(values[7]) || 0,
    level2: parseInt(values[8]) || 0,
    level3: parseInt(values[9]) || 0,
    level4: parseInt(values[10]) || 0
  };
  
  // Talent names (columns 12-15, indices 11-14)
  const talents = {
    ...talentLevels,
    talent1: values[11] ? values[11].trim() : '',
    talent2: values[12] ? values[12].trim() : '',
    talent3: values[13] ? values[13].trim() : '',
    talent4: values[14] ? values[14].trim() : ''
  };
  
  // Stats (columns 16-21, indices 15-20)
  const stats = {
    str: parseInt(values[15]) || 0,
    int: parseInt(values[16]) || 0,
    con: parseInt(values[17]) || 0,
    agi: parseInt(values[18]) || 0,
    men: parseInt(values[19]) || 0,
    total: parseInt(values[20]) || 0
  };
  
  // Usable stats (columns 23-26, indices 22-25)
  const usableStats = {
    str: parseInt(values[22]) || 0,
    strAgi: parseInt(values[23]) || 0,
    int: parseInt(values[24]) || 0,
    intAgi: parseInt(values[25]) || 0
  };
  
  // Jobs/Skills (various columns around 27-42)
  const jobs = {
    animal: values[27] ? values[27].trim() : '',
    manage: values[28] ? values[28].trim() : '',
    slot1: values[29] ? values[29].trim() : '',
    forge: values[30] ? values[30].trim() : '',
    study: values[31] ? values[31].trim() : '',
    slot2: values[32] ? values[32].trim() : '',
    research: values[33] ? values[33].trim() : '',
    slot3: values[34] ? values[34].trim() : '',
    builder: values[35] ? values[35].trim() : '',
    commerce: values[36] ? values[36].trim() : '',
    pharma: values[37] ? values[37].trim() : '',
    strategy: values[38] ? values[38].trim() : '',
    strategyEff: values[39] ? values[39].trim() : '',
    history: values[40] ? values[40].trim() : '',
    slot4: values[41] ? values[41].trim() : ''
  };
  
  // Build and requirements (columns 43-47, indices 42-46)
  const build = values[42] ? values[42].trim() : '';
  const requirements = {
    req1: values[43] ? values[43].trim() : '',
    req2: values[44] ? values[44].trim() : '',
    req3: values[45] ? values[45].trim() : '',
    req4: values[46] ? values[46].trim() : ''
  };
  
  const hero = {
    id: heroId,
    name: heroName,
    number: heroNumber,
    universe: universe,
    stage: stage,
    class: heroClass,
    talentWeapon: talentWeapon,
    talents: talents,
    stats: stats,
    usableStats: usableStats,
    jobs: jobs,
    build: build,
    requirements: requirements
  };
  
  heroes.push(hero);
  
  // Debug first few heroes
  if (i < 10) {
    console.log(`\n📌 Hero ${heroId}: ${heroName}`);
    console.log(`   Universe: ${universe}`);
    console.log(`   Class: ${heroClass}`);
    console.log(`   Stage: ${stage}`);
  }
}

// Helper function to parse CSV line (handles commas inside quotes)
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

// Create output directory
const outputDir = path.join(__dirname, '../../src/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write to JSON file
const outputPath = path.join(outputDir, 'heroes_from_csv.json');
fs.writeFileSync(outputPath, JSON.stringify(heroes, null, 2));

console.log(`\n✅ Parsed ${heroes.length} heroes from CSV`);
console.log(`📝 Output: ${outputPath}`);

// Print sample heroes for verification
if (heroes.length > 0) {
  console.log('\n📋 First 3 heroes:');
  heroes.slice(0, 3).forEach(hero => {
    console.log(`  ${hero.id}. ${hero.name} - ${hero.universe} (${hero.class}) - Stage ${hero.stage}`);
  });
}

// Print universe and class statistics
const universeStats = {};
const classStats = {};

heroes.forEach(hero => {
  universeStats[hero.universe] = (universeStats[hero.universe] || 0) + 1;
  classStats[hero.class] = (classStats[hero.class] || 0) + 1;
});

console.log('\n📊 Universe distribution:');
Object.entries(universeStats).sort((a, b) => b[1] - a[1]).forEach(([universe, count]) => {
  console.log(`  ${universe}: ${count} heroes`);
});

console.log('\n📊 Class distribution:');
Object.entries(classStats).sort((a, b) => b[1] - a[1]).forEach(([heroClass, count]) => {
  console.log(`  ${heroClass}: ${count} heroes`);
});

