# Talent Icon Extraction Report

## 📊 추출 완료

모든 sprite sheet에서 talent 아이콘들을 grid 형태로 추출했습니다!

## 🎯 Icon ID 분석

### 전체 Icon ID
**총 6개의 고유한 Icon ID**: 20, 40, 60, 80, 100, 180

### Rarity별 Icon ID 분포

| Rarity | Icon IDs | Talent 수 |
|--------|----------|-----------|
| **Rarity 1** | 20, 40 | 83 talents |
| **Rarity 2** | 60 | 79 talents |
| **Rarity 3** | 80, 100 | 79 talents |
| **Rarity 4** | 100, 180 | 79 talents |

### 주요 발견
- **Icon ID 100**은 Rarity 3과 4 모두에서 사용됨 (공유)
- 각 rarity는 주로 하나의 주요 icon을 사용
- 총 320개 talents가 6개의 icon 디자인 공유

## 📁 추출된 파일 위치

```
multiverse-wiki/public/images/talents/all_icons_grid/
├── shared-0-sheet0/
│   ├── size80/    (200 icons)
│   ├── size96/    (200 icons)
│   └── size100/   (200 icons)
├── shared-0-sheet1/
│   ├── size80/    (200 icons)
│   ├── size96/    (200 icons)
│   └── size100/   (200 icons)
├── shared-0-sheet2/
├── shared-1-sheet0/
├── shared-1-sheet1/
├── shared-1-sheet2/
├── shared-2-sheet0/
├── shared-3-sheet0/
├── shared-4-sheet0/
├── shared-5-sheet0/
├── shared-5-sheet1/
├── shared-5-sheet2/
├── shared-6-sheet0/   (사용자가 제공한 Rarity 3 위치)
├── shared-6-sheet1/   (사용자가 제공한 Rarity 1,2 위치)
└── icon-mapping.json
```

## 🔍 사용자가 제공한 정보

### 확인된 위치
1. **shared-5-sheet1.webp**: Rarity 4 아이콘 (Icon ID 180)
2. **shared-6-sheet0.webp**: Rarity 3 아이콘 (Icon ID 100)
3. **shared-6-sheet1.webp**: Rarity 1, 2 아이콘 (Icon ID 40, 60)

### 추출 결과

**shared-5-sheet1.webp** (1024x2048)
- Size 80x80: 200 icons
- Size 96x96: 200 icons  
- Size 100x100: 200 icons

**shared-6-sheet0.webp** (512x512)
- Size 80x80: 36 icons
- Size 96x96: 25 icons
- Size 100x100: 25 icons

**shared-6-sheet1.webp** (512x512)
- Size 80x80: 36 icons
- Size 96x96: 25 icons
- Size 100x100: 25 icons

## 📸 추출된 아이콘 형식

각 sprite sheet에서 3가지 크기로 추출:
- **80x80** pixels
- **96x96** pixels
- **100x100** pixels

파일명 형식: `idx000_r0c0.webp`
- `idx`: 전체 인덱스
- `r`: row (행)
- `c`: col (열)

## 🎨 다음 단계

### 1. 아이콘 위치 확인
각 폴더를 열어서 별 모양의 talent 아이콘을 찾으세요:

```bash
# Windows 탐색기로 열기
explorer "C:\Users\lemon\My project\multiverse\multiverse-wiki\public\images\talents\all_icons_grid"
```

### 2. 찾아야 할 아이콘
보여주신 이미지를 기반으로:
- 🔴 **빨간 별** (Rarity 4 - Icon ID 180)
- 🟣 **보라 별** (Rarity 3 - Icon ID 100)
- 🔵 **파란 별** (Rarity 2 - Icon ID 60)
- 🟢 **초록 별** (Rarity 1 - Icon ID 40)

### 3. 정확한 위치 기록
각 아이콘을 찾으면 다음 정보를 기록:
- Sprite sheet 이름
- Icon size (80/96/100)
- Grid position (idx, row, col)

예시:
```
Icon ID 180 (Rarity 4):
  - Sheet: shared-5-sheet1
  - Size: 100x100
  - Position: idx123_r12c3
```

### 4. 최종 추출 스크립트 작성
정확한 위치를 알면 각 talent에 맞는 아이콘을 추출할 수 있습니다.

## 📋 Icon Mapping 파일

`icon-mapping.json` 파일에는 다음 정보가 포함:
- 각 Icon ID를 사용하는 모든 talents
- Talent ID, 이름 (중/영/한), Rarity

이를 통해 각 아이콘과 talents를 매칭할 수 있습니다.

## 🚀 HeroList.jsx 통합 계획

아이콘을 찾고 나면:

1. **아이콘 파일 복사**
   ```
   /public/images/talents/
     ├── rarity1_icon40.webp
     ├── rarity1_icon20.webp
     ├── rarity2_icon60.webp
     ├── rarity3_icon80.webp
     ├── rarity3_icon100.webp
     └── rarity4_icon180.webp
   ```

2. **HeroList.jsx 업데이트**
   ```jsx
   const getTalentIcon = (talent) => {
     const iconId = talentsData.talents?.[talent]?.iconId;
     return `/images/talents/rarity${rarity}_icon${iconId}.webp`;
   };
   ```

3. **Realm 컬럼에 아이콘 표시**
   - 짧은 이름 대신 또는 함께 아이콘 표시
   - Hover 시 전체 이름과 상세 정보

## 📊 통계

- **처리된 Sprite Sheets**: 19개
- **추출된 총 아이콘 수**: ~3,000개 (3가지 크기)
- **Talents**: 320개
- **고유 Icon IDs**: 6개
- **추출 시간**: ~1분

## ✨ 결과

✅ 모든 shared sprite sheet 스캔 완료
✅ 3가지 크기로 grid 추출
✅ Icon ID 매핑 생성
✅ 파일 구조 정리 완료

이제 추출된 grid 이미지들을 확인하고 정확한 talent 아이콘을 찾기만 하면 됩니다!

