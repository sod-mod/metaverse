const fs = require('fs');
const path = require('path');

/**
 * Generate talent short name mappings
 * Uses manual English->Chinese mapping (based on user feedback and lau.json analysis)
 * Then maps Chinese->Korean using package_kor/lau.json
 */

const lauKoPath = path.join(__dirname, '../../../package_kor/lau.json');
const heroesPath = path.join(__dirname, '../../data/extracted/heroes.json');
const outputPath = path.join(__dirname, '../../data/extracted/talent-short-names.json');

console.log('Reading translation data from', lauKoPath);

const lauKo = JSON.parse(fs.readFileSync(lauKoPath, 'utf-8'));
const heroesData = JSON.parse(fs.readFileSync(heroesPath, 'utf-8'));

// Extract Chinese -> Korean from package_kor/lau.json (range 1650-1850 + additional)
console.log('\n=== Extracting Chinese-Korean mappings from lau.json ===\n');

const chineseToKorean = {};

// Main talent range (where most talents are stored)
for (let i = 1650; i <= 1850; i++) {
  const entry = lauKo.data[i];
  if (entry && entry[1] && entry[2]) {
    const chinese = entry[1][0];
    const korean = entry[2][0];
    if (typeof chinese === 'string' && typeof korean === 'string') {
      const cleanKorean = korean.replace(/\[.*?\]/g, '').trim();
      if (cleanKorean) {
        chineseToKorean[chinese] = cleanKorean;
      }
    }
  }
}

// Additional ranges for talents found outside main range
const additionalRanges = [[100, 300], [2000, 2800], [3800, 4000]];
additionalRanges.forEach(([start, end]) => {
  for (let i = start; i <= end; i++) {
    const entry = lauKo.data[i];
    if (entry && entry[1] && entry[2]) {
      const chinese = entry[1][0];
      const korean = entry[2][0];
      if (typeof chinese === 'string' && typeof korean === 'string') {
        const cleanKorean = korean.replace(/\[.*?\]/g, '').trim();
        if (cleanKorean && !chineseToKorean[chinese]) {
          chineseToKorean[chinese] = cleanKorean;
        }
      }
    }
  }
});

console.log(`Extracted ${Object.keys(chineseToKorean).length} Chinese-Korean mappings`);

/**
 * MANUAL MAPPING: CSV English -> Chinese
 * This mapping is based on:
 * 1. User feedback (confirmed mappings)
 * 2. Analysis of lau.json index 1650-1850
 * 3. Logical deduction from Chinese character meanings
 */
const englishToChinese = {
  // Confirmed from user feedback
  'Normal Attack Damage': '灭敌',    // 멸적
  'Crit Chance': '斩神',             // 참신
  'Skill Cooldown': '极速',          // 극속
  'Lightning Damage': '雷神',        // 뇌신
  'Sword Damage': '剑破',            // 검파
  'Hit Rate': '破虚',                // 파허
  'Fist Damage': '拳破',             // 권파
  
  // Damage types
  'Fire Damage': '炎狱',             // 염옥
  'Water Damage': '控水',            // 공수
  'Wood Damage': '生木',             // 생목
  'Earth Damage': '地裂',            // 지렬
  'Dark Damage': '暗蚀',             // 암식
  'Holy Damage': '天谴',             // 천견
  'Spirit Damage': '魂裂',           // 혼렬
  'Phys Damage': '广域',             // 광역
  'Spell Damage': '法尊',            // 법존
  
  // Combat stats
  'Evasion Rate': '闪避',            // 섬피
  'Life Steal': '嗜血',              // 기혈 (嗜血)
  'Final Damage': '灭世',            // 멸세
  'Crit Damage': '绝杀',             // 절살
  'Lifesteal': '嗜血',               // 기혈
  
  // Skills & Buffs
  'Buff Duration': '恒在',           // 항재
  'Debuff Duration': '封魔',         // 봉마
  
  // Weapon damages
  'Polearm Damage': '穿云',          // 천운
  'Staff Damage': '仙方',            // 선방
  'Gun&Crossbow Damage': '射日',     // 사일
  'Hidden Weapon Damage': '影破',    // 영파
  'Cannon Damage': '轰炸',           // 굉작
  'Instrument Damage': '书灵',       // 서령
  'Orb Damage': '器魂',              // 기혼
  'Scroll Damage': '圣典',           // 성전
  'Book/Scroll': '圣典',             // 성전
  
  // Efficiency & Effects
  'Research Eff': '悟学',            // 오학
  'Spell Effect': '符仙',            // 부선
  'Medicine Effect': '悬壶',         // 현호
  'Commerce Eff': '销售',            // 판매
  'Heal Bonus': '济世',              // 제세
  'Shield Bonus': '圣庇',            // 성비
  
  // Job effects
  'Kung Fu Effect': '武师',          // 무사
  'Magic Effect': '魔导',            // 마도
  'Xiuzhen Effect': '仙卫',          // 선위
  'Sorcery Effect': '符仙',          // 부선
  'Marksmanship Effect': '王牌',     // 왕패
  'Archery Effect': '贯穹',          // 관궁
  'Boxing Effect': '拳破',           // 권파
  'Combat Effect': '战圣',           // 전성
  'Ninjutsu Effect': '上忍',         // 상인
  'Genera Effect': '天将',           // 천장
  
  // Work efficiency
  'Manage Eff': '勤政',              // 근정
  'Build Eff': '架构',               // 가구
  'Forge Eff': '熔炼',               // 용련
  'Study Eff': '通学',               // 통학
  'History Eff': '文曲',             // 문곡
  'Pharmacy Eff': '医仙',            // 의선
  'Animals Eff': '兽魂',             // 수혼
  'Strategy Eff': '军师',            // 군사
  'Work Efficiency': '勤政',         // 근정
  
  // Growth & Rewards
  'Career Growth': '锐进',           // 예진
  'Item Drop': '道具',               // 도구
  'Exp Bonus': '跃阶',               // 약계
  'Skill Learning': '通晓',          // 통효
  'Pet EXP': '仙兽',                 // 선수
  
  // Summoning
  'Summoning Time': '召唤',          // 소환
  'Summons Effect': '唤神',          // 환신
  'Summoning Strength': '唤世',      // 환세
  'Summon Eff': '唤神',              // 환신
  'Summon Effect': '召唤',           // 소환
  'Summon Str': '唤世',              // 환세
  'Summon Time': '召唤',             // 소환
  
  // Special
  'Superpower Effect': '超能',       // 초능
  'Superpower Eff': '超능',          // 초능
  'Mecha Effect': '机甲',            // 기갑
  
  // Defense & Reduction
  'Phys Damage Reduce': '守虚',      // 수허
  'Spell Damage Reduce': '封神',     // 봉신
  'Final Damage Reduce': '恒固',     // 항고
  'Heal Received': '受疗',           // (needs to be added to lau.json range)
  
  // Elemental Defense
  'Fire Def': '融火',                // 융화
  'Water Def': '化水',               // 화수
  'Wood Def': '神木',                // 신목
  'Earth Def': '裂土',               // 열토
  'Lightning Def': '化雷',           // 화뢰
  'Dark Def': '暗灭',                // 암멸
  'Holy Def': '天庇',                // 천비
  'Spirit Def': '御魂',              // 어혼
  'Spririt Def': '御魂',             // 어혼 (typo in data)
  'Fire Damage Reduce': '融火'       // 융화
};

// Generate English to Korean short name mappings
const englishToKoreanShortName = {};
const unmappedTalents = [];
const foundMappings = [];

console.log('\n=== Mapping English talents to Korean short names ===\n');

for (const [english, chinese] of Object.entries(englishToChinese)) {
  if (chineseToKorean[chinese]) {
    englishToKoreanShortName[english] = chineseToKorean[chinese];
    foundMappings.push({ english, chinese, korean: chineseToKorean[chinese] });
    console.log(`✓ ${english.padEnd(30)} -> ${chinese.padEnd(6)} -> ${chineseToKorean[chinese]}`);
  } else {
    unmappedTalents.push({ english, chinese });
    console.log(`✗ ${english.padEnd(30)} -> ${chinese.padEnd(6)} -> NOT FOUND in lau.json`);
  }
}

console.log(`\n✓ Successfully mapped: ${foundMappings.length}/${Object.keys(englishToChinese).length}`);
console.log(`✗ Failed to map: ${unmappedTalents.length}\n`);

// Check coverage in actual hero data
console.log('=== Checking coverage in hero data ===\n');
const talentsInUse = new Set();
const unmappedInHeroes = new Set();

heroesData.forEach(hero => {
  if (hero.talents) {
    ['talent1', 'talent2', 'talent3', 'talent4'].forEach(key => {
      if (hero.talents[key]) {
        talentsInUse.add(hero.talents[key]);
        if (!englishToKoreanShortName[hero.talents[key]]) {
          unmappedInHeroes.add(hero.talents[key]);
        }
      }
    });
  }
});

console.log(`Total unique talents in use: ${talentsInUse.size}`);
console.log(`Talents with Korean short names: ${talentsInUse.size - unmappedInHeroes.size}`);
console.log(`Talents WITHOUT Korean short names: ${unmappedInHeroes.size}\n`);

if (unmappedInHeroes.size > 0) {
  console.log('Unmapped talents in heroes.json:');
  Array.from(unmappedInHeroes).sort().forEach(talent => {
    console.log(`  - ${talent}`);
  });
  console.log();
}

// Save the mappings
const outputData = {
  _metadata: {
    source: 'Manual English->Chinese mapping + package_kor/lau.json (index 1650-1850)',
    extractedAt: new Date().toISOString(),
    totalMappings: foundMappings.length,
    coverage: `${talentsInUse.size - unmappedInHeroes.size}/${talentsInUse.size}`,
    method: 'Manual mapping based on user feedback and lau.json analysis'
  },
  mappings: englishToKoreanShortName,
  allMappings: foundMappings,
  unmappedTalents: Array.from(unmappedInHeroes).sort()
};

fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
console.log(`✓ Saved talent mappings to ${outputPath}`);
console.log(`  Coverage: ${Math.round((talentsInUse.size - unmappedInHeroes.size) / talentsInUse.size * 100)}%`);
