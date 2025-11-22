const fs = require('fs');
const path = require('path');

/**
 * Extract talent short name mappings from lau.json (Chinese-Korean translation file)
 */

const lauPath = path.join(__dirname, '../../../package_kor/lau.json');
const outputPath = path.join(__dirname, '../../data/extracted/talent-short-names.json');

console.log('Reading translation data from', lauPath);

const lauData = JSON.parse(fs.readFileSync(lauPath, 'utf-8'));

// lau.json format: { c2array: true, size: [n, 3, 1], data: [[[id], [chinese], [korean]], ...] }
const translations = {};

lauData.data.forEach(entry => {
  if (entry && entry[1] && entry[2]) {
    const chinese = entry[1][0];
    const korean = entry[2][0];
    
    if (typeof chinese === 'string' && typeof korean === 'string') {
      // Clean up Korean text (remove markup like [size=20])
      const cleanKorean = korean.replace(/\[.*?\]/g, '').trim();
      if (cleanKorean) {
        translations[chinese] = cleanKorean;
      }
    }
  }
});

console.log(`Extracted ${Object.keys(translations).length} translations`);

// Known talent names from CSV (English) with their Chinese equivalents
// We need to find the mapping: English -> Chinese -> Korean short name
const talentNamesEnglishToChinese = {
  'Fire Damage': '火伤害',
  'Water Damage': '水伤害',
  'Wood Damage': '木伤害',
  'Earth Damage': '土伤害',
  'Lightning Damage': '雷伤害',
  'Dark Damage': '暗伤害',
  'Holy Damage': '圣伤害',
  'Spirit Damage': '魂伤害',
  'Phys Damage': '物伤害',
  'Spell Damage': '法伤害',
  'Normal Attack Damage': '平A伤害',
  'Crit Chance': '暴击率',
  'Crit Damage': '暴伤',
  'Hit Rate': '命中',
  'Evasion Rate': '闪避',
  'Life Steal': '吸血',
  'Final Damage': '最终伤害',
  'Skill Cooldown': '技能CD',
  'Sword Damage': '剑伤害',
  'Polearm Damage': '枪伤害',
  'Fist Damage': '拳伤害',
  'Staff Damage': '杖伤害',
  'Research Eff': '研发效率',
  'Spell Effect': '法术效果',
  'Medicine Effect': '药物效果',
  'Heal Bonus': '治疗加成',
  'Pet EXP': '宠物经验',
  'Wood Def': '木防御',
  'Lightning Def': '雷防御',
  'Commerce Eff': '商业效率',
  'Buff Duration': 'Buff时长',
  'Debuff Duration': 'Debuff时长',
  'Shield Bonus': '护盾加成',
  'Kung Fu Effect': '武学效果',
  'Magic Effect': '魔法效果',
  'Xiuzhen Effect': '修真效果',
  'Sorcery Effect': '巫术效果',
  'Gun&Crossbow Damage': '枪弩伤害',
  'Hidden Weapon Damage': '暗器伤害',
  'Cannon Damage': '火炮伤害',
  'Instrument Damage': '乐器伤害',
  'Orb Damage': '法球伤害',
  'Scroll Damage': '书卷伤害'
};

// Search for known patterns
console.log('\n=== Searching for talent short names ===\n');

const englishToKoreanShortName = {};
const foundMappings = [];

// Try to find patterns by searching for specific talent-related terms
const talentSearchTerms = [
  '伤害', '效率', '效果', '加成', '防御', '暴击', '命中', '闪避', '吸血',
  '最终', '技能', '治疗', '经验', '护盾', '武学', '魔法', '修真', '巫术'
];

const potentialTalents = {};

for (const [chinese, korean] of Object.entries(translations)) {
  // Check if this looks like a talent name
  for (const term of talentSearchTerms) {
    if (chinese.includes(term)) {
      if (!potentialTalents[term]) {
        potentialTalents[term] = [];
      }
      potentialTalents[term].push({ chinese, korean });
    }
  }
}

// Display some potential talents
console.log('\nPotential talent names by category:');
for (const [term, items] of Object.entries(potentialTalents)) {
  if (items.length <= 20) {
    console.log(`\n${term}:`);
    items.forEach(item => {
      console.log(`  ${item.chinese} -> ${item.korean}`);
    });
  }
}

// Now try to match English talent names
console.log('\n\n=== Matching English talent names to Korean short names ===\n');

for (const [english, chinese] of Object.entries(talentNamesEnglishToChinese)) {
  if (translations[chinese]) {
    englishToKoreanShortName[english] = translations[chinese];
    foundMappings.push({ english, chinese, korean: translations[chinese] });
    console.log(`✓ ${english} -> ${chinese} -> ${translations[chinese]}`);
  } else {
    console.log(`✗ ${english} -> ${chinese} -> NOT FOUND`);
  }
}

// Save the mappings
const outputData = {
  _metadata: {
    source: 'package_kor/lau.json',
    extractedAt: new Date().toISOString(),
    totalMappings: foundMappings.length
  },
  mappings: englishToKoreanShortName,
  allMappings: foundMappings
};

fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
console.log(`\n✓ Saved ${foundMappings.length} talent mappings to`, outputPath);

