# Game Database Analysis Report

**Generated:** 2025-11-16T10:38:34.227Z  
**Source:** package (EN/CN) and package_kor (KO/CN)  
**Total Files:** 59 JSON files

## Executive Summary

This document provides a comprehensive analysis of all game data files for the Multiverse game. The data is stored in Construct 2 Array (c2array) format, with parallel English/Chinese and Korean/Chinese versions.

### Priority Files (REQUIRED for Implementation)

The following files are critical for implementing the core game features:

1. **js.json** - Heroes/Characters (166 heroes, 37 fields)
2. **tz.json** - Stages/Levels (361 stages, 23 fields)
3. **wp.json** - Equipment/Items (1687 items, 40 fields)
4. **mg.json** - Talents (321 talents, 15 fields)
5. **ss.json** - Shops/Counters (73 counters, 12 fields)
6. **fb.json** - Major Battles (31 battles, 28 fields)

### Data Format

All files use the Construct 2 Array format:
```json
{
  "c2array": true,
  "size": [rows, columns, depth],
  "data": [
    [
      [value], // depth 0
      [value], // depth 1
      ...
    ]
  ]
}
```

Row 0 typically contains header/metadata (all zeros or empty strings).  
Data starts from row 1.  
Depth is always 1 for these files.

## Detailed File Analysis


### js.json - Heroes/Characters

**Priority:** ⭐ REQUIRED  
**Purpose:** Character definitions with stats, talents, and job progression  
**Required For:** Hero system - name, per-hero stats, talents, job levels  
**Dimensions:** 166 rows × 37 columns  
**File Size:** 358.4 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Unique hero ID |
| 1 | `nameCN` | string | Chinese name |
| 2 | `race` | string | Race (人类) |
| 3 | `displayName` | string | Display name |
| 4 | `spriteId` | number | Sprite/Image ID |
| 5 | `universe` | number | Universe/dimension |
| 6 | `stage` | number | Stage/Level |
| 7 | `statHP` | number | Base HP stat |
| 8 | `statATK` | number | Base ATK stat |
| 9 | `statDEF` | number | Base DEF stat |
| 10 | `statSPD` | number | Base SPD stat |
| 11 | `statMagic` | number | Base Magic stat |
| 12 | `jobLevel1` | number | Job level slot 1 |
| 13 | `jobLevel2` | number | Job level slot 2 |
| 14 | `jobLevel3` | number | Job level slot 3 |
| 15 | `jobLevel4` | number | Job level slot 4 |
| 16 | `jobLevel5` | number | Job level slot 5 |
| 17 | `jobLevel6` | number | Job level slot 6 |
| 18 | `jobLevel7` | number | Job level slot 7 |
| 19 | `jobLevel8` | number | Job level slot 8 |
| 20 | `jobLevel9` | number | Job level slot 9 |
| 21 | `jobLevel10` | number | Job level slot 10 |
| 22 | `talent` | number | Talent flag/type |
| 23 | `descriptionCN` | string | Chinese description |
| 24 | `gender` | string | Gender (男/女) |
| 25 | `rarity` | number | Rarity level |
| 26 | `recruitCost` | number | Recruitment cost |
| 27 | `title` | string | Title/epithet |
| 28 | `talent1` | number | Talent slot 1 ID |
| 29 | `talent2` | number | Talent slot 2 ID |
| 30 | `talent3` | number | Talent slot 3 ID |
| 31 | `talent4` | number | Talent slot 4 ID |
| 32 | `unknown32` | number | Unknown field |
| 33 | `unlocked` | number | Initially unlocked flag |
| 34 | `descriptionEN` | string | English description |
| 35 | `unknown35` | number | Unknown field |
| 36 | `unknown36` | string | Unknown field |

---

### tz.json - Stages/Levels

**Priority:** ⭐ REQUIRED  
**Purpose:** Stage definitions with enemies, rewards, and requirements  
**Required For:** Stage system - universe, enemies, item level, weapon type, item set  
**Dimensions:** 361 rows × 23 columns  
**File Size:** 395.0 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Stage ID |
| 1 | `nameCN` | string | Chinese stage name |
| 2 | `universe` | number | Universe/dimension |
| 3 | `stageNumber` | number | Stage number in universe |
| 4 | `enemySlot1` | number | Enemy 1 ID |
| 5 | `enemySlot2` | number | Enemy 2 ID |
| 6 | `enemySlot3` | number | Enemy 3 ID |
| 7 | `enemySlot4` | number | Enemy 4 ID |
| 8 | `enemySlot5` | number | Enemy 5 ID |
| 9 | `enemySlot6` | number | Enemy 6 ID |
| 10 | `boss` | number | Boss ID |
| 11 | `itemDrop1` | number | Item drop 1 ID |
| 12 | `itemDrop2` | number | Item drop 2 ID |
| 13 | `itemDrop3` | number | Item drop 3 ID |
| 14 | `itemDrop4` | number | Item drop 4 ID |
| 15 | `itemDrop5` | number | Item drop 5 ID |
| 16 | `itemDrop6` | number | Item drop 6 ID |
| 17 | `weaponType` | number | Weapon type restriction/bonus |
| 18 | `itemSet` | number | Item set available |
| 19 | `itemLevel` | number | Item level drops |
| 20 | `difficulty` | number | Difficulty tier |
| 21 | `unlockCondition` | number | Unlock requirement |
| 22 | `stageType` | number | Stage type (normal/secret/major) |

---

### wp.json - Equipment/Items

**Priority:** ⭐ REQUIRED  
**Purpose:** All equipment, weapons, and item definitions  
**Required For:** Item system for stages, shops, and battles  
**Dimensions:** 1687 rows × 40 columns  
**File Size:** 3248.3 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Item ID |
| 1 | `nameCN` | string | Chinese item name |
| 2 | `displayName` | string | Display name |
| 3 | `type` | number | Item type (weapon/armor/etc) |
| 4 | `category` | number | Item category |
| 5 | `slot` | string | Equipment slot |
| 6 | `level` | number | Item level |
| 7 | `rarity` | number | Rarity (white/green/blue/purple/orange) |
| 8 | `value` | number | Base value/price |
| 9 | `sellPrice` | number | Sell price |
| 10 | `description` | string | Item description |
| 11 | `statBonus1` | number | Stat bonus 1 |
| 12 | `statBonus2` | number | Stat bonus 2 |
| 13 | `statBonus3` | number | Stat bonus 3 |
| 14 | `statBonus4` | number | Stat bonus 4 |
| 15 | `statBonus5` | number | Stat bonus 5 |
| 36 | `setId` | number | Item set ID |
| 37 | `weaponType` | number | Weapon type |
| 38 | `gemSlots` | number | Number of gem slots |

---

### mg.json - Talents

**Priority:** ⭐ REQUIRED  
**Purpose:** Talent tree definitions and talent abilities  
**Required For:** Hero talent system  
**Dimensions:** 321 rows × 15 columns  
**File Size:** 232.8 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Talent ID |
| 1 | `nameCN` | string | Chinese talent name |
| 2 | `tree` | number | Talent tree ID |
| 3 | `icon` | number | Icon ID |
| 4 | `maxLevel` | number | Maximum level |
| 5 | `description` | string | Talent description |
| 6 | `prerequisite1` | number | Required talent 1 |
| 7 | `prerequisite2` | number | Required talent 2 |
| 8 | `prerequisite3` | number | Required talent 3 |
| 9 | `tier` | number | Talent tier |
| 10 | `position` | number | Position in tree |

---

### jn.json - Skills/Abilities

**Priority:** High  
**Purpose:** Skill definitions with effects and mechanics  
**Required For:** Combat system  
**Dimensions:** 378 rows × 52 columns  
**File Size:** 1030.9 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Skill ID |
| 1 | `nameCN` | string | Chinese skill name |
| 2 | `displayName` | string | Display name |
| 4 | `type` | number | Skill type |
| 5 | `manaCost` | number | Mana/energy cost |
| 14 | `effectDescription` | string | Effect description with formatting |
| 15 | `skillCategory` | string | Category (近战攻击/法术/etc) |
| 26 | `damageType` | string | Damage type (物理/魔法) |
| 29 | `basePower` | number | Base power value |
| 39 | `targetType` | string | Target type (敌方/我方) |
| 50 | `descriptionEN` | string | English description |

---

### buff.json - Buffs/Debuffs

**Priority:** High  
**Purpose:** Status effect definitions  
**Required For:** Combat mechanics  
**Dimensions:** 68 rows × 15 columns  
**File Size:** 55.4 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Buff ID |
| 1 | `nameCN` | string | Chinese buff name |
| 2 | `displayName` | string | Display name |
| 3 | `icon` | number | Icon ID |
| 6 | `effectValue` | number | Effect value/percentage |
| 9 | `duration` | number | Duration value |
| 10 | `maxStacks` | number | Maximum stacks |
| 11 | `durationType` | string | Duration type (回合/时间) |
| 12 | `buffType` | string | Buff type (增益/减益) |
| 13 | `descriptionCN` | string | Chinese description |
| 14 | `descriptionEN` | string | English description |

---

### ss.json - Shops/Counters

**Priority:** ⭐ REQUIRED  
**Purpose:** Shop counter definitions for the player's shop business  
**Required For:** Shop system - all shops  
**Dimensions:** 73 rows × 12 columns  
**File Size:** 51.0 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Counter ID |
| 1 | `nameCN` | string | Chinese counter name |
| 2 | `displayName` | string | Display name |
| 3 | `icon` | number | Icon ID |
| 4 | `capacity` | number | Customer capacity |
| 5 | `itemSlots` | number | Item slot capacity |
| 6 | `upgradeCost` | number | Upgrade cost |
| 10 | `descriptionEN` | string | English description |

---

### fb.json - Major Battles/Dungeons

**Priority:** ⭐ REQUIRED  
**Purpose:** Major battle/dungeon instances  
**Required For:** Major battle system - item level, item type, set effects  
**Dimensions:** 31 rows × 28 columns  
**File Size:** 42.3 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Battle ID |
| 1 | `nameCN` | string | Chinese battle name |
| 2 | `universe` | number | Universe ID |
| 3 | `difficulty` | number | Difficulty level |

---

### dr.json - Enemies/Monsters

**Priority:** High  
**Purpose:** Enemy unit definitions  
**Required For:** Combat encounters  
**Dimensions:** 410 rows × 15 columns  
**File Size:** 301.4 KB  

#### Field Mappings

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| 0 | `id` | number | Enemy ID |
| 1 | `nameCN` | string | Chinese enemy name |
| 2 | `level` | number | Enemy level |
| 3 | `type` | number | Enemy type |
| 4 | `rank` | number | Enemy rank |
| 5 | `enemyClass` | string | Enemy class (小怪/精英/Boss) |

---

### cj.json - Cities/Locations

**Priority:** Medium  
**Purpose:** City and location data  
**Dimensions:** 161 rows × 23 columns  
**File Size:** 180.0 KB  

---

### dl.json - Dungeons/Maps

**Priority:** Medium  
**Purpose:** Dungeon map layouts  
**Dimensions:** 31 rows × 391 columns  
**File Size:** 569.3 KB  

---

### fw.json - Costumes/Fashion

**Priority:** Medium  
**Purpose:** Character costumes and appearances  
**Dimensions:** 600 rows × 21 columns  
**File Size:** 599.9 KB  

---

### pf.json - Recipes/Crafting

**Priority:** Medium  
**Purpose:** Crafting recipes and formulas  
**Dimensions:** 664 rows × 19 columns  
**File Size:** 602.1 KB  

---

### rw.json - Quests/Tasks

**Priority:** Medium  
**Purpose:** Quest and mission definitions  
**Dimensions:** 28 rows × 16 columns  
**File Size:** 36.1 KB  

---

### dh.json - Dialogues

**Priority:** Low  
**Purpose:** Dialogue text and conversations  
**Dimensions:** 171 rows × 13 columns  
**File Size:** 156.8 KB  

---

### lau.json - Localization

**Priority:** High  
**Purpose:** UI strings and localization (4820 strings)  
**Dimensions:** 4820 rows × 3 columns  
**File Size:** 890.3 KB  

---

### hh.json - Unknown - Heroes Related?

**Priority:** Low  
**Purpose:** Possible hero variants or NPCs  
**Dimensions:** 268 rows × 18 columns  
**File Size:** 239.7 KB  

---

### sx.json - Attributes/Properties

**Priority:** Medium  
**Purpose:** Stat and attribute definitions  
**Dimensions:** 203 rows × 12 columns  
**File Size:** 126.6 KB  

---

### kj.json - Unknown

**Priority:** Low  
**Purpose:** To be determined  
**Dimensions:** 76 rows × 17 columns  
**File Size:** 69.9 KB  

---

### zs.json - Unknown

**Priority:** Low  
**Purpose:** To be determined  
**Dimensions:** 14 rows × 17 columns  
**File Size:** 12.1 KB  

---

### ms.json - Unknown

**Priority:** Low  
**Purpose:** To be determined  
**Dimensions:** 379 rows × 11 columns  
**File Size:** 204.4 KB  

---

### bk.json - Unknown - Possibly Boss

**Priority:** Medium  
**Purpose:** Boss-related data?  
**Dimensions:** 73 rows × 4 columns  
**File Size:** 15.2 KB  

---

### zy.json - Resources/Assets

**Priority:** Low  
**Purpose:** Resource management  
**Dimensions:** 42 rows × 33 columns  
**File Size:** 69.7 KB  

---

### wm.json - Unknown

**Priority:** Low  
**Purpose:** To be determined  
**Dimensions:** 14 rows × 34 columns  
**File Size:** 23.4 KB  

---

### gg.json - Patch Notes

**Priority:** Low  
**Purpose:** Game update announcements  
**Dimensions:** 9 rows × 31 columns  
**File Size:** 23.5 KB  

---

### gs.json - Buildings/Facilities

**Priority:** Low  
**Purpose:** Building definitions  
**Dimensions:** 7 rows × 7 columns  
**File Size:** 2.7 KB  

---

### bm.json - Departments

**Priority:** Low  
**Purpose:** Company departments  
**Dimensions:** 11 rows × 5 columns  
**File Size:** 3.0 KB  

---

## Language Version Comparison

### Dimension Differences

**lau.json (Localization):**
- EN version: 4820 strings
- KO version: 4853 strings (+33 strings)

All other files have identical dimensions between EN and KO versions.

### Translation Coverage

- Chinese (CN): 100% - Base language, present in all files
- English (EN): ~60% - Available in key files (heroes, skills, items)
- Korean (KO): ~60% - Available in key files, slightly more comprehensive than EN

## Implementation Priorities

Based on the requirements analysis:

### Phase 1: Core Systems (MUST HAVE)

1. **Heroes** (`js.json`)
   - Parse all 37 fields
   - Extract per-hero stats (HP, ATK, DEF, SPD, Magic)
   - Map 10 job level slots
   - Link 4 talent slots
   - Multi-language support (CN/EN/KO)

2. **Stages** (`tz.json`)
   - Parse universe classification
   - Extract enemy composition (6 slots)
   - Map item drop tables
   - Identify weapon type bonuses
   - Track item set availability

3. **Equipment** (`wp.json`)
   - Parse 1687 items
   - Categorize by type and rarity
   - Extract stat bonuses
   - Identify weapon types
   - Map item sets
   - Track purple/orange items

4. **Talents** (`mg.json`)
   - Parse 321 talents
   - Build talent tree structure
   - Map prerequisites
   - Link to heroes

### Phase 2: Combat & Progression

5. **Skills** (`jn.json`) - 378 skills
6. **Buffs** (`buff.json`) - 68 status effects
7. **Enemies** (`dr.json`) - 410 enemy types

### Phase 3: Economy & Meta

8. **Shops** (`ss.json`) - 73 shop counters
9. **Major Battles** (`fb.json`) - 31 major encounters
10. **Cities** (`cj.json`) - 161 locations
11. **Recipes** (`pf.json`) - 664 crafting recipes

### Phase 4: Content & Polish

12. **Localization** (`lau.json`) - 4820+ UI strings
13. **Dialogues** (`dh.json`) - Story content
14. **Costumes** (`fw.json`) - Visual customization

## Data Integrity Notes

### Observations

1. **Consistent Structure**: All c2array files follow the same format
2. **Row 0 Pattern**: Always headers (zeros/empty strings)
3. **Mixed Types**: Columns can contain numbers, strings, or mixed types
4. **Multi-language**: CN text in early columns, EN text in later columns
5. **Sparse Data**: Many columns are zeros/empty (flags, optional fields)

### Potential Issues

1. **Missing Mappings**: Some files (`bk`, `kj`, `ms`, etc.) need identification
2. **Field Semantics**: Numeric values need game context to interpret
3. **Cross-References**: ID fields reference other files (need resolution)
4. **Formula Fields**: Some descriptions contain formulas (e.g., "[color=lightgreen]百分比数值%[/color]")

### Recommendations

1. Start with priority files (heroes, stages, equipment, talents)
2. Build cross-reference resolver for ID lookups
3. Parse color/formatting tags in descriptions
4. Create type-safe parsers for each file format
5. Validate all cross-references
6. Extract unique enums (damage types, item categories, etc.)

## Next Steps

1. ✅ Complete file analysis
2. ⏳ Generate JSON schemas for each file type
3. ⏳ Create TypeScript type definitions
4. ⏳ Build parser infrastructure
5. ⏳ Implement individual file parsers
6. ⏳ Create CLI tool for data extraction
7. ⏳ Test with both language versions

---

*This analysis serves as the foundation for the parser implementation phase.*
