import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }
  
  const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'zh', label: '中', name: '中文' },
    { code: 'ko', label: '한', name: '한국어' }
  ]
  
  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={lang.name}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

