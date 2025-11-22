/**
 * Game Data Type Definitions
 * Auto-generated from game data schemas
 * @generated 2025-11-16T10:39:50.167Z
 */

export type Language = 'zh' | 'en' | 'ko';

export interface MultilingualString {
  zh: string;
  en?: string;
  ko?: string;
}

export interface HeroStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  magic: number;
}

export interface Hero {
  id: number;
  nameCN: string;
  nameEN?: string;
  nameKO?: string;
  race: string;
  displayName: string;
  spriteId: number;
  universe: number;
  stage: number;
  stats: HeroStats;
  jobLevels: number[]; // 10 slots
  talents: number[]; // 4 slots
  description: string;
  gender: '男' | '女';
  rarity: number;
  recruitCost: number;
  title: string;
  unlocked: boolean;
}

export interface Stage {
  id: number;
  nameCN: string;
  nameEN?: string;
  nameKO?: string;
  universe: number;
  stageNumber: number;
  enemies: number[]; // Enemy IDs
  boss: number;
  itemDrops: number[]; // Item IDs
  weaponType: number;
  itemSet: number;
  itemLevel: number;
  difficulty: number;
  unlockCondition: number;
  stageType: number; // 1=normal, 2=secret, 3=major
}

export type ItemRarity = 1 | 2 | 3 | 4 | 5; // white, green, blue, purple, orange

export interface Equipment {
  id: number;
  nameCN: string;
  nameEN?: string;
  nameKO?: string;
  displayName: string;
  type: number;
  category: number;
  slot: string;
  level: number;
  rarity: ItemRarity;
  value: number;
  sellPrice: number;
  description: string;
  stats: number[];
  setId: number;
  weaponType: number;
  gemSlots: number;
}

export interface Talent {
  id: number;
  nameCN: string;
  nameEN?: string;
  nameKO?: string;
  tree: number;
  icon: number;
  maxLevel: number;
  description: string;
  prerequisites: number[]; // Talent IDs
  tier: number;
  position: number;
}

export type DamageType = '物理' | '魔法';
export type TargetType = '敌方' | '我方';

export interface Skill {
  id: number;
  nameCN: string;
  nameEN?: string;
  nameKO?: string;
  displayName: string;
  type: number;
  manaCost: number;
  effectDescription: string;
  skillCategory: string;
  damageType: DamageType;
  basePower: number;
  targetType: TargetType;
}

export type DurationType = '回合' | '时间';
export type BuffType = '增益' | '减益';

export interface Buff {
  id: number;
  nameCN: string;
  nameEN?: string;
  nameKO?: string;
  displayName: string;
  icon: number;
  effectValue: number;
  duration: number;
  maxStacks: number;
  durationType: DurationType;
  buffType: BuffType;
  description: string;
}

export interface Shop {
  id: number;
  nameCN: string;
  nameEN?: string;
  nameKO?: string;
  displayName: string;
  icon: number;
  capacity: number;
  itemSlots: number;
  upgradeCost: number;
  description: string;
}

export type EnemyClass = '小怪' | '精英' | 'Boss';

export interface Enemy {
  id: number;
  nameCN: string;
  nameEN?: string;
  nameKO?: string;
  level: number;
  type: number;
  rank: number;
  enemyClass: EnemyClass;
}

// Utility types for parsers
export interface C2ArrayData {
  c2array: boolean;
  size: [number, number, number]; // [rows, columns, depth]
  data: any[][][];
}

export interface ParseOptions {
  language: Language;
  validateRefs?: boolean;
  skipErrors?: boolean;
}

export interface ParseResult<T> {
  data: T[];
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    parsed: number;
    failed: number;
  };
}
