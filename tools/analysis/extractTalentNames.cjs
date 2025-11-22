const fs = require('fs');
const path = require('path');

/**
 * Extract talent names and mappings from game data
 * This script analyzes the Korean game data to find talent short names
 */

const jsDataPath = path.join(__dirname, '../../../package_kor/js.json');
const outputPath = path.join(__dirname, '../../data/extracted/talent-mappings.json');

console.log('Reading Korean game data from', jsDataPath);

const jsData = JSON.parse(fs.readFileSync(jsDataPath, 'utf-8'));

// Search for talent-related keys
console.log('\n=== Searching for talent-related data ===\n');

const talentKeys = Object.keys(jsData).filter(key => {
  const lowerKey = key.toLowerCase();
  return lowerKey.includes('talent') || 
         lowerKey.includes('ability') || 
         lowerKey.includes('skill') ||
         key.includes('天赋') ||
         key.includes('能力') ||
         key.includes('技能');
});

console.log('Found talent keys:', talentKeys.length);
talentKeys.slice(0, 50).forEach(key => {
  console.log(`  ${key}: ${JSON.stringify(jsData[key]).substring(0, 100)}`);
});

// Look for specific talent names from CSV
const csvTalents = [
  'Fire Damage', 'Water Damage', 'Wood Damage', 'Earth Damage',
  'Lightning Damage', 'Dark Damage', 'Holy Damage', 'Spirit Damage',
  'Phys Damage', 'Spell Damage', 'Normal Attack Damage',
  'Crit Chance', 'Crit Damage', 'Hit Rate', 'Evasion Rate',
  'Life Steal', 'Final Damage', 'Skill Cooldown',
  'Sword Damage', 'Research Eff', 'Spell Effect', 'Medicine Effect',
  'Heal Bonus', 'Pet EXP', 'Wood Def', 'Lightning Def'
];

console.log('\n=== Searching for specific talent values ===\n');

const foundMappings = {};

csvTalents.forEach(talent => {
  // Search for this talent in the data
  for (const [key, value] of Object.entries(jsData)) {
    if (typeof value === 'string') {
      if (value === talent || value.includes(talent)) {
        console.log(`Found "${talent}" in key "${key}": ${value}`);
        if (!foundMappings[talent]) {
          foundMappings[talent] = [];
        }
        foundMappings[talent].push({ key, value });
      }
    } else if (typeof value === 'object' && value !== null) {
      // Check nested objects
      const jsonStr = JSON.stringify(value);
      if (jsonStr.includes(talent)) {
        console.log(`Found "${talent}" in key "${key}":`, JSON.stringify(value).substring(0, 200));
      }
    }
  }
});

console.log('\n=== Summary of found mappings ===\n');
console.log(JSON.stringify(foundMappings, null, 2));

// Try to find patterns by searching for known short names from user
const userProvidedShortNames = {
  '멸적': 'Normal Attack Damage',
  '참신': 'Crit Chance', 
  '극속': 'Skill Cooldown',
  '여릉': 'Lightning Damage',
  '긍파': 'Crit Chance',  // This might be wrong based on level mismatch
  '검파': 'Sword Damage',
  '파허': 'Hit Rate',
  '뇌신': 'Lightning Damage'
};

console.log('\n=== Searching for user-provided short names ===\n');

for (const [shortName, englishName] of Object.entries(userProvidedShortNames)) {
  for (const [key, value] of Object.entries(jsData)) {
    if (typeof value === 'string' && value.includes(shortName)) {
      console.log(`Found "${shortName}" (${englishName}) in key "${key}": ${value}`);
    }
  }
}

console.log('\n=== Done ===\n');

