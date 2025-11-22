import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SortableTable from '../components/SortableTable'
import Tooltip from '../components/Tooltip'
import TalentTooltip from '../components/TalentTooltip'
import HeroAvatar from '../components/HeroAvatar'
import HeroFaceAvatar from '../components/HeroFaceAvatar'
import heroData from '@data/hero.json'
import talentData from '@data/talent.json'
import jobData from '@data/job.json'
import effectTypeData from '@data/effectType.json'

// Talent column width configuration - adjust here to change all talent columns at once
const TALENT_COLUMN_WIDTH = '75px'

export default function HeroList() {
  const { t, i18n } = useTranslation()
  const [heroesData, setHeroesData] = useState([])
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState({ visible: false, content: null, position: null })
  const [talentTooltip, setTalentTooltip] = useState({ visible: false, talent: null, effectType: null, position: null })
  const [talentsData, setTalentsData] = useState({ talents: {}, shortNames: {} })
  const [jobsData, setJobsData] = useState([])
  const [effectTypesData, setEffectTypesData] = useState([])

  // Load hero data, talent mappings, job data, and effect types once
  useEffect(() => {
    setHeroesData(heroData)
    setTalentsData(talentData)
    setJobsData(jobData)
    setEffectTypesData(effectTypeData)
    setLoading(false)
  }, [])

  // Update hero names when language changes
  useEffect(() => {
    if (heroesData.length > 0) {
      const localizedHeroes = heroesData.map(hero => {
        // Get localized name based on current language
        let name = hero.displayName || hero.nameCN;
        if (i18n.language === 'en' && hero.nameEN) {
          name = hero.nameEN;
        } else if (i18n.language === 'ko' && hero.nameKO) {
          name = hero.nameKO;
        }
        
        // Get localized description
        let description = hero.description;
        if (i18n.language === 'en' && hero.descriptionEN) {
          description = hero.descriptionEN;
        } else if (i18n.language === 'ko' && hero.descriptionKO) {
          description = hero.descriptionKO;
        }
        
        return {
        ...hero,
          name,
          description
        };
      })
      setHeroes(localizedHeroes)
    }
  }, [heroesData, i18n.language])

  const treeColors = {
    1: 'bg-green-500',
    2: 'bg-blue-500',
    3: 'bg-pink-500',
    4: 'bg-red-500'
  };

  // Helper function to get talent effect type display with level
  const getTalentEffectCategory = (talentId) => {
    if (!talentId) return '-';
    
    const talent = Array.isArray(talentsData) 
      ? talentsData.find(t => t.id === talentId)
      : null;
    
    if (!talent || !talent.effectCategory) return '-';
    
    const grade = talent.grade || 1;
    const effectTypeId = talent.effectCategory;
    
    // Find effect type in effectTypesData
    const effectType = effectTypesData.find(e => e.id === effectTypeId);
    
    if (effectType) {
      // Get localized name and clean formatting tags like [size=10]
      let name = effectType.nameCN;
      if (i18n.language === 'en' && effectType.nameEN) {
        name = effectType.nameEN;
      } else if (i18n.language === 'ko' && effectType.nameKO) {
        name = effectType.nameKO;
      }
      
      // Remove formatting tags like [size=10], [color=#fff], etc.
      name = name.replace(/\[.*?\]/g, '').trim();
      
      return name;
    }
    
    // Fallback if effect type not found
    return `E${effectTypeId}`;
  };

  // Helper function to handle talent hover
  const handleTalentHover = (talentId, event) => {
    if (!talentId || !event) {
      setTalentTooltip({ visible: false, talent: null, effectType: null, position: null })
      return
    }

    const talent = Array.isArray(talentsData) 
      ? talentsData.find(t => t.id === talentId)
      : null

    if (!talent) {
      setTalentTooltip({ visible: false, talent: null, effectType: null, position: null })
      return
    }

    const effectType = talent.effectCategory 
      ? effectTypesData.find(e => e.id === talent.effectCategory)
      : null

    setTalentTooltip({
      visible: true,
      talent,
      effectType,
      position: { x: event.clientX, y: event.clientY }
    })
  }

  const columns = [
    { 
      key: 'name', 
      label: t('heroes.columns.name'), 
      sortable: true,
      width: '200px',
      noPadding: true,
      render: (name, hero) => (
        <div className="flex items-center gap-2 pl-1 py-1">
          <HeroFaceAvatar hero={hero} heroName={name} size={48} />
          <span>{t(`hero.${hero.id}`)}</span>
        </div>
      )
    },
    { 
      key: 'universe', 
      label: t('heroes.columns.universe'), 
      sortable: true,
      width: '80px',
      render: (universe) => t(`universe.${universe}`, `Universe ${universe}`)
    },
    { 
      key: 'initialJobId', 
      label: t('heroes.columns.class'), 
      sortable: true,
      width: '110px',
      render: (initialJobId) => {
        if (!initialJobId) return '-';
        
        // Find job by ID
        const job = jobsData.find(j => j.id === initialJobId);
        if (!job) return `Job ${initialJobId}`;
        
        // Return localized name
        if (i18n.language === 'en' && job.nameEN) return job.nameEN;
        if (i18n.language === 'ko' && job.nameKO) return job.nameKO;
        return job.nameCN;
      }
    },
    {
      key: 'stats.hp',
      label: 'HP',
      sortable: true,
      width: '70px',
      render: (_, hero) => <span className="text-green-300 font-semibold">{hero.stats?.hp || 0}</span>
    },
    {
      key: 'stats.atk',
      label: 'ATK',
      sortable: true,
      width: '70px',
      render: (_, hero) => <span className="text-red-300 font-semibold">{hero.stats?.atk || 0}</span>
    },
    {
      key: 'stats.def',
      label: 'DEF',
      sortable: true,
      width: '70px',
      render: (_, hero) => <span className="text-blue-300 font-semibold">{hero.stats?.def || 0}</span>
    },
    {
      key: 'stats.spd',
      label: 'SPD',
      sortable: true,
      width: '70px',
      render: (_, hero) => <span className="text-yellow-300 font-semibold">{hero.stats?.spd || 0}</span>
    },
    {
      key: 'stats.magic',
      label: 'MAG',
      sortable: true,
      width: '70px',
      render: (_, hero) => <span className="text-purple-300 font-semibold">{hero.stats?.magic || 0}</span>
    },
    {
      key: 'talent1',
      label: t('heroes.columns.realm1'),
      sortable: false,
      width: TALENT_COLUMN_WIDTH,
      render: (_, hero) => {
        const talentId = Array.isArray(hero.talents) ? hero.talents[0] : null;
        if (!talentId) return <div className="text-gray-500 text-center text-xs">—</div>;
        const talent = Array.isArray(talentsData) 
          ? talentsData.find(t => t.id === talentId)
          : null;
        const colorClass = treeColors[talent.tree] || 'bg-gray-500';
        return (
          <div 
            className={`${colorClass} text-white text-xs font-bold py-1 rounded text-center overflow-hidden whitespace-nowrap cursor-pointer`} 
            style={{ width: TALENT_COLUMN_WIDTH, maxWidth: TALENT_COLUMN_WIDTH }} 
            title={t(`talent.${talentId}`)}
            onMouseEnter={(e) => handleTalentHover(talentId, e)}
            onMouseLeave={() => handleTalentHover(null, null)}
          >
            {t(`effectType.${talent.effectCategory}`)}
          </div>
        );
      }
    },
    {
      key: 'talent2',
      label: t('heroes.columns.realm2'),
      sortable: false,
      width: TALENT_COLUMN_WIDTH,
      render: (_, hero) => {
        const talentId = Array.isArray(hero.talents) ? hero.talents[1] : null;
        if (!talentId) return <div className="text-gray-500 text-center text-xs">—</div>;
        const talent = Array.isArray(talentsData) 
          ? talentsData.find(t => t.id === talentId)
          : null;
        const colorClass = treeColors[talent.tree] || 'bg-gray-500';
        return (
          <div 
            className={`${colorClass} text-white text-xs font-bold py-1 rounded text-center overflow-hidden whitespace-nowrap cursor-pointer`} 
            style={{ width: TALENT_COLUMN_WIDTH, maxWidth: TALENT_COLUMN_WIDTH }} 
            title={t(`talent.${talentId}`)}
            onMouseEnter={(e) => handleTalentHover(talentId, e)}
            onMouseLeave={() => handleTalentHover(null, null)}
          >
            {t(`effectType.${talent.effectCategory}`)}
          </div>
        );
      }
    },
    {
      key: 'talent3',
      label: t('heroes.columns.realm3'),
      sortable: false,
      width: TALENT_COLUMN_WIDTH,
      render: (_, hero) => {
        const talentId = Array.isArray(hero.talents) ? hero.talents[2] : null;
        if (!talentId) return <div className="text-gray-500 text-center text-xs">—</div>;
        const talent = Array.isArray(talentsData) 
          ? talentsData.find(t => t.id === talentId)
          : null;
        const colorClass = treeColors[talent.tree] || 'bg-gray-500';
        return (
          <div 
            className={`${colorClass} text-white text-xs font-bold py-1 rounded text-center overflow-hidden whitespace-nowrap cursor-pointer`} 
            style={{ width: TALENT_COLUMN_WIDTH, maxWidth: TALENT_COLUMN_WIDTH }} 
            title={t(`talent.${talentId}`)}
            onMouseEnter={(e) => handleTalentHover(talentId, e)}
            onMouseLeave={() => handleTalentHover(null, null)}
          >
            {t(`effectType.${talent.effectCategory}`)}
          </div>
        );
      }
    },
    {
      key: 'talent4',
      label: t('heroes.columns.realm4'),
      sortable: false,
      width: TALENT_COLUMN_WIDTH,
      render: (_, hero) => {
        const talentId = Array.isArray(hero.talents) ? hero.talents[3] : null;
        if (!talentId) return <div className="text-gray-500 text-center text-xs">—</div>;
        const talent = Array.isArray(talentsData) 
          ? talentsData.find(t => t.id === talentId)
          : null;
        const colorClass = treeColors[talent.tree] || 'bg-gray-500';
        return (
          <div 
            className={`${colorClass} text-white text-xs font-bold py-1 rounded text-center overflow-hidden whitespace-nowrap cursor-pointer`} 
            style={{ width: TALENT_COLUMN_WIDTH, maxWidth: TALENT_COLUMN_WIDTH }} 
            title={t(`talent.${talentId}`)}
            onMouseEnter={(e) => handleTalentHover(talentId, e)}
            onMouseLeave={() => handleTalentHover(null, null)}
          >
            {t(`effectType.${talent.effectCategory}`)}
          </div>
        );
      }
    }
  ]

  const handleRowHover = (hero, event) => {
    if (!hero) {
      setTooltip({ visible: false, content: null, position: null })
      return
    }

    const content = (
      <div>
        <h3 className="font-bold text-lg mb-2">{t(`hero.${hero.id}`)}</h3>
        <div className="space-y-1">
          <p><span className="font-semibold">{t('heroes.tooltip.universe')}:</span> {t(`universe.${hero.universe}`, `Universe ${hero.universe}`)}</p>
          <p><span className="font-semibold">{t('heroes.tooltip.class')}:</span> {hero.race || '-'}</p>
          {hero.stage && (
            <p><span className="font-semibold">{t('heroes.tooltip.stage')}:</span> {hero.stage}</p>
          )}
          {hero.title && (
            <p><span className="font-semibold">Title:</span> {hero.title}</p>
          )}
          {hero.description && (
            <div className="mt-2 pt-2 border-t border-gray-600 max-w-md">
              <p className="text-sm">{hero.description.replace(/&newline&/g, '\n')}</p>
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <p className="font-semibold mb-1">{t('heroes.tooltip.stats')}:</p>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <span>HP: {hero.stats?.hp || 0}</span>
              <span>ATK: {hero.stats?.atk || 0}</span>
              <span>DEF: {hero.stats?.def || 0}</span>
              <span>SPD: {hero.stats?.spd || 0}</span>
              <span>MAG: {hero.stats?.magic || 0}</span>
            </div>
          </div>
          {hero.talents && Array.isArray(hero.talents) && hero.talents.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="font-semibold mb-1">{t('heroes.tooltip.talents')}:</p>
              <ul className="text-sm space-y-0.5">
                {hero.talents[0] && <li>• {getLocalizedTalentName(hero.talents[0])}</li>}
                {hero.talents[1] && <li>• {getLocalizedTalentName(hero.talents[1])}</li>}
                {hero.talents[2] && <li>• {getLocalizedTalentName(hero.talents[2])}</li>}
                {hero.talents[3] && <li>• {getLocalizedTalentName(hero.talents[3])}</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    )

    setTooltip({
      visible: true,
      content,
      position: { x: event.clientX, y: event.clientY }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">{t('heroes.loading')}</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">{t('heroes.title')}</h1>
      <SortableTable
        data={heroes}
        columns={columns}
      />
      <Tooltip 
        visible={tooltip.visible} 
        content={tooltip.content} 
        position={tooltip.position} 
      />
      {talentTooltip.visible && (
        <div
          className="fixed z-50"
          style={{
            left: `${talentTooltip.position.x + 10}px`,
            top: `${talentTooltip.position.y + 10}px`,
            pointerEvents: 'none'
          }}
        >
          <TalentTooltip 
            talent={talentTooltip.talent} 
            effectType={talentTooltip.effectType}
          />
        </div>
      )}
    </div>
  )
}

