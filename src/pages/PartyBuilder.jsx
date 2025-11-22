import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import HeroAvatar from '../components/HeroAvatar'
import heroData from '@data/hero.json'

export default function PartyBuilder() {
  const { i18n } = useTranslation()
  const [heroes, setHeroes] = useState([])
  const [party, setParty] = useState(Array(6).fill(null))
  const [goals, setGoals] = useState({
    str: 0,
    int: 0,
    con: 0,
    agi: 0,
    men: 0
  })

  // Update hero names when language changes
  useEffect(() => {
    if (heroData.length > 0) {
      const localizedHeroes = heroData.map(hero => {
        let name = hero.displayName || hero.nameCN;
        if (i18n.language === 'en' && hero.nameEN) {
          name = hero.nameEN;
        } else if (i18n.language === 'ko' && hero.nameKO) {
          name = hero.nameKO;
        }
        
        return {
        ...hero,
          name
        };
      })
      setHeroes(localizedHeroes)
    }
  }, [i18n.language])

  const addToParty = (hero) => {
    const emptySlot = party.findIndex(slot => slot === null)
    if (emptySlot !== -1) {
      const newParty = [...party]
      newParty[emptySlot] = hero
      setParty(newParty)
    }
  }

  const removeFromParty = (index) => {
    const newParty = [...party]
    newParty[index] = null
    setParty(newParty)
  }

  const calculateTotalStats = () => {
    return party.reduce((acc, hero) => {
      if (!hero) return acc
      return {
        str: acc.str + (hero.stats?.str || 0),
        int: acc.int + (hero.stats?.int || 0),
        con: acc.con + (hero.stats?.con || 0),
        agi: acc.agi + (hero.stats?.agi || 0),
        men: acc.men + (hero.stats?.men || 0),
        total: acc.total + (hero.stats?.total || 0)
      }
    }, { str: 0, int: 0, con: 0, agi: 0, men: 0, total: 0 })
  }

  const totalStats = calculateTotalStats()

  const getStatDifference = (stat) => {
    const diff = totalStats[stat] - goals[stat]
    return diff >= 0 ? `+${diff}` : diff
  }

  const getStatColor = (stat) => {
    const diff = totalStats[stat] - goals[stat]
    if (diff >= 0) return 'text-green-400'
    return 'text-red-400'
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">Party Builder</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Party Slots */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your Party (6/6)</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {party.map((hero, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700 min-h-[120px] flex items-center justify-center"
              >
                {hero ? (
                  <div className="w-full">
                    <div className="flex gap-3 mb-2">
                      <HeroAvatar hero={hero} heroName={hero.name} size={56} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white">{hero.name}</h3>
                          <button
                            onClick={() => removeFromParty(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-sm text-gray-400">{hero.class} • {hero.universe}</p>
                        <div className="mt-1 text-xs text-gray-500 grid grid-cols-3 gap-1">
                          <span>STR: {hero.stats?.str || 0}</span>
                          <span>INT: {hero.stats?.int || 0}</span>
                          <span>AGI: {hero.stats?.agi || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600 text-center">
                    <div className="text-4xl mb-2">+</div>
                    <div className="text-sm">Empty Slot</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total Stats */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="font-bold text-white mb-3">Party Total Stats</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">STR:</span>
                <span className="ml-2 text-white font-bold">{totalStats.str}</span>
                {goals.str > 0 && (
                  <span className={`ml-2 ${getStatColor('str')}`}>
                    ({getStatDifference('str')})
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-400">INT:</span>
                <span className="ml-2 text-white font-bold">{totalStats.int}</span>
                {goals.int > 0 && (
                  <span className={`ml-2 ${getStatColor('int')}`}>
                    ({getStatDifference('int')})
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-400">CON:</span>
                <span className="ml-2 text-white font-bold">{totalStats.con}</span>
                {goals.con > 0 && (
                  <span className={`ml-2 ${getStatColor('con')}`}>
                    ({getStatDifference('con')})
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-400">AGI:</span>
                <span className="ml-2 text-white font-bold">{totalStats.agi}</span>
                {goals.agi > 0 && (
                  <span className={`ml-2 ${getStatColor('agi')}`}>
                    ({getStatDifference('agi')})
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-400">MEN:</span>
                <span className="ml-2 text-white font-bold">{totalStats.men}</span>
                {goals.men > 0 && (
                  <span className={`ml-2 ${getStatColor('men')}`}>
                    ({getStatDifference('men')})
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-400">TOTAL:</span>
                <span className="ml-2 text-white font-bold">{totalStats.total}</span>
              </div>
            </div>
          </div>

          {/* Goal Setting */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 mt-4">
            <h3 className="font-bold text-white mb-3">Set Goals</h3>
            <div className="grid grid-cols-2 gap-3">
              {['str', 'int', 'con', 'agi', 'men'].map(stat => (
                <div key={stat}>
                  <label className="text-sm text-gray-400 uppercase">{stat}:</label>
                  <input
                    type="number"
                    value={goals[stat]}
                    onChange={(e) => setGoals({ ...goals, [stat]: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 px-2 py-1 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Selection */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Available Heroes</h2>
          <div className="max-h-[800px] overflow-y-auto space-y-2">
            {heroes.map(hero => {
              const isInParty = party.some(p => p?.id === hero.id)
              return (
                <div
                  key={hero.id}
                  className={`bg-gray-900 rounded p-3 border border-gray-700 ${
                    isInParty ? 'opacity-50' : 'hover:bg-gray-850 cursor-pointer'
                  }`}
                  onClick={() => !isInParty && addToParty(hero)}
                >
                  <div className="flex gap-3">
                    <HeroAvatar hero={hero} heroName={hero.name} size={56} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white">{hero.name}</h3>
                          <p className="text-sm text-gray-400">
                            {hero.class} • {hero.universe}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-400">Total</div>
                          <div className="font-bold text-blue-400">{hero.stats?.total || 0}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 grid grid-cols-5 gap-2">
                        <span>S:{hero.stats?.str || 0}</span>
                        <span>I:{hero.stats?.int || 0}</span>
                        <span>C:{hero.stats?.con || 0}</span>
                        <span>A:{hero.stats?.agi || 0}</span>
                        <span>M:{hero.stats?.men || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

