# Game Icons Extraction - Complete Report

## ✅ 추출 완료

**3가지 타입의 게임 아이콘** 추출 완료!

## 📊 아이콘 통계

| Type | Extracted | Total | Coverage | Status |
|------|-----------|-------|----------|--------|
| **Talent** | 6 | 6 | 100% | ✅ 완료 |
| **Skill** | 17 | 17 | 100% | ✅ 완료 |
| **Buff** | 11 | 21 | 52% | ⚠️ 일부 |
| **Total** | **34** | **44** | **77%** | 🎯 |

## 📁 파일 구조

```
multiverse-wiki/public/images/
├── talents/          (6 icons, 100x100px)
│   ├── icon_20.webp
│   ├── icon_40.webp
│   ├── icon_60.webp
│   ├── icon_80.webp
│   ├── icon_100.webp
│   ├── icon_180.webp
│   ├── icon-info.json
│   └── README.md
│
├── skills/           (17 icons, 80x80px)
│   ├── skill_0.webp
│   ├── skill_1.webp
│   ├── ...
│   └── skill_16.webp
│
├── buffs/            (11 icons, 80x80px)
│   ├── buff_12.webp
│   ├── buff_13.webp
│   ├── ...
│   └── buff_50.webp
│
├── game-icons-info.json
└── README.md
```

## 🎨 Talent Icons (6 icons)

**완전 추출 완료** ✅

| Icon ID | File | Rarities | Talents | Description |
|---------|------|----------|---------|-------------|
| 20 | icon_20.webp | 1 | 4 | 특수 Rarity 1 🟢 |
| 40 | icon_40.webp | 1 | 79 | 일반 Rarity 1 🟢 |
| 60 | icon_60.webp | 2 | 79 | Rarity 2 🔵 |
| 80 | icon_80.webp | 3 | 12 | 특수 Rarity 3 🟣 |
| 100 | icon_100.webp | 3, 4 | 79 | Rarity 3 & 4 🟣 |
| 180 | icon_180.webp | 4 | 67 | Rarity 4 🔴 |

**Source**: `shared-5-sheet1.webp`, `shared-6-sheet0.webp`, `shared-6-sheet1.webp`

## ⚔️ Skill Icons (17 icons)

**완전 추출 완료** ✅

Skill Type IDs: 0-16

- skill_0.webp - skill_16.webp
- 모든 skill types 커버
- 377개 skills가 17개 아이콘 공유

**Source**: `shared-0-sheet1.webp` (1024x2048, 80px grid)

## 🛡️ Buff Icons (11/21 icons)

**일부 추출** ⚠️

### 추출 완료 (11 icons)
IDs: 12, 13, 14, 16, 18, 19, 29, 37, 40, 48, 50

### 추출 실패 (10 icons)
IDs: 93, 98, 99, 113, 114, 115, 116, 117, 120, 121

**원인**: buff图标-sheet0.webp (512x1024) 크기로 80px grid 사용 시 범위 초과
- 80px grid: 6 columns × 12 rows = 72 icons (0-71)
- Icon 93+ 는 범위 초과

**해결 방법**: 다른 아이콘 크기(64px) 또는 다른 sprite sheet 확인 필요

## 🎯 사용법

### React/JSX
```jsx
// Talent icon
const getTalentIcon = (talent) => {
  return `/images/talents/icon_${talent.iconId}.webp`;
};

// Skill icon
const getSkillIcon = (skill) => {
  return `/images/skills/skill_${skill.type}.webp`;
};

// Buff icon
const getBuffIcon = (buff) => {
  if (buff.icon >= 93) return null; // Not extracted yet
  return `/images/buffs/buff_${buff.icon}.webp`;
};
```

### HTML
```html
<img src="/images/talents/icon_40.webp" alt="Talent" class="w-8 h-8" />
<img src="/images/skills/skill_5.webp" alt="Skill" class="w-8 h-8" />
<img src="/images/buffs/buff_12.webp" alt="Buff" class="w-8 h-8" />
```

## 📈 데이터 매핑

### Talent → Icon
```javascript
// talents.json already includes iconId
{
  "id": 247,
  "names": { "zh": "法神", "en": "Dharmagod", "ko": "법신" },
  "rarity": 4,
  "iconId": 180  // Use this!
}
```

### Skill → Icon
```javascript
// skill.json includes type
{
  "id": 5,
  "nameCN": "射击",
  "type": 5  // Use this as skill icon ID
}
```

### Buff → Icon
```javascript
// buff.json includes icon
{
  "id": 1,
  "nameCN": "防御姿态",
  "icon": 116  // Use this as buff icon ID
}
```

## 🔍 Sprite Sheet 분석

| Sheet Name | Size | Grid (80px) | Max Icons | Used For |
|------------|------|-------------|-----------|----------|
| shared-5-sheet1.webp | 1024x2048 | 12x25 | 300 | Talent (Icon 180) |
| shared-6-sheet0.webp | 512x512 | 6x6 | 36 | Talent (Icon 80, 100) |
| shared-6-sheet1.webp | 512x512 | 6x6 | 36 | Talent (Icon 20, 40, 60) |
| shared-0-sheet1.webp | 1024x2048 | 12x25 | 300 | Skills (Type 0-16) |
| buff图标-sheet0.webp | 512x1024 | 6x12 | 72 | Buffs (Icon 12-50) |

## 🛠️ 추출 스크립트

**Main Script**: `scripts/extractAllGameIcons.cjs`

```bash
cd multiverse-wiki
node scripts/extractAllGameIcons.cjs
```

**Individual Scripts**:
- `scripts/extractTalentIconsByPosition.cjs` - Talent icons only
- `scripts/extractAllGameIcons.cjs` - All game icons

## 📊 통계 요약

### 파일 크기
- **Talents**: ~12 KB (6 files)
- **Skills**: ~10 KB (17 files)
- **Buffs**: ~40 KB (11 files)
- **Total**: ~62 KB

### 게임 데이터 커버리지
- **Talents**: 320 items → 6 icons (100%)
- **Skills**: 377 items → 17 icons (100%)
- **Buffs**: 67 items → 21 icons (52% extracted)
- **Equipment**: 1,686 items → 0 icons (not analyzed)

## ⚠️ 알려진 이슈

1. **Buff Icons 93+**: 추출 실패 (범위 초과)
   - 해결: 다른 크기 또는 sprite sheet 필요

2. **Equipment Icons**: 아직 분석 안 됨
   - equipment.json에 icon 필드 없음
   - 추가 조사 필요

## 🚀 다음 단계

1. ✅ Talent icons 추출
2. ✅ Skill icons 추출
3. ⚠️ Buff icons 완료 (11/21)
4. ⏳ 나머지 Buff icons 추출 (다른 크기 시도)
5. ⏳ Equipment icons 분석 및 추출
6. ⏳ Enemy icons 분석 및 추출

## 📚 관련 파일

- `/public/images/README.md` - Images 폴더 가이드
- `/public/images/talents/README.md` - Talent icons 상세
- `/public/images/game-icons-info.json` - 추출 메타데이터
- `TALENT_ICONS_FINAL.md` - Talent icons 최종 리포트

## ✨ 결론

**34개의 게임 아이콘 추출 완료!** 🎉

- ✅ Talent: 6/6 완전
- ✅ Skill: 17/17 완전
- ⚠️ Buff: 11/21 일부
- 📁 깔끔한 폴더 구조
- 📋 완전한 메타데이터
- 🎮 게임 UI 구현 준비 완료

