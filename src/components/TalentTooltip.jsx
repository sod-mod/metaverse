import { useTranslation } from 'react-i18next'

/**
 * Talent Tooltip Component
 * Displays talent information with hexagon categories
 */
export default function TalentTooltip({ talent, effectType }) {
  const { i18n, t } = useTranslation()

  if (!talent) return null

  // Get localized name
  const lang = i18n.language
  const name = (lang === 'en' && talent.nameEN) ? talent.nameEN :
               (lang === 'ko' && talent.nameKO) ? talent.nameKO :
               talent.nameCN

  // Get localized description
  const description = talent.description || ''
  
  // Calculate percentage per level using scale and unknown
  // Formula: percentagePerLevel = scale / unknown * multiplier
  // Multiplier varies by effectType and grade combination
  const calculatePercentagePerLevel = () => {
    if (!effectType || !effectType.scale || !talent.unknown) return null
    
    const scale = effectType.scale
    const unknown = talent.unknown
    const grade = talent.grade
    
    // Calculate multiplier based on examples:
    // 순식: scale=10, unknown=40, grade=1 → multiplier=4 → 1%
    // 중격: scale=40, unknown=60, grade=2 → multiplier=9 → 6%
    // 극속: scale=10, unknown=80, grade=3 → multiplier=16 → ㅏ%
    // 마도: scale=25, unknown=100, grade=3 → multiplier=25 → 6.25%
    // 여룡: scale=25, unknown=180, grade=4 → multiplier=81 → 11.25%
    
    // Pattern: multiplier = (expected * unknown) / scale
    // But we need to determine multiplier from effectType and grade
    // For now, use a lookup based on effectCategory and grade
    const effectCategory = talent.effectCategory
    
    // Try to infer multiplier from scale/unknown ratio and grade
    // This is a temporary solution until the exact formula is determined
    const scaleOverUnknown = scale / unknown
    
    // Based on examples, multiplier seems to be: (unknown / scale) * grade for some cases
    // But this doesn't work for all cases, so we'll use a lookup table
    let multiplier
    
    // EffectCategory-specific multipliers (to be refined)
    if (effectCategory === 37) { // 쿨타임 (技能冷却)
      if (grade === 1) multiplier = 4
      else if (grade === 3) multiplier = 16
      else multiplier = 4
    } else if (effectCategory === 70) { // 마법 효과 (魔法类效果)
      multiplier = 25
    } else if (effectCategory === 13) { // 치명타 피해 (暴击伤害)
      multiplier = 9
    } else if (effectCategory === 92) { // 장병기 피해 (长柄增伤)
      multiplier = 81
    } else {
      // Default: try unknown / scale * grade
      multiplier = Math.round((unknown / scale) * grade)
    }
    
    return parseFloat((scale / unknown * multiplier).toFixed(2))
  }
  
  const percentagePerLevel = calculatePercentagePerLevel()
  
  // Max percentage at level 25 (fixed maximum level for all talents)
  const maxPercentage = percentagePerLevel 
    ? parseFloat((percentagePerLevel * 25).toFixed(2))
    : null
  
  // Get localized effect type name
  const effectTypeName = effectType ? 
    ((lang === 'en' && effectType.nameEN) ? effectType.nameEN :
     (lang === 'ko' && effectType.nameKO) ? effectType.nameKO :
     effectType.nameCN || '').replace(/\[.*?\]/g, '').trim() : ''

  // Hexagon category colors based on tree
  const treeColors = {
    1: 'bg-green-500', // Green
    2: 'bg-blue-500',  // Blue
    3: 'bg-pink-500', // Pink
    4: 'bg-red-500'   // Red
  }

  const treeColor = treeColors[talent.tree] || 'bg-gray-500'

  // Map condition values to category info
  // 1 = 공격/攻击 (Attack), 2 = 방어/防御 (Defense), 3 = 특수/特殊 (Special), 4 = 공용/通用 (Common)
  const conditionMap = {
    1: { 
      i18nKey: 'talentTooltip.condition.attack',
      color: 'bg-red-500' 
    },
    2: { 
      i18nKey: 'talentTooltip.condition.defense',
      color: 'bg-green-500' 
    },
    3: { 
      i18nKey: 'talentTooltip.condition.special',
      color: 'bg-pink-500' 
    },
    4: { 
      i18nKey: 'talentTooltip.condition.common',
      color: 'bg-blue-500' 
    }
  }

  // Get hexagon categories from talent.conditions if available
  // Conditions array has 6 slots (fields 6-11)
  let hexagonCategories = []
  
  // Debug: Log talent data to check if conditions exist
  if (process.env.NODE_ENV === 'development') {
    console.log('Talent data:', { id: talent.id, name: talent.nameCN, hasConditions: !!talent.conditions, conditions: talent.conditions })
  }
  
  if (talent.conditions && Array.isArray(talent.conditions) && talent.conditions.length > 0) {
    // Filter out invalid values (0 or undefined) and use all valid conditions (should be 6)
    const validConditions = talent.conditions.filter(c => c && c > 0 && c <= 4)
    const conditionsToUse = validConditions.slice(0, 6) // Use up to 6 conditions
    
    if (conditionsToUse.length > 0) {
      hexagonCategories = conditionsToUse.map(condition => {
        const category = conditionMap[condition] || conditionMap[4] // Default to 공용/通用
        return {
          text: t(category.i18nKey),
          color: category.color
        }
      })
    } else {
      // If no valid conditions, use placeholder
      hexagonCategories = [
        { text: t('talentTooltip.condition.defense'), color: 'bg-green-500' },
        { text: t('talentTooltip.condition.common'), color: 'bg-blue-500' },
        { text: t('talentTooltip.condition.attack'), color: 'bg-red-500' },
        { text: t('talentTooltip.condition.defense'), color: 'bg-green-500' }
      ]
    }
  } else {
    // Fallback to placeholder if conditions not available
    hexagonCategories = [
      { text: t('talentTooltip.condition.defense'), color: 'bg-green-500' },
      { text: t('talentTooltip.condition.common'), color: 'bg-blue-500' },
      { text: t('talentTooltip.condition.attack'), color: 'bg-red-500' },
      { text: t('talentTooltip.condition.defense'), color: 'bg-green-500' }
    ]
  }

  return (
    <div className="bg-gray-800 text-gray-100 rounded-lg shadow-2xl border border-gray-700 p-4 min-w-[280px] max-w-[320px]">
      {/* Title */}
      <h3 className="text-xl font-bold mb-3 text-white">{t(`talent.${talent.id}`)}</h3>
      
      {/* Effect Description */}
      <div className="mb-4 space-y-1">
        {effectTypeName && talent.grade && (
          <div className="text-sm text-gray-200">
            <span className="font-semibold">{t(`effectType.${talent.effectCategory}`)}</span>
            <span className="ml-1">Lv{talent.grade}</span>
          </div>
        )}
        {percentagePerLevel && (
          <div className="text-sm text-gray-300">
            {t('talentTooltip.perLevel')} +{percentagePerLevel}%
          </div>
        )}
        {maxPercentage && (
          <div className="text-sm text-gray-300">
            {t('talentTooltip.maxLevelEffect')}: +{maxPercentage}% ({t('talentTooltip.level25')})
          </div>
        )}
        {talent.cost !== undefined && talent.cost !== null && (
          <div className="text-sm text-gray-300">
            {t('talentTooltip.cost')}: {talent.cost}
          </div>
        )}
        {talent.cost === 0 && (
          <div className="text-sm text-gray-400 italic">
            {t('talentTooltip.noEffect')}
          </div>
        )}
        {description && (
          <div className="text-sm text-gray-400 mt-2">
            {description}
          </div>
        )}
      </div>

      {/* Hexagon Categories */}
      {hexagonCategories.length > 0 && (
        <div className="flex items-center justify-center mt-4 relative" style={{ height: '32px' }}>
          {hexagonCategories.map((category, index) => (
            <div
              key={index}
              className={`${category.color} text-white text-[10px] font-bold flex items-center justify-center`}
              style={{
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                marginLeft: index > 0 ? '-10px' : '0',
                zIndex: hexagonCategories.length - index,
                width: '52px',
                height: '42px',
                position: 'relative'
              }}
            >
              <span className="relative z-10 px-1 text-center leading-tight">{category.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

