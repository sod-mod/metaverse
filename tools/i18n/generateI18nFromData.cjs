#!/usr/bin/env node

/**
 * Generate i18n translation files from game data files
 * Extracts translations directly from package and package_kor directories:
 * 1. skillclass: package/mc.json + package/lau.json (EN), package_kor/lau.json (KO)
 * 2. effectType: package/sx.json + package/lau.json (EN), package_kor/sx.json + package_kor/lau.json (KO)
 * 3. Hardcoded maps: damageType, skillCategory, targetType (from SkillList.jsx)
 */

const fs = require('fs');
const path = require('path');
const { TypeConverter } = require('../parsers/core/index.cjs');

const I18N_DIR = path.join(__dirname, '../../src/i18n/locales');
const PACKAGE_DIR = path.join(__dirname, '../../../package');
const PACKAGE_KOR_DIR = path.join(__dirname, '../../../package_kor');

// Hardcoded translations from SkillList.jsx
const DAMAGE_TYPE_MAP = {
  en: {
    '物理': 'Physical',
    '法术': 'Magic',
    '辅助': 'Support',
    '生命': 'Heal',
    '被动': 'Passive',
    '其他': 'Other'
  },
  ko: {
    '物理': '물리',
    '法术': '마법',
    '辅助': '보조',
    '生命': '생명',
    '被动': '패시브',
    '其他': '기타'
  }
};

const SKILL_CATEGORY_MAP = {
  en: {
    '近战攻击': 'Melee Attack',
    '远程攻击': 'Ranged Attack',
    '生命治疗': 'Healing',
    '自身增加能量': 'Self Energy',
    '我方状态': 'Ally Buff',
    '自身治疗': 'Self Heal',
    '自身状态': 'Self Buff',
    '我方复活': 'Ally Revive',
    '被动技能': 'Passive',
    '召唤': 'Summon',
    '自身护盾': 'Self Shield',
    '增加能量': 'Energy Gain',
    '我方进度': 'Ally Progress'
  },
  ko: {
    '近战攻击': '근접 공격',
    '远程攻击': '원거리 공격',
    '生命治疗': '생명 치유',
    '自身增加能量': '자신 에너지 증가',
    '我方状态': '아군 상태',
    '自身治疗': '자가 치유',
    '自身状态': '자신 상태',
    '我方复活': '아군 부활',
    '被动技能': '패시브',
    '召唤': '소환',
    '自身护盾': '자신 보호막',
    '增加能量': '에너지 증가',
    '我方进度': '아군 진행도'
  }
};

const TARGET_TYPE_MAP = {
  en: {
    '敌方': 'Enemy',
    '我方': 'Ally',
    '无': 'None'
  },
  ko: {
    '敌方': '적',
    '我方': '아군',
    '无': '없음'
  }
};

function loadExistingI18n(lang) {
  const filePath = path.join(I18N_DIR, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return {};
}

function saveI18n(lang, data) {
  const filePath = path.join(I18N_DIR, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ Updated ${lang}.json`);
}

/**
 * Parse skill classes from mc.json and lau.json
 * Reuses logic from SkillParser.parseClassType()
 */
function extractSkillClasses(packageDir, packageKorDir) {
  const mcPath = path.join(packageDir, 'mc.json');
  const lauPathEN = path.join(packageDir, 'lau.json');
  const lauPathKO = path.join(packageKorDir, 'lau.json');
  
  if (!fs.existsSync(mcPath)) {
    console.warn(`⚠️  mc.json not found: ${mcPath}`);
    return [];
  }
  
  if (!fs.existsSync(lauPathEN)) {
    console.warn(`⚠️  lau.json (EN) not found: ${lauPathEN}`);
    return [];
  }
  
  const mcData = JSON.parse(fs.readFileSync(mcPath, 'utf8'));
  const lauDataEN = JSON.parse(fs.readFileSync(lauPathEN, 'utf8'));
  const lauDataKO = fs.existsSync(lauPathKO) ? JSON.parse(fs.readFileSync(lauPathKO, 'utf8')) : null;
  
  const classes = new Map();
  
  // Extract all class IDs from mc.json
  for (const row of mcData.data || []) {
    if (!row || !row[0] || !row[2] || !row[2][0]) continue;
    
    const classId = TypeConverter.toNumber(row[0][0]);
    const classNameCN = TypeConverter.toString(row[2][0]);
    
    if (!classNameCN) continue;
    
    // Find in lau.json (EN)
    let classNameEN = null;
    for (const lauRow of lauDataEN.data || []) {
      if (lauRow && lauRow[1] && lauRow[1][0] === classNameCN) {
        if (lauRow[2] && lauRow[2][0]) {
          const translated = TypeConverter.toString(lauRow[2][0]);
          classNameEN = translated.replace(/\[.*?\]/g, '').trim();
        }
        break;
      }
    }
    
    // Find in lau.json (KO)
    let classNameKO = null;
    if (lauDataKO) {
      for (const lauRow of lauDataKO.data || []) {
        if (lauRow && lauRow[1] && lauRow[1][0] === classNameCN) {
          if (lauRow[2] && lauRow[2][0]) {
            const translated = TypeConverter.toString(lauRow[2][0]);
            classNameKO = translated.replace(/\[.*?\]/g, '').trim();
          }
          break;
        }
      }
    }
    
    if (!classes.has(classId)) {
      classes.set(classId, {
        id: classId,
        nameCN: classNameCN,
        nameEN: classNameEN,
        nameKO: classNameKO
      });
    }
  }
  
  return Array.from(classes.values()).sort((a, b) => a.id - b.id);
}

/**
 * Parse effect types from sx.json and lau.json
 * Reuses logic from EffectTypeParser
 */
function extractEffectTypes(packageDir, packageKorDir) {
  const sxPath = path.join(packageDir, 'sx.json');
  const lauPathEN = path.join(packageDir, 'lau.json');
  const sxPathKO = path.join(packageKorDir, 'sx.json');
  const lauPathKO = path.join(packageKorDir, 'lau.json');
  
  if (!fs.existsSync(sxPath)) {
    console.warn(`⚠️  sx.json not found: ${sxPath}`);
    return [];
  }
  
  if (!fs.existsSync(lauPathEN)) {
    console.warn(`⚠️  lau.json (EN) not found: ${lauPathEN}`);
    return [];
  }
  
  const sxData = JSON.parse(fs.readFileSync(sxPath, 'utf8'));
  const lauDataEN = JSON.parse(fs.readFileSync(lauPathEN, 'utf8'));
  const lauDataKO = fs.existsSync(lauPathKO) ? JSON.parse(fs.readFileSync(lauPathKO, 'utf8')) : null;
  const sxDataKO = fs.existsSync(sxPathKO) ? JSON.parse(fs.readFileSync(sxPathKO, 'utf8')) : null;
  
  const effectTypes = [];
  
  // Build lookup map for lau.json
  const lauMapEN = new Map();
  for (const lauRow of lauDataEN.data || []) {
    if (lauRow && lauRow[1] && lauRow[1][0]) {
      const cn = TypeConverter.toString(lauRow[1][0]);
      if (lauRow[2] && lauRow[2][0]) {
        const translated = TypeConverter.toString(lauRow[2][0]);
        lauMapEN.set(cn, translated.replace(/\[.*?\]/g, '').trim());
      }
    }
  }
  
  const lauMapKO = new Map();
  if (lauDataKO) {
    for (const lauRow of lauDataKO.data || []) {
      if (lauRow && lauRow[1] && lauRow[1][0]) {
        const cn = TypeConverter.toString(lauRow[1][0]);
        if (lauRow[2] && lauRow[2][0]) {
          const translated = TypeConverter.toString(lauRow[2][0]);
          lauMapKO.set(cn, translated.replace(/\[.*?\]/g, '').trim());
        }
      }
    }
  }
  
  // Parse effect types from sx.json
  for (let i = 1; i < sxData.data.length; i++) {
    const row = sxData.data[i];
    if (!row || !row[0] || !row[1]) continue;
    
    const id = TypeConverter.toNumber(row[0][0]);
    const nameCN = TypeConverter.toString(row[1][0]);
    
    if (!id || !nameCN) continue;
    
    const nameEN = lauMapEN.get(nameCN) || null;
    const nameKO = lauMapKO.get(nameCN) || null;
    
    effectTypes.push({
      id,
      nameCN,
      nameEN,
      nameKO
    });
  }
  
  return effectTypes.sort((a, b) => a.id - b.id);
}

/**
 * Parse hero names from js.json and lau.json
 * Reuses logic from HeroParser
 */
function extractHeroes(packageDir, packageKorDir) {
  const jsPath = path.join(packageDir, 'js.json');
  const lauPathEN = path.join(packageDir, 'lau.json');
  const lauPathKO = path.join(packageKorDir, 'lau.json');
  
  if (!fs.existsSync(jsPath)) {
    console.warn(`⚠️  js.json not found: ${jsPath}`);
    return [];
  }
  
  if (!fs.existsSync(lauPathEN)) {
    console.warn(`⚠️  lau.json (EN) not found: ${lauPathEN}`);
    return [];
  }
  
  const jsData = JSON.parse(fs.readFileSync(jsPath, 'utf8'));
  const lauDataEN = JSON.parse(fs.readFileSync(lauPathEN, 'utf8'));
  const lauDataKO = fs.existsSync(lauPathKO) ? JSON.parse(fs.readFileSync(lauPathKO, 'utf8')) : null;
  
  // Build lookup map for lau.json
  const lauMapEN = new Map();
  for (const lauRow of lauDataEN.data || []) {
    if (lauRow && lauRow[1] && lauRow[1][0]) {
      const cn = TypeConverter.toString(lauRow[1][0]);
      if (lauRow[2] && lauRow[2][0]) {
        const translated = TypeConverter.toString(lauRow[2][0]);
        lauMapEN.set(cn, translated.replace(/\[.*?\]/g, '').trim());
      }
    }
  }
  
  const lauMapKO = new Map();
  if (lauDataKO) {
    for (const lauRow of lauDataKO.data || []) {
      if (lauRow && lauRow[1] && lauRow[1][0]) {
        const cn = TypeConverter.toString(lauRow[1][0]);
        if (lauRow[2] && lauRow[2][0]) {
          const translated = TypeConverter.toString(lauRow[2][0]);
          lauMapKO.set(cn, translated.replace(/\[.*?\]/g, '').trim());
        }
      }
    }
  }
  
  const heroes = [];
  
  // Parse heroes from js.json (skip row 0 which is header)
  for (let i = 1; i < jsData.data.length; i++) {
    const row = jsData.data[i];
    if (!row || !row[0] || !row[1]) continue;
    
    const id = TypeConverter.toNumber(row[0][0]);
    const nameCN = TypeConverter.toString(row[1][0]);
    
    if (!id || !nameCN) continue;
    
    const nameEN = lauMapEN.get(nameCN) || null;
    const nameKO = lauMapKO.get(nameCN) || null;
    
    heroes.push({
      id,
      nameCN,
      nameEN,
      nameKO
    });
  }
  
  return heroes.sort((a, b) => a.id - b.id);
}

/**
 * Parse talent names from mg.json and lau.json
 * Reuses logic from TalentParser
 */
function extractTalents(packageDir, packageKorDir) {
  const mgPath = path.join(packageDir, 'mg.json');
  const lauPathEN = path.join(packageDir, 'lau.json');
  const lauPathKO = path.join(packageKorDir, 'lau.json');
  
  if (!fs.existsSync(mgPath)) {
    console.warn(`⚠️  mg.json not found: ${mgPath}`);
    return [];
  }
  
  if (!fs.existsSync(lauPathEN)) {
    console.warn(`⚠️  lau.json (EN) not found: ${lauPathEN}`);
    return [];
  }
  
  const mgData = JSON.parse(fs.readFileSync(mgPath, 'utf8'));
  const lauDataEN = JSON.parse(fs.readFileSync(lauPathEN, 'utf8'));
  const lauDataKO = fs.existsSync(lauPathKO) ? JSON.parse(fs.readFileSync(lauPathKO, 'utf8')) : null;
  
  // Build lookup map for lau.json
  const lauMapEN = new Map();
  for (const lauRow of lauDataEN.data || []) {
    if (lauRow && lauRow[1] && lauRow[1][0]) {
      const cn = TypeConverter.toString(lauRow[1][0]);
      if (lauRow[2] && lauRow[2][0]) {
        const translated = TypeConverter.toString(lauRow[2][0]);
        lauMapEN.set(cn, translated.replace(/\[.*?\]/g, '').trim());
      }
    }
  }
  
  const lauMapKO = new Map();
  if (lauDataKO) {
    for (const lauRow of lauDataKO.data || []) {
      if (lauRow && lauRow[1] && lauRow[1][0]) {
        const cn = TypeConverter.toString(lauRow[1][0]);
        if (lauRow[2] && lauRow[2][0]) {
          const translated = TypeConverter.toString(lauRow[2][0]);
          lauMapKO.set(cn, translated.replace(/\[.*?\]/g, '').trim());
        }
      }
    }
  }
  
  const talents = [];
  
  // Parse talents from mg.json (skip row 0 which is header)
  for (let i = 1; i < mgData.data.length; i++) {
    const row = mgData.data[i];
    if (!row || !row[0] || !row[1]) continue;
    
    const id = TypeConverter.toNumber(row[0][0]);
    const nameCN = TypeConverter.toString(row[1][0]);
    
    if (!id || !nameCN) continue;
    
    const nameEN = lauMapEN.get(nameCN) || null;
    const nameKO = lauMapKO.get(nameCN) || null;
    
    talents.push({
      id,
      nameCN,
      nameEN,
      nameKO
    });
  }
  
  return talents.sort((a, b) => a.id - b.id);
}

/**
 * Parse skill names from jn.json and lau.json
 * Reuses logic from SkillParser
 */
function extractSkills(packageDir, packageKorDir) {
  const jnPath = path.join(packageDir, 'jn.json');
  const lauPathEN = path.join(packageDir, 'lau.json');
  const lauPathKO = path.join(packageKorDir, 'lau.json');
  
  if (!fs.existsSync(jnPath)) {
    console.warn(`⚠️  jn.json not found: ${jnPath}`);
    return [];
  }
  
  if (!fs.existsSync(lauPathEN)) {
    console.warn(`⚠️  lau.json (EN) not found: ${lauPathEN}`);
    return [];
  }
  
  const jnData = JSON.parse(fs.readFileSync(jnPath, 'utf8'));
  const lauDataEN = JSON.parse(fs.readFileSync(lauPathEN, 'utf8'));
  const lauDataKO = fs.existsSync(lauPathKO) ? JSON.parse(fs.readFileSync(lauPathKO, 'utf8')) : null;
  
  // Build lookup map for lau.json
  const lauMapEN = new Map();
  for (const lauRow of lauDataEN.data || []) {
    if (lauRow && lauRow[1] && lauRow[1][0]) {
      const cn = TypeConverter.toString(lauRow[1][0]);
      if (lauRow[2] && lauRow[2][0]) {
        const translated = TypeConverter.toString(lauRow[2][0]);
        lauMapEN.set(cn, translated.replace(/\[.*?\]/g, '').trim());
      }
    }
  }
  
  const lauMapKO = new Map();
  if (lauDataKO) {
    for (const lauRow of lauDataKO.data || []) {
      if (lauRow && lauRow[1] && lauRow[1][0]) {
        const cn = TypeConverter.toString(lauRow[1][0]);
        if (lauRow[2] && lauRow[2][0]) {
          const translated = TypeConverter.toString(lauRow[2][0]);
          lauMapKO.set(cn, translated.replace(/\[.*?\]/g, '').trim());
        }
      }
    }
  }
  
  const skills = [];
  
  // Parse skills from jn.json (skip row 0 which is header)
  for (let i = 1; i < jnData.data.length; i++) {
    const row = jnData.data[i];
    if (!row || !row[0] || !row[1]) continue;
    
    const id = TypeConverter.toNumber(row[0][0]);
    const nameCN = TypeConverter.toString(row[1][0]);
    const descriptionCN = row[14] ? TypeConverter.toString(row[14][0]) : null;
    
    if (!id || !nameCN) continue;
    
    const nameEN = lauMapEN.get(nameCN) || null;
    const nameKO = lauMapKO.get(nameCN) || null;
    const descriptionEN = descriptionCN ? lauMapEN.get(descriptionCN) || null : null;
    const descriptionKO = descriptionCN ? lauMapKO.get(descriptionCN) || null : null;
    
    skills.push({
      id,
      nameCN,
      nameEN,
      nameKO,
      descriptionCN,
      descriptionEN,
      descriptionKO
    });
  }
  
  return skills.sort((a, b) => a.id - b.id);
}

function generateI18n() {
  console.log('🌐 Generating i18n files from game data...\n');
  
  // Check package directories
  if (!fs.existsSync(PACKAGE_DIR)) {
    console.error(`❌ Package directory not found: ${PACKAGE_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(PACKAGE_KOR_DIR)) {
    console.warn(`⚠️  Package_kor directory not found: ${PACKAGE_KOR_DIR}`);
    console.warn('   Korean translations will be skipped\n');
  }
  
  // Load existing i18n files
  const enData = loadExistingI18n('en');
  const koData = loadExistingI18n('ko');
  const zhData = loadExistingI18n('zh');
  
  // Extract skill classes
  console.log('📦 Extracting skill classes...');
  const skillClasses = extractSkillClasses(PACKAGE_DIR, PACKAGE_KOR_DIR);
  console.log(`   Found ${skillClasses.length} skill classes\n`);
  
  // Extract effect types
  console.log('📦 Extracting effect types...');
  const effectTypes = extractEffectTypes(PACKAGE_DIR, PACKAGE_KOR_DIR);
  console.log(`   Found ${effectTypes.length} effect types\n`);
  
  // Extract heroes
  console.log('📦 Extracting heroes...');
  const heroes = extractHeroes(PACKAGE_DIR, PACKAGE_KOR_DIR);
  console.log(`   Found ${heroes.length} heroes\n`);
  
  // Extract talents
  console.log('📦 Extracting talents...');
  const talents = extractTalents(PACKAGE_DIR, PACKAGE_KOR_DIR);
  console.log(`   Found ${talents.length} talents\n`);
  
  // Extract skills
  console.log('📦 Extracting skills...');
  const skills = extractSkills(PACKAGE_DIR, PACKAGE_KOR_DIR);
  console.log(`   Found ${skills.length} skills\n`);
  
  // Initialize skillclass section
  if (!enData.skillclass) enData.skillclass = {};
  if (!koData.skillclass) koData.skillclass = {};
  if (!zhData.skillclass) zhData.skillclass = {};
  
  // Add skill classes
  for (const skillClass of skillClasses) {
    if (skillClass.nameEN) {
      enData.skillclass[String(skillClass.id)] = skillClass.nameEN;
    }
    if (skillClass.nameKO) {
      koData.skillclass[String(skillClass.id)] = skillClass.nameKO;
    }
    if (skillClass.nameCN) {
      zhData.skillclass[String(skillClass.id)] = skillClass.nameCN;
    }
  }
  
  // Initialize effectType section
  if (!enData.effectType) enData.effectType = {};
  if (!koData.effectType) koData.effectType = {};
  if (!zhData.effectType) zhData.effectType = {};
  
  // Add effect types
  for (const effectType of effectTypes) {
    if (effectType.nameEN) {
      enData.effectType[String(effectType.id)] = effectType.nameEN;
    }
    if (effectType.nameKO) {
      koData.effectType[String(effectType.id)] = effectType.nameKO;
    }
    if (effectType.nameCN) {
      zhData.effectType[String(effectType.id)] = effectType.nameCN;
    }
  }
  
  // Initialize damageType section
  if (!enData.damageType) enData.damageType = {};
  if (!koData.damageType) koData.damageType = {};
  
  // Add damage types
  for (const [cn, en] of Object.entries(DAMAGE_TYPE_MAP.en)) {
    enData.damageType[cn] = en;
  }
  for (const [cn, ko] of Object.entries(DAMAGE_TYPE_MAP.ko)) {
    koData.damageType[cn] = ko;
  }
  
  // Initialize skillCategory section
  if (!enData.skillCategory) enData.skillCategory = {};
  if (!koData.skillCategory) koData.skillCategory = {};
  
  // Add skill categories
  for (const [cn, en] of Object.entries(SKILL_CATEGORY_MAP.en)) {
    enData.skillCategory[cn] = en;
  }
  for (const [cn, ko] of Object.entries(SKILL_CATEGORY_MAP.ko)) {
    koData.skillCategory[cn] = ko;
  }
  
  // Initialize targetType section
  if (!enData.targetType) enData.targetType = {};
  if (!koData.targetType) koData.targetType = {};
  
  // Add target types
  for (const [cn, en] of Object.entries(TARGET_TYPE_MAP.en)) {
    enData.targetType[cn] = en;
  }
  for (const [cn, ko] of Object.entries(TARGET_TYPE_MAP.ko)) {
    koData.targetType[cn] = ko;
  }
  
  // Initialize hero section
  if (!enData.hero) enData.hero = {};
  if (!koData.hero) koData.hero = {};
  if (!zhData.hero) zhData.hero = {};
  
  // Add heroes
  for (const hero of heroes) {
    if (hero.nameEN) {
      enData.hero[String(hero.id)] = hero.nameEN;
    }
    if (hero.nameKO) {
      koData.hero[String(hero.id)] = hero.nameKO;
    }
    if (hero.nameCN) {
      zhData.hero[String(hero.id)] = hero.nameCN;
    }
  }
  
  // Initialize talent section
  if (!enData.talent) enData.talent = {};
  if (!koData.talent) koData.talent = {};
  if (!zhData.talent) zhData.talent = {};
  
  // Add talents
  for (const talent of talents) {
    if (talent.nameEN) {
      enData.talent[String(talent.id)] = talent.nameEN;
    }
    if (talent.nameKO) {
      koData.talent[String(talent.id)] = talent.nameKO;
    }
    if (talent.nameCN) {
      zhData.talent[String(talent.id)] = talent.nameCN;
    }
  }
  
  // Initialize skill section
  if (!enData.skill) enData.skill = {};
  if (!koData.skill) koData.skill = {};
  if (!zhData.skill) zhData.skill = {};
  
  // Initialize skill description section
  if (!enData.skillDescription) enData.skillDescription = {};
  if (!koData.skillDescription) koData.skillDescription = {};
  if (!zhData.skillDescription) zhData.skillDescription = {};
  
  // Add skills
  for (const skill of skills) {
    if (skill.nameEN) {
      enData.skill[String(skill.id)] = skill.nameEN;
    }
    if (skill.nameKO) {
      koData.skill[String(skill.id)] = skill.nameKO;
    }
    if (skill.nameCN) {
      zhData.skill[String(skill.id)] = skill.nameCN;
    }
    
    // Add skill descriptions
    if (skill.descriptionEN) {
      enData.skillDescription[String(skill.id)] = skill.descriptionEN;
    }
    if (skill.descriptionKO) {
      koData.skillDescription[String(skill.id)] = skill.descriptionKO;
    }
    if (skill.descriptionCN) {
      zhData.skillDescription[String(skill.id)] = skill.descriptionCN;
    }
  }
  
  // Save updated files
  saveI18n('en', enData);
  saveI18n('ko', koData);
  saveI18n('zh', zhData);
  
  console.log(`\n✅ Generated i18n files:`);
  console.log(`   - skillclass: ${skillClasses.length} entries`);
  console.log(`   - effectType: ${effectTypes.length} entries`);
  console.log(`   - hero: ${heroes.length} entries`);
  console.log(`   - talent: ${talents.length} entries`);
  console.log(`   - skill: ${skills.length} entries`);
  console.log(`   - damageType: ${Object.keys(DAMAGE_TYPE_MAP.en).length} entries`);
  console.log(`   - skillCategory: ${Object.keys(SKILL_CATEGORY_MAP.en).length} entries`);
  console.log(`   - targetType: ${Object.keys(TARGET_TYPE_MAP.en).length} entries`);
}

// Run if called directly
if (require.main === module) {
  try {
    generateI18n();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

module.exports = { generateI18n };
