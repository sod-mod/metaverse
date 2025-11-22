import { Routes, Route, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeroList from './pages/HeroList'
import ItemList from './pages/ItemList'
import SkillList from './pages/SkillList'
import PartyBuilder from './pages/PartyBuilder'
import LanguageSwitcher from './components/LanguageSwitcher'
import './App.css'

function App() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-white text-xl font-bold">
                {t('nav.title')}
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-4">
                <Link
                  to="/heroes"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.heroes')}
                </Link>
                <Link
                  to="/items"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.items')}
                </Link>
                <Link
                  to="/skills"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.skills')}
                </Link>
                <Link
                  to="/party"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.party')}
                </Link>
              </div>
              <div className="ml-4 border-l border-gray-700 pl-4">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/heroes" element={<HeroList />} />
          <Route path="/items" element={<ItemList />} />
          <Route path="/skills" element={<SkillList />} />
          <Route path="/party" element={<PartyBuilder />} />
        </Routes>
      </main>
    </div>
  )
}

function Home() {
  const { t } = useTranslation()
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          {t('home.title')}
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          {t('home.subtitle')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link
            to="/heroes"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{t('home.heroesCard.title')}</h2>
            <p className="text-gray-400">{t('home.heroesCard.description')}</p>
          </Link>
          <Link
            to="/items"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{t('home.itemsCard.title')}</h2>
            <p className="text-gray-400">{t('home.itemsCard.description')}</p>
          </Link>
          <Link
            to="/skills"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{t('home.skillsCard.title')}</h2>
            <p className="text-gray-400">{t('home.skillsCard.description')}</p>
          </Link>
          <Link
            to="/party"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{t('home.partyCard.title')}</h2>
            <p className="text-gray-400">{t('home.partyCard.description')}</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App

