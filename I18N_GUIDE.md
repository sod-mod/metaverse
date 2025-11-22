# 🌐 Internationalization (i18n) Guide

## ✅ 완성된 기능

**Multiverse Loot Hunter Wiki**에 중국어/영어 다국어 지원이 추가되었습니다!

### 지원 언어
1. **English (EN)** - 영어
2. **中文 (ZH)** - 중국어 (简体中文)

## 🚀 사용 방법

### 1. 언어 전환

**네비게이션 바 오른쪽 상단**에 언어 전환 버튼이 있습니다:
- 🌐 **EN** - 현재 영어 (클릭하면 중국어로)
- 🌐 **中** - 현재 중국어 (클릭하면 영어로)

### 2. 자동 저장

선택한 언어는 **localStorage**에 자동 저장됩니다:
- 다음 방문 시 마지막 선택 언어로 자동 설정
- 브라우저를 닫아도 유지됨

### 3. 번역 범위

#### ✅ 완전 번역
- **네비게이션**: 모든 메뉴
- **홈 페이지**: 제목, 설명, 카드
- **Hero List**: 
  - 컬럼 헤더 (Avatar, Name, Universe, Class, Stats, Total)
  - 툴팁 (Universe, Class, Stage, Stats, Talents)
  - Universe 이름 (3 Kingdoms → 三国)
  - Class 이름 (Scholar → 文士, Warrior → 战士)
- **검색 박스**: Placeholder
- **결과 카운트**: "Showing X of Y entries"

#### ⏳ 유지 (번역 안 함)
- **영웅 이름**: 중국어 그대로 (张角, 貂蝉 등)
- **Talent 이름**: 게임 원본 그대로

## 📊 번역 매핑

### Universe (位面)

| English | 中文 |
|---------|------|
| 3 Kingdoms | 三国 |
| Jianghu | 江湖 |
| Mojin | 摸金 |
| Crusades | 十字军 |
| Liaozhai | 聊斋 |
| Japan | 日本 |
| WW2 | 二战 |
| Mortal Cultivation | 凡人修仙 |
| Planet Wars | 星球大战 |
| Qi Continent | 气大陆 |
| Eldermyst | 艾尔德迷雾 |
| Superhero | 超级英雄 |
| Journey to the West | 西游记 |

### Class (职业)

| English | 中文 |
|---------|------|
| Scholar | 文士 |
| Medic | 医者 |
| Warrior | 战士 |
| Guard | 护卫 |
| Archer | 射手 |

### Stats (属性)

| English | 中文 |
|---------|------|
| STR | 力量 |
| INT | 智力 |
| CON | 体质 |
| AGI | 敏捷 |
| MEN | 精神 |
| Total | 总和 |

## 🔧 개발자 가이드

### 파일 구조

```
src/
├── i18n/
│   ├── config.js           # i18n 설정
│   └── locales/
│       ├── en.json         # 영어 번역
│       └── zh.json         # 중국어 번역
└── components/
    └── LanguageSwitcher.jsx  # 언어 전환 버튼
```

### 새 번역 추가

#### 1. 번역 파일에 키 추가

**src/i18n/locales/en.json**:
```json
{
  "myPage": {
    "title": "My Page Title",
    "description": "Description text"
  }
}
```

**src/i18n/locales/zh.json**:
```json
{
  "myPage": {
    "title": "我的页面标题",
    "description": "描述文字"
  }
}
```

#### 2. 컴포넌트에서 사용

```javascript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('myPage.title')}</h1>
      <p>{t('myPage.description')}</p>
    </div>
  )
}
```

### 조건부 번역 (fallback)

키가 없을 경우 원본 값 사용:
```javascript
// Universe가 번역에 없으면 영어 이름 그대로 표시
t(`universe.${hero.universe}`, hero.universe)
```

### 변수 삽입

```json
{
  "welcome": "Welcome, {{name}}!"
}
```

```javascript
t('welcome', { name: 'John' })
// 결과: "Welcome, John!"
```

## 🎨 UI 요소

### Language Switcher

**위치**: 네비게이션 바 오른쪽
**디자인**: 
- 아이콘: 🌐 (번역 아이콘)
- 텍스트: EN / 中
- Hover 효과: 배경색 변화
- Border: 왼쪽 구분선

**코드**:
```jsx
<LanguageSwitcher />
```

### 자동 번역 컴포넌트

**Universe/Class 자동 번역**:
```jsx
// Universe 컬럼
{
  key: 'universe',
  label: t('heroes.columns.universe'),
  render: (universe) => t(`universe.${universe}`, universe)
}
```

## 📱 모바일 지원

- ✅ 언어 전환 버튼 반응형
- ✅ 모든 번역 텍스트 모바일 최적화
- ✅ 터치 인터페이스 지원

## 🐛 문제 해결

### 번역이 안 나와요
1. 브라우저 콘솔 확인
2. i18n 초기화 확인 (`main.jsx`에 import)
3. 번역 키 경로 확인

### 언어 전환이 안 돼요
1. localStorage 확인 (`localStorage.getItem('language')`)
2. 브라우저 캐시 삭제
3. 개발자 도구에서 에러 확인

### 새 번역이 반영 안 돼요
1. 서버 재시작 (`npm run dev`)
2. 브라우저 강력 새로고침 (Ctrl+Shift+R)
3. JSON 문법 오류 확인

## 🌟 예제

### 영어 (EN)

```
Multiverse Loot Hunter Wiki
┌─────────────────────────────────────────┐
│ Heroes │ Items │ Skills │ Party Builder │ 🌐 EN │
└─────────────────────────────────────────┘

Heroes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Avatar | Name | Universe | Class | STR | INT |
|--------|------|----------|-------|-----|-----|
| [#3]   | 张角 | 3 Kingdoms | Scholar | 15 | 54 |
```

### 中文 (ZH)

```
诸天刷宝录百科
┌─────────────────────────────────────────┐
│ 英雄 │ 物品 │ 技能 │ 队伍构建 │ 🌐 中 │
└─────────────────────────────────────────┘

英雄列表
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| 头像 | 名字 | 位面 | 职业 | 力量 | 智力 |
|------|------|------|------|------|------|
| [#3] | 张角 | 三国 | 文士 | 15   | 54   |
```

## 🎯 테스트 체크리스트

- [ ] 언어 전환 버튼 작동
- [ ] 네비게이션 메뉴 번역
- [ ] Hero List 컬럼 헤더 번역
- [ ] Universe 이름 번역
- [ ] Class 이름 번역
- [ ] 스탯 이름 번역
- [ ] 툴팁 텍스트 번역
- [ ] 검색 placeholder 번역
- [ ] 언어 설정 localStorage 저장
- [ ] 페이지 새로고침 후 언어 유지
- [ ] 모바일에서 정상 작동

## 🚀 추가 개선 사항 (선택)

### 추가할 수 있는 언어
- 한국어 (ko)
- 일본어 (ja)
- 스페인어 (es)

### 번역 추가 영역
- Item List 페이지
- Skill List 페이지
- Party Builder 페이지
- Sprite Mapper 도구
- Error 메시지
- Loading 상태

### 파일 추가 방법

**1. 언어 파일 생성**: `src/i18n/locales/ko.json`

**2. config.js에 등록**:
```javascript
import ko from './locales/ko.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ko: { translation: ko }  // 추가
  },
  // ...
})
```

**3. LanguageSwitcher 업데이트**: 3개 언어 순환

## 📝 요약

✅ **완성**:
- 2개 언어 지원 (EN/ZH)
- 자동 저장/로드
- 모든 주요 UI 번역
- Universe/Class 자동 번역

⏳ **선택사항**:
- 추가 언어 (한국어, 일본어)
- 더 많은 페이지 번역
- 동적 locale 로딩

---

**지금 바로 테스트하세요!**
```
http://localhost:3000
```

**오른쪽 상단 🌐 버튼을 클릭하세요!** 🎉

