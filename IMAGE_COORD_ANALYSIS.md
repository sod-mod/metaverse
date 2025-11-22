# 스프라이트 좌표 분석

## 발견된 패턴

### 영웅 데이터 (js.json)
- **Total Columns**: 37
- **이미지 관련 컬럼**: 28-31

### 예시: 장각 (Hero ID 3)
```
rawData[28]: 32  -> 스프라이트 시트 번호 (角色形象-sheet32.webp)
rawData[29]: 74  -> X 좌표 또는 인덱스?
rawData[30]: 10  -> Y 좌표 또는 인덱스?
rawData[31]: 47  -> 프레임 번호 또는 추가 정보?
```

## 스프라이트 시트 파일

영웅 이미지는 `角色形象-sheet0.webp` ~ `角色形象-sheet32.webp`에 저장되어 있습니다.

## 다음 단계

1. ✅ 이미지 정보 필드 식별 완료
2. ⏳ 스프라이트 시트의 그리드 크기 확인 필요
3. ⏳ column 29, 30이 실제 좌표인지 또는 인덱스인지 확인
4. ⏳ HeroAvatar 컴포넌트에 적용

## 스프라이트 시트 정보 추출

각 영웅의 이미지 정보를 포함하도록 parseAllData.cjs 수정 필요:

```javascript
const hero = {
  id: heroId,
  name: nameChinese,
  names: { ... },
  // ... other fields ...
  sprite: {
    sheet: row[28] || 0,      // 스프라이트 시트 번호
    x: row[29] || 0,           // X 좌표/인덱스
    y: row[30] || 0,           // Y 좌표/인덱스
    frame: row[31] || 0        // 프레임 번호
  }
}
```

## 이미지 매핑 예제

### 사용 방법:
```jsx
<div style={{
  backgroundImage: `url(/images/角色形象-sheet${hero.sprite.sheet}.webp)`,
  backgroundPosition: `-${hero.sprite.x * GRID_SIZE}px -${hero.sprite.y * GRID_SIZE}px`,
  width: `${GRID_SIZE}px`,
  height: `${GRID_SIZE}px`
}} />
```

## 필요한 정보

1. **그리드 크기 (GRID_SIZE)**: 128px (추정)
2. **스프라이트 당 크기**: 확인 필요
3. **좌표 계산 방식**: 확인 필요

