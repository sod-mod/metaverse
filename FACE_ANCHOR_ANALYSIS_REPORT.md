# 🎯 Face Anchor Analysis - Complete Report

## 📊 Summary

Successfully analyzed sprite positions and estimated face anchor points for **157 heroes**.

---

## 🔍 Analysis Method

### 1. Sprite Position Pattern Analysis
- Analyzed spacing between heroes on the same sprite sheet
- Examined 27 multi-hero sheets for grid patterns
- Most common spacing: 10px horizontal, 10px vertical

### 2. Face Anchor Estimation

Based on typical game character portrait layouts:

```
┌──────────────────────────┐
│                          │  ← Top margin
│         👀 FACE          │  ← Face anchor point (eye level)
│                          │
│     Character Body       │
│                          │
└──────────────────────────┘
   256×256px sprite
```

#### Estimated Face Anchor Position:
- **X offset**: `128px` (center of sprite, 50%)
- **Y offset**: `90px` (approximately 35% from top - typical eye level)

이 위치는:
- 일반적인 캐릭터 초상화에서 눈이 위치하는 곳
- 얼굴이 프레임의 상단 1/3 지점에 배치되는 표준 구도
- 게임 UI에서 얼굴을 중심으로 표시하기 위한 기준점

---

## 📈 Data Analysis Results

### Position Distribution
- **X Range**: 0 - 274px
- **Y Range**: 0 - 300px
- **Sprite Size**: 256×256px (estimated)

### Spacing Patterns
From multi-hero sheet analysis:

| Type | Common Spacing | Occurrences |
|------|----------------|-------------|
| Horizontal | 10px | 8 cases |
| Horizontal | 30px | 7 cases |
| Horizontal | 40px | 7 cases |
| Vertical | 10px | 10 cases |
| Vertical | 30px | 6 cases |

**밀집된 스프라이트 배치** - 영웅들이 매우 가깝게 배치되어 있음을 의미합니다.

---

## 🎨 Face Anchor Coordinate System

### Coordinate Systems

```javascript
// 1. Sprite-relative coordinates (스프라이트 내 상대 좌표)
faceAnchor: {
  relativeX: 128,  // 스프라이트 중심
  relativeY: 90    // 눈 높이 (상단에서 35%)
}

// 2. Sheet-absolute coordinates (시트 내 절대 좌표)
// 예: Hero ID 1 (张角)
faceAnchor: {
  absoluteX: sprite.x + 128,  // 74 + 128 = 202
  absoluteY: sprite.y + 90    // 10 + 90 = 100
}
```

### Usage Examples

#### Example 1: 얼굴 중심으로 표시

```jsx
// 컨테이너 중심에 얼굴이 오도록 배치
<div style={{
  width: '128px',
  height: '128px',
  overflow: 'hidden',
  position: 'relative'
}}>
  <img 
    src={`/images/heroes/角色形象-sheet${sheet}.webp`}
    style={{
      position: 'absolute',
      // 얼굴 앵커를 컨테이너 중심으로
      left: '64px',  // 128/2
      top: '64px',   // 128/2
      transform: `translate(-${sprite.x + 128}px, -${sprite.y + 90}px)`,
      transformOrigin: '0 0'
    }}
  />
</div>
```

#### Example 2: 스케일링 with Face Anchor

```jsx
const displaySize = 64;  // 원하는 표시 크기
const scale = displaySize / 256;  // 스프라이트 크기 기준 스케일

<img 
  src={sheetUrl}
  style={{
    transform: `
      translate(-${(sprite.x + 128) * scale}px, -${(sprite.y + 90) * scale}px) 
      scale(${scale})
    `,
    transformOrigin: '0 0'
  }}
/>
```

---

## 💡 Fine-Tuning Recommendations

### Adjustable Face Anchor

다른 캐릭터 스타일에 맞게 조정 가능:

```javascript
const faceAnchorProfiles = {
  standard: { x: 128, y: 90 },    // 기본 (눈 높이)
  upperFocus: { x: 128, y: 70 },  // 더 위쪽 (머리 중심)
  fullFace: { x: 128, y: 110 },   // 전체 얼굴 중심
  custom: { x: 128, y: 95 }       // 커스텀
};
```

### Per-Hero Adjustments

특정 영웅은 다른 앵커가 필요할 수 있습니다:

```javascript
// 예외 케이스 처리
const heroAnchorOverrides = {
  1: { x: 128, y: 85 },   // 张角 - 약간 위로
  2: { x: 128, y: 95 },   // 貂蝉 - 약간 아래로
  // ... 필요시 추가
};

const getFaceAnchor = (heroId) => {
  return heroAnchorOverrides[heroId] || { x: 128, y: 90 };
};
```

---

## 🔬 Validation Method

### Visual Testing

1. **Open** `public/images/heroes/face-anchor-analysis.html`
2. **Check** the red crosshair on each hero
3. **Verify** it aligns with the face (approximately eye level)
4. **Adjust** if needed for specific heroes

### React Component Testing

```jsx
import { HeroSpriteWithAnchor } from './components/HeroSpriteWithAnchor';

// Show anchor point for debugging
<HeroSpriteWithAnchor 
  heroId={1} 
  size={128} 
  showAnchor={true}  // Red dot at anchor point
/>
```

---

## 📦 Generated Files

### 1. `hero-sprite-mapping-with-anchors.json`

```json
{
  "_metadata": {
    "faceAnchor": {
      "description": "얼굴의 중심점 (눈 높이) - 스프라이트 원점으로부터의 오프셋",
      "offsetX": 128,
      "offsetY": 90,
      "method": "pattern analysis + standard portrait composition"
    }
  },
  "heroes": {
    "1": {
      "name": "张角",
      "sprite": { "sheet": 32, "x": 74, "y": 10, ... },
      "faceAnchor": {
        "relativeX": 128,
        "relativeY": 90,
        "absoluteX": 202,  // 74 + 128
        "absoluteY": 100   // 10 + 90
      }
    }
  }
}
```

### 2. `HeroSpriteWithAnchor.jsx`

React component with face anchor support:
- Automatically centers on face
- Adjustable anchor point
- Debug mode with anchor visualization

### 3. `face-anchor-analysis.html`

Visual reference showing:
- All heroes with red crosshair on anchor point
- Anchor coordinates displayed
- Interactive grid for easy comparison

---

## 🎯 Use Cases

### Use Case 1: Avatar Display
```jsx
// 프로필 사진처럼 얼굴만 표시
<HeroSpriteWithAnchor heroId={1} size={64} />
```

### Use Case 2: Hero List
```jsx
// 영웅 목록에서 일관된 얼굴 표시
{heroes.map(hero => (
  <div key={hero.id} className="hero-card">
    <HeroSpriteWithAnchor heroId={hero.id} size={80} />
    <div>{hero.name}</div>
  </div>
))}
```

### Use Case 3: Tooltip
```jsx
// 툴팁에서 작은 얼굴 아이콘
<Tooltip>
  <HeroSpriteWithAnchor heroId={1} size={32} />
  <span>Zhang Jiao</span>
</Tooltip>
```

---

## 🔧 Advanced Customization

### Dynamic Anchor Based on Display Size

```javascript
const getDynamicAnchor = (heroId, displaySize) => {
  const base = { x: 128, y: 90 };
  
  // 작은 사이즈에서는 더 위쪽으로
  if (displaySize < 48) {
    return { x: base.x, y: base.y - 10 };
  }
  
  // 큰 사이즈에서는 표준
  return base;
};
```

### Responsive Anchor Points

```javascript
// 화면 비율에 따라 조정
const getResponsiveAnchor = (aspectRatio) => {
  if (aspectRatio > 1.6) {
    // 와이드 화면: 얼굴을 약간 왼쪽으로
    return { x: 118, y: 90 };
  }
  return { x: 128, y: 90 };
};
```

---

## 📊 Comparison Table

| Method | X Offset | Y Offset | Description |
|--------|----------|----------|-------------|
| **Current** | 128px (50%) | 90px (35%) | Eye level, standard portrait |
| Sprite Center | 128px (50%) | 128px (50%) | Geometric center |
| Upper Focus | 128px (50%) | 70px (27%) | Hairline/forehead |
| Full Face | 128px (50%) | 110px (43%) | Nose level |

---

## 🚀 Integration Checklist

- [x] Analyze sprite positions
- [x] Estimate face anchor points
- [x] Generate enhanced mapping JSON
- [x] Create React component with anchor support
- [x] Generate visual analysis HTML
- [x] Document anchor coordinate system
- [ ] Test on actual heroes in HeroList
- [ ] Fine-tune per-hero if needed
- [ ] Add anchor adjustment UI (optional)

---

## 💻 API Reference

### HeroSpriteWithAnchor Component

```typescript
interface HeroSpriteWithAnchorProps {
  heroId: number;           // Hero ID
  size?: number;            // Display size (default: 64)
  className?: string;       // Additional CSS class
  showAnchor?: boolean;     // Show red anchor dot (debug)
  customAnchor?: {          // Override default anchor
    x: number;
    y: number;
  };
}
```

### Example Usage

```jsx
// Basic
<HeroSpriteWithAnchor heroId={1} />

// With custom size
<HeroSpriteWithAnchor heroId={1} size={128} />

// Debug mode
<HeroSpriteWithAnchor heroId={1} showAnchor={true} />

// Custom anchor
<HeroSpriteWithAnchor 
  heroId={1} 
  customAnchor={{ x: 128, y: 95 }}
/>
```

---

## 🎨 CSS Helpers

```css
/* Circular avatar with face centered */
.hero-avatar-circle {
  border-radius: 50%;
  overflow: hidden;
}

/* Square avatar with subtle border */
.hero-avatar-square {
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

/* Hover effect */
.hero-avatar:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}
```

---

## 📝 Notes

1. **Face anchor는 추정값**입니다. 실제 게임 데이터에서 명시적인 앵커 정보를 찾지 못했습니다.

2. **일반적인 초상화 구도**를 기반으로 계산:
   - 얼굴(특히 눈)이 상단 1/3 지점에 위치
   - 가로 중심 정렬
   - 256×256px 스프라이트 기준

3. **개별 영웅마다 미세 조정**이 필요할 수 있습니다:
   - 키가 큰/작은 캐릭터
   - 특이한 포즈
   - 머리 장식이 큰 캐릭터

4. **테스트 및 조정**을 권장:
   - `face-anchor-analysis.html`로 시각적 확인
   - `showAnchor={true}`로 앵커 포인트 디버깅
   - 필요시 `customAnchor`로 개별 조정

---

**Status: ✅ COMPLETE**

Face anchor positions estimated and ready for use! 🎯

*Generated: November 16, 2025*
*Method: Pattern Analysis + Standard Portrait Composition*

