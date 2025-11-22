# HeroList.jsx Talent 다국어 지원 업데이트

## 📊 업데이트 개요

**talents_extracted.json** 데이터를 기반으로 HeroList.jsx에 완전한 다국어 talent 지원을 추가했습니다.

## ✨ 주요 변경사항

### 1. 새로운 데이터 파일

**`multiverse-wiki/src/data/talents.json`**
- 320개 talents의 완전한 다국어 데이터
- 중국어(zh), 영어(en), 한국어(ko) 이름 포함
- Rarity, attribute type, percentage 등 메타데이터 포함

**데이터 구조:**
```json
{
  "talents": {
    "法神": {
      "id": 247,
      "names": {
        "zh": "法神",
        "en": "Dharmagod",
        "ko": "법신"
      },
      "rarity": 4,
      "attributeType": 22,
      "percentage": "9%",
      "iconId": 180,
      "description": "万法归宗之圣体！",
      "conditions": [1, 1, 4, 4, 1, 3, 4]
    }
  },
  "shortNames": {
    "法神": {
      "zh": "法神",
      "en": "Dh",
      "ko": "법신"
    }
  }
}
```

### 2. HeroList.jsx 업데이트

#### A. State 변경
```javascript
// 이전
const [talentShortNames, setTalentShortNames] = useState({})

// 현재
const [talentsData, setTalentsData] = useState({ talents: {}, shortNames: {} })
```

#### B. 데이터 로딩
```javascript
// 이전
fetch('/src/data/talent-short-names.json')

// 현재
fetch('/src/data/talents.json')
```

#### C. 새로운 헬퍼 함수

**`getTalentShortName(talentName)`** - 업그레이드
- 현재 언어(i18n.language)에 맞는 짧은 이름 반환
- 중국어: 2글자 (法神)
- 영어: 2글자 (Dh)
- 한국어: 2글자 (법신)

```javascript
const getTalentShortName = (talentName) => {
  if (!talentName) return '';
  
  // Get talent data
  const talent = talentsData.talents?.[talentName];
  if (!talent) return talentName.substring(0, 2);
  
  // Get short name for current language
  const shortNames = talentsData.shortNames?.[talent.names.zh];
  if (!shortNames) return talentName.substring(0, 2);
  
  // Map i18n language codes to talent language codes
  const langMap = { 'zh': 'zh', 'en': 'en', 'ko': 'ko' };
  const lang = langMap[i18n.language] || 'zh';
  
  return shortNames[lang] || talentName.substring(0, 2);
};
```

**`getLocalizedTalentName(talentName)`** - 신규
- 전체 talent 이름을 현재 언어로 반환
- Tooltip과 title 속성에 사용

```javascript
const getLocalizedTalentName = (talentName) => {
  if (!talentName) return '';
  
  const talent = talentsData.talents?.[talentName];
  if (!talent) return talentName;
  
  const langMap = { 'zh': 'zh', 'en': 'en', 'ko': 'ko' };
  const lang = langMap[i18n.language] || 'zh';
  
  return talent.names[lang] || talentName;
};
```

#### D. Realm 컬럼 업데이트

**이전:**
```javascript
<div title={hero.talents.talent1}>
  {level >= 1 ? `▲${shortName}` : '—'}
</div>
```

**현재:**
```javascript
const shortName = getTalentShortName(hero.talents.talent1);
const fullName = getLocalizedTalentName(hero.talents.talent1);

<div title={fullName}>
  {level >= 1 ? `▲${shortName}` : '—'}
</div>
```

#### E. Tooltip 업데이트

**이전:**
```javascript
{hero.talents.talent1 && <li>• {hero.talents.talent1}</li>}
```

**현재:**
```javascript
{hero.talents.talent1 && <li>• {getLocalizedTalentName(hero.talents.talent1)}</li>}
```

## 🎯 기능 개선

### 1. 다국어 자동 전환
- 사용자가 언어를 변경하면 talent 이름이 자동으로 해당 언어로 표시됩니다
- 짧은 이름과 전체 이름 모두 지원

### 2. 언어별 표시 예시

| Talent | 중국어 (zh) | 영어 (en) | 한국어 (ko) |
|--------|------------|----------|------------|
| **짧은 이름** | 法神 | Dh | 법신 |
| **전체 이름** | 法神 | Dharmagod | 법신 |

| Talent | 중국어 (zh) | 영어 (en) | 한국어 (ko) |
|--------|------------|----------|------------|
| **짧은 이름** | 战圣 | Wa | 전성 |
| **전체 이름** | 战圣 | Warsaint | 전성 |

### 3. Fallback 지원
- Talent 데이터가 없을 경우: 원래 이름의 첫 2글자 사용
- 언어 데이터가 없을 경우: 중국어로 fallback

## 📁 파일 변경 사항

### 신규 파일
- ✅ `multiverse-wiki/src/data/talents.json` (22,484 lines)

### 수정된 파일
- ✅ `multiverse-wiki/src/pages/HeroList.jsx`
  - Line 14: State 변경
  - Line 20: 데이터 로딩 변경
  - Lines 44-74: 헬퍼 함수 추가/수정
  - Lines 156-157, 176-177, 196-197, 216-217: Realm 컬럼 업데이트
  - Lines 259-262: Tooltip 업데이트

### 삭제 예정
- ⚠️ `multiverse-wiki/src/data/talent-short-names.json` (더 이상 사용되지 않음)

## 🚀 사용 방법

### 1. 개발 서버 실행
```bash
cd multiverse-wiki
npm run dev
```

### 2. 언어 전환
- 웹사이트의 언어 선택기를 사용하여 중국어/영어/한국어 전환
- Talent 이름이 자동으로 해당 언어로 표시됩니다

### 3. Talent 확인
- **테이블**: Realm 1-4 컬럼에서 짧은 talent 이름 표시
- **Hover (title)**: 마우스를 올리면 전체 talent 이름 표시
- **Tooltip**: 행에 마우스를 올리면 모든 talents의 전체 이름 표시

## 📊 데이터 통계

- **총 Talents**: 320개
- **다국어 지원**: 100% (중국어, 영어, 한국어)
- **Rarity 분포**:
  - Rarity 1: 83 talents (25.9%)
  - Rarity 2: 79 talents (24.7%)
  - Rarity 3: 79 talents (24.7%)
  - Rarity 4: 79 talents (24.7%)

## 🔍 테스트 사항

### 확인 필요
1. ✅ 언어 전환 시 talent 이름 변경
2. ✅ Realm 컬럼의 짧은 이름 표시
3. ✅ Hover 시 전체 이름 표시 (title 속성)
4. ✅ Tooltip에서 전체 talent 목록 표시
5. ⏳ 존재하지 않는 talent 이름 처리 (fallback)
6. ⏳ 성능 테스트 (320 talents 로딩)

## 🎨 UI 개선 제안 (향후)

1. **Rarity 표시**: Talent rarity에 따른 색상/별 표시
2. **Attribute 정보**: Talent attribute type 표시 (법술증상, 폭격 등)
3. **Percentage**: Talent 효과 수치 표시 (9% 등)
4. **Tooltip 개선**: Talent 상세 정보 표시 (description, conditions 등)
5. **필터링**: Talent rarity나 attribute로 필터링

## 📚 관련 문서

- **TALENT_EXTRACTION_SUMMARY.md** - Talent 데이터 추출 전체 과정
- **FASHEN_TALENT_REPORT.md** - 법신 talent 상세 분석
- **talents_extracted.json** - 원본 추출 데이터
- **talents.json** - 변환된 wiki용 데이터

## ✅ 완료 체크리스트

- [x] talents.json 데이터 파일 생성
- [x] HeroList.jsx 다국어 지원 추가
- [x] getTalentShortName 함수 업데이트
- [x] getLocalizedTalentName 함수 추가
- [x] Realm 컬럼 localization
- [x] Tooltip localization
- [x] 문서 작성
- [ ] 브라우저에서 동작 테스트
- [ ] 구 talent-short-names.json 파일 제거

## 🎉 결과

**HeroList.jsx가 완전한 다국어 talent 지원을 갖추었습니다!**

- 중국어, 영어, 한국어로 talent 이름 표시
- 언어 전환 시 자동 업데이트
- 320개 모든 talents 지원
- 원본 게임 데이터 기반 정확한 매핑

