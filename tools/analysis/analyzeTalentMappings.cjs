const fs = require('fs');

const lauPath = '../../package_kor/lau.json';
const lau = JSON.parse(fs.readFileSync(lauPath, 'utf-8'));

// Extract all short mappings (2-6 chars) with key talent-related characters
const keywords = [
  '火', '水', '木', '土', '雷', '暗', '圣', '魂', '物', '法',
  '平A', '暴击', '命中', '闪避', '吸血', '最终', '冷却',
  '剑', '枪', '拳', '杖', '弩', '炮', '乐器', '法球', '书卷', '暗器',
  '研发', '药物', '商业', '治疗', '宠物', '护盾',
  '武学', '魔法', '修真', '巫术', '射击', '弓箭', '拳击', '战斗',
  '忍术', '将略', '管理', '建造', '锻造', '修习', '研究',
  '历史', '炼药', '驯兽', '计略', '成长', '掉落', '经验',
  '学习', '召唤', '异能', '机甲', '受治', '防御', '伤害',
  '效果', '效率', '加成', '减伤', '增益', '减益', '时长'
];

const chineseToKorean = {};

lau.data.forEach(entry => {
  if (entry[1] && entry[2] && typeof entry[1][0] === 'string' && typeof entry[2][0] === 'string') {
    const chinese = entry[1][0];
    const korean = entry[2][0].replace(/\[.*?\]/g, '').trim();
    
    if (chinese.length >= 2 && chinese.length <= 6 && korean.length >= 2 && korean.length <= 10) {
      // Check if contains any keyword
      if (keywords.some(kw => chinese.includes(kw))) {
        chineseToKorean[chinese] = korean;
      }
    }
  }
});

console.log('=== Found talent-related mappings ===\n');
console.log(`Total: ${Object.keys(chineseToKorean).length}\n`);

// Sort by length for easier viewing
const sorted = Object.entries(chineseToKorean).sort((a, b) => a[0].length - b[0].length);

sorted.forEach(([ch, ko]) => {
  console.log(`${ko.padEnd(20)} <- ${ch}`);
});

// Save to file
const output = {
  totalMappings: Object.keys(chineseToKorean).length,
  mappings: chineseToKorean
};

fs.writeFileSync('talent-keyword-mappings.json', JSON.stringify(output, null, 2), 'utf-8');
console.log('\n✓ Saved to talent-keyword-mappings.json');

