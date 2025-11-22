# Data Directory Files Generation Guide

이 문서는 `data/` 디렉토리의 파일들이 어디서 생성되는지 정리합니다.

## 📁 디렉토리 구조

```
data/
├── extracted/          # 파싱된 게임 데이터 (JSON)
├── schemas/           # JSON 스키마 파일들
├── types/             # TypeScript 타입 정의
├── file-analysis-*.json  # 파일 분석 결과 (매우 큰 파일)
├── deep-analysis.json    # 심화 분석 결과
└── *.md               # 분석 리포트 문서들
```

## 🔧 생성 위치 및 방법

### 1. `data/extracted/` - 파싱된 게임 데이터

**생성 도구:** `tools/parsers/cli.cjs`

**생성 방법:**
```bash
# npm 스크립트 사용
npm run parse-data

# 또는 직접 실행
node tools/parsers/cli.cjs --source=../package,../package_kor --output=data/extracted --verbose
```

**생성되는 파일들:**
- `hero.json` - 영웅 데이터
- `skill.json` - 스킬 데이터
- `equipment.json` - 장비 데이터
- `enemy.json` - 적 데이터
- `stage.json` - 스테이지 데이터
- `talent.json` - 재능 데이터
- `buff.json` - 버프 데이터
- `shop.json` - 상점 데이터
- `job.json` - 직업 데이터
- `class.json` - 클래스 데이터
- `effectType.json` - 효과 타입 데이터
- `parse-summary.json` - 파싱 요약 정보

**코드 위치:**
- 메인 파서: `tools/parsers/index.cjs` → `exportToFiles()` 메서드
- CLI 인터페이스: `tools/parsers/cli.cjs`
- 도메인별 파서: `tools/parsers/domain/*.cjs`

**참고:** 이 파일들은 `../package` 및 `../package_kor` 디렉토리의 원본 게임 JSON 파일들을 파싱하여 생성됩니다.

---

### 2. `data/schemas/` - JSON 스키마 파일들

**상태:** ⚠️ 생성 스크립트를 찾지 못함

**파일들:**
- `hero.schema.json`
- `skill.schema.json`
- `equipment.schema.json`
- `enemy.schema.json`
- `stage.schema.json`
- `talent.schema.json`
- `buff.schema.json`
- `shop.schema.json`

**가능성:**
- 수동으로 작성되었을 가능성
- 또는 별도의 스키마 생성 도구가 있었을 가능성
- 파서 코드에서 스키마를 참조하지만 (`tools/parsers/domain/*.cjs`에서 "matching schema" 주석 발견), 생성 스크립트는 확인되지 않음

---

### 3. `data/types/` - TypeScript 타입 정의

**상태:** ⚠️ 생성 스크립트를 찾지 못함

**파일들:**
- `gameData.types.ts`
- `index.ts`

**가능성:**
- 수동으로 작성되었을 가능성
- 또는 JSON 스키마에서 자동 생성되었을 가능성

---

### 4. `data/file-analysis-en.json` & `data/file-analysis-ko.json`

**상태:** ⚠️ 생성 스크립트를 찾지 못함

**파일 크기:** 각각 약 136MB (매우 큰 파일)

**내용:**
- 모든 게임 JSON 파일들의 상세 분석 결과
- 각 파일의 구조, 컬럼 타입, 샘플 데이터 등 포함
- `package/` 및 `package_kor/` 디렉토리의 모든 JSON 파일 분석 결과

**가능성:**
- 별도의 대규모 분석 스크립트에서 생성되었을 가능성
- `tools/analysis/analyzeDataStructure.cjs`와 유사한 기능이지만, 모든 파일을 분석하고 JSON으로 저장하는 확장 버전일 가능성
- 현재 코드베이스에는 해당 스크립트가 없거나 삭제되었을 가능성

**참고:** `tools/analysis/analyzeDataStructure.cjs`는 유사한 분석을 하지만 콘솔에만 출력하고 파일로 저장하지 않습니다.

---

### 5. `data/deep-analysis.json`

**상태:** ⚠️ 생성 스크립트를 찾지 못함

**가능성:**
- 별도의 심화 분석 도구에서 생성되었을 가능성

---

### 6. 마크다운 리포트 파일들

**생성 위치:**
- `DATABASE_ANALYSIS.md` - 데이터베이스 분석 리포트
- `REMAINING_FILES_ANALYSIS.md` - 미식별 파일 분석 리포트
- 기타 `.md` 파일들

**상태:** ⚠️ 대부분의 생성 스크립트를 찾지 못함

**가능성:**
- 수동으로 작성되었거나
- 별도의 분석 도구에서 생성되었을 가능성

---

## 📊 파일 사용 현황

### 다른 도구에서 `data/extracted/` 파일을 읽는 곳들:

1. **스프라이트 추출 도구들:**
   - `tools/sprites/extractHeroIconsImproved.cjs` → `data/extracted/hero.json` 읽기
   - `tools/sprites/extractHeroSprites.cjs` → `data/extracted/hero.json` 읽기
   - `tools/sprites/extractSkillIcons.cjs` → `data/extracted/skill.json` 읽기
   - `tools/sprites/extractBuffIcons.cjs` → `data/extracted/buff.json` 읽기
   - `tools/sprites/extractAllGameIcons.cjs` → `data/extracted/` 읽기
   - `tools/sprites/datamineHeroSprites.cjs` → `data/extracted/hero.json` 읽기
   - `tools/sprites/analyzeFaceAnchors.cjs` → `data/extracted/hero.json` 읽기

2. **분석 도구들:**
   - `tools/analysis/generateTalentMappings.cjs` → `data/extracted/heroes.json` 읽기
   - `tools/analysis/extractTalentMappings.cjs` → `data/extracted/` 읽기
   - `tools/analysis/extractTalentNames.cjs` → `data/extracted/` 읽기

3. **스프라이트 좌표 추출:**
   - `tools/sprites/extractSpriteCoordinates.cjs` → `data/extracted/`에 출력

---

## 🔄 데이터 플로우

```
Game Files (../package, ../package_kor)
    ↓
tools/parsers/cli.cjs
    ↓
data/extracted/*.json
    ↓
다른 도구들 (스프라이트 추출, 분석 등)
    ↓
public/images/, dist/images/
```

---

## 📝 권장 사항

1. **`data/extracted/` 파일 재생성:**
   ```bash
   npm run parse-data
   ```

2. **누락된 생성 스크립트 찾기:**
   - `file-analysis-*.json` 생성 스크립트가 필요할 경우, `analyzeDataStructure.cjs`를 확장하여 모든 파일을 분석하고 JSON으로 저장하는 버전을 만들 수 있습니다.
   - Git 히스토리를 확인하여 삭제된 스크립트가 있는지 확인할 수 있습니다.

3. **스키마 및 타입 파일:**
   - 현재는 수동 관리로 보이지만, 필요시 자동 생성 도구를 만들 수 있습니다.

---

## 🔍 추가 조사 필요

다음 파일들의 생성 스크립트를 찾지 못했습니다:
- `data/file-analysis-en.json`
- `data/file-analysis-ko.json`
- `data/deep-analysis.json`
- `data/schemas/*.json` (자동 생성 여부)
- `data/types/*.ts` (자동 생성 여부)

이 파일들은 매우 크거나 중요한 데이터를 포함하고 있으므로, 생성 방법을 문서화하거나 재생성 스크립트를 만들어두는 것이 좋습니다.

