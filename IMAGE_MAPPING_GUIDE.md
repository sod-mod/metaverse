# 🎨 Hero Image Mapping Guide

## 완성된 기능 ✅

1. **모든 스탯 표시** ✅
   - STR (빨강)
   - INT (파랑)
   - CON (초록)
   - AGI (노랑)
   - MEN (보라)
   - Total (흰색)

2. **Avatar 플레이스홀더** ✅
   - 현재: ID 번호 표시 (#1, #2, etc.)
   - 준비: Sprite sheet 복사 완료

3. **Sprite Mapper 도구** ✅
   - 브라우저에서 쉽게 좌표 찾기
   - 자동 JSON 생성

## 🚀 이미지를 추가하는 방법

### 방법 1: Sprite Mapper 도구 사용 (추천) ⭐

1. **브라우저에서 Mapper 열기**
   ```
   http://localhost:3000/sprite-mapper
   ```

2. **Sprite Sheet 선택**
   - Sheet 0부터 시작
   - 드롭다운에서 선택

3. **Grid 크기 조정**
   - 보통 128px (캐릭터 크기)
   - 필요시 조정

4. **캐릭터 클릭**
   - 그리드에서 캐릭터 클릭
   - 노란색 하이라이트 확인

5. **Mapping 추가**
   - "Add" 버튼 클릭
   - Hero ID 입력 (예: 3 for Zhang Jiao)
   - 확인

6. **반복**
   - 모든 캐릭터에 대해 3-5 반복
   - 또는 주요 캐릭터만 먼저

7. **Export**
   - "Export" 버튼 클릭
   - JSON이 클립보드에 복사됨
   - 콘솔에도 출력됨

8. **코드에 붙여넣기**
   - `src/components/HeroAvatar.jsx` 열기
   - `SPRITE_MAPPING` 객체 찾기
   - 복사한 JSON으로 교체

9. **브라우저 새로고침**
   - 이미지가 표시됨! 🎉

### 방법 2: 수동으로 좌표 입력

1. **이미지 뷰어에서 sprite sheet 열기**
   ```
   public/images/heroes/角色形象-sheet0.webp
   ```

2. **좌표 측정**
   - 캐릭터 위치 확인 (x, y)
   - 보통 128x128 그리드

3. **HeroAvatar.jsx 수정**
   ```javascript
   const SPRITE_MAPPING = {
     3: { sheet: 0, x: 0, y: 0, width: 128, height: 128 },    // Zhang Jiao
     4: { sheet: 0, x: 128, y: 0, width: 128, height: 128 },  // Next hero
     // ... more mappings
   }
   ```

4. **저장 및 테스트**
   - 파일 저장
   - 브라우저 자동 새로고침
   - Hero List에서 확인

## 📋 Hero ID 참고

CSV 파일에서 Hero ID를 확인하세요:

| ID | Name | Universe |
|----|------|----------|
| 3 | Zhang Jiao (张角) | 3 Kingdoms |
| 4 | Diao Chan (貂蝉) | 3 Kingdoms |
| 5 | Lu Bu (吕布) | 3 Kingdoms |
| ... | ... | ... |

또는 데이터 파일 확인:
```bash
cat src/data/heroes.json | grep -A 5 '"id"'
```

## 🎯 빠른 시작 (3개 영웅만)

Zhang Jiao, Diao Chan, Lu Bu만 먼저 추가:

1. Sprite Mapper 열기
2. Sheet 0 선택
3. 세 영웅 찾기
4. 각각 클릭하고 ID 입력 (3, 4, 5)
5. Export → 붙여넣기
6. 완료! ✅

## 🔧 문제 해결

### 이미지가 안 보여요
- `public/images/heroes/` 폴더에 파일이 있나요?
- 브라우저 개발자 도구(F12) → Network 탭 확인
- 404 에러가 있나요?

### 좌표가 안 맞아요
- Grid size를 조정해보세요 (64, 96, 128, 256)
- Sprite sheet의 실제 캐릭터 크기 확인
- 각 sheet마다 레이아웃이 다를 수 있음

### Mapper 페이지가 안 열려요
- 서버가 실행 중인가요? (`npm run dev`)
- URL이 정확한가요? `/sprite-mapper`

## 💡 팁

1. **점진적으로 추가**
   - 한 번에 모든 영웅을 매핑할 필요 없음
   - 자주 사용하는 영웅부터 시작
   - 나중에 추가 가능

2. **Sheet별로 작업**
   - Sheet 0 완료 → Sheet 1 → ...
   - Export할 때마다 기존 매핑과 병합

3. **백업**
   - 매핑 작업 전 HeroAvatar.jsx 백업
   - Export한 JSON을 파일로 저장

4. **협업**
   - 매핑 JSON을 공유 가능
   - 다른 사람이 작업한 것을 병합

## 📊 현재 상태

### ✅ 작동하는 것
- Avatar 플레이스홀더 표시
- 모든 스탯 색상 코딩
- Sprite Mapper 도구
- Hero List 테이블
- Party Builder

### ⏳ 추가 작업 필요
- Sprite coordinates 매핑
  - 165명 영웅 중 현재 3명만 예제
  - Mapper 도구로 쉽게 추가 가능

### 🎯 우선순위
1. 주요 영웅 10-20명 매핑 (가장 인기 있는)
2. 나머지는 필요에 따라 추가

## 🎮 테스트 방법

1. **Hero List 확인**
   - Avatar 컬럼에 플레이스홀더 보임
   - 매핑된 영웅은 이미지 표시

2. **Party Builder 확인**
   - 파티 슬롯에 Avatar 표시
   - 영웅 선택 리스트에도 표시

3. **Sprite Mapper 확인**
   - `/sprite-mapper` 접속
   - Sheet 이미지 로드되는지 확인
   - 클릭 및 Export 테스트

## 📝 예제 매핑

Zhang Jiao (ID: 3)를 찾았다면:

```javascript
// HeroAvatar.jsx에 추가
const SPRITE_MAPPING = {
  3: { 
    sheet: 0,      // 어느 sheet 파일?
    x: 256,        // X 좌표 (픽셀)
    y: 384,        // Y 좌표 (픽셀)
    width: 128,    // 폭
    height: 128    // 높이
  },
  // ... more mappings
}
```

이제 Hero #3의 아바타가 표시됩니다! 🎉

## 🚀 완료!

이제 다음을 모두 사용할 수 있습니다:

1. ✅ 모든 스탯 표시 (색상 코딩)
2. ✅ Avatar 시스템 (플레이스홀더)
3. ✅ Sprite Mapper 도구
4. ⏳ Sprite coordinates (점진적으로 추가)

**Hero List와 Party Builder를 확인해보세요!** 🎮

