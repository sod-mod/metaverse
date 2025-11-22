import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SortableTable from '../components/SortableTable'
import Tooltip from '../components/Tooltip'
import skillData from '@data/skill.json'
import { getSkillImageUrl } from '../utils/imageUrl'

export default function SkillList() {
  const { t, i18n } = useTranslation()
  const [skills, setSkills] = useState([])
  const [tooltip, setTooltip] = useState({ visible: false, content: null, position: null })

  // Update skill names when language changes
  useEffect(() => {
    if (skillData.length > 0) {
      const localizedSkills = skillData.map(skill => {
        let name = skill.displayName || skill.nameCN;
        if (i18n.language === 'en' && skill.nameEN) {
          name = skill.nameEN;
        } else if (i18n.language === 'ko' && skill.nameKO) {
          name = skill.nameKO;
        }
        
        let effectDescription = skill.effectDescription;
        if (i18n.language === 'en' && skill.effectDescriptionEN) {
          effectDescription = skill.effectDescriptionEN;
        } else if (i18n.language === 'ko' && skill.effectDescriptionKO) {
          effectDescription = skill.effectDescriptionKO;
        }
        
        // Replace variable placeholders with actual values
        if (effectDescription) {
          // Replace "百分比数值%" with actual basePower value
          effectDescription = effectDescription.replace(/百分比数值%/g, `${skill.basePower}%`);
          
          // Replace "buff几率%" with buffChance
          if (skill.buffChance) {
            effectDescription = effectDescription.replace(/buff几率%/g, `${skill.buffChance}%`);
          }
          
          // Replace "<buff名>" with buff name (placeholder for now, needs buff lookup)
          effectDescription = effectDescription.replace(/<buff名>/g, 'Buff');
          
          // If there's a secondary power value, show it
          if (skill.basePower2 && skill.basePower2 > 0) {
            // Some skills have multiple damage values
            effectDescription = effectDescription.replace(/百分比数值2%/g, `${skill.basePower2}%`);
          }
        }
        
        // Translate using i18n
        const damageTypeTranslated = t(`damageType.${skill.damageType}`, { defaultValue: skill.damageType });
        const skillCategoryTranslated = t(`skillCategory.${skill.skillCategory}`, { defaultValue: skill.skillCategory });
        const targetTypeTranslated = t(`targetType.${skill.targetType}`, { defaultValue: skill.targetType });
        
        // Get rarity border style
        const getRarityBorderStyle = (rarity) => {
          const styles = {
            1: {}, // 없음
            2: { boxShadow: '0 0 4px 3px rgba(34, 197, 94, 0.6)' }, // 초록색
            3: { boxShadow: '0 0 4px 3px rgba(59, 130, 246, 0.6)' }, // 파란색
            4: { boxShadow: '0 0 4px 3px rgba(234, 179, 8, 0.6)' }, // 노란색
            5: { boxShadow: '0 0 4px 3px rgba(6, 182, 212, 0.6)' }, // cyan
            6: { boxShadow: '0 0 4px 3px rgba(168, 85, 247, 0.6)' }, // purple
            7: { boxShadow: '0 0 4px 3px rgba(249, 115, 22, 0.6)' }, // 주황
            8: { boxShadow: '0 0 4px 3px rgba(239, 68, 68, 0.6)' } // red
          };
          return styles[rarity] || {};
        };
        
        // Create skill icon component
        const rarityStyle = getRarityBorderStyle(skill.rarity);
        const iconDisplay = (
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded flex items-center justify-center relative">
              <img 
                src={getSkillImageUrl(skill.id)}
                alt={name}
                className="w-12 h-12 object-contain rounded"
                style={rarityStyle}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) {
                    fallback.style.display = 'flex';
                    Object.assign(fallback.style, rarityStyle);
                  }
                }}
              />
              <div 
                className="w-12 h-12 bg-gray-700 rounded items-center justify-center text-gray-400 text-xs"
                style={{ display: 'none' }}
              >
                {skill.id}
              </div>
            </div>
          </div>
        );
        
        // Create mana display component with orange circles
        const manaDisplay = skill.manaCost > 0 ? (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.min(skill.manaCost, 10) }).map((_, i) => (
              <div 
                key={i} 
                className="w-3 h-3 rounded-full bg-orange-500 border border-orange-600"
                title={`${skill.manaCost} Mana`}
              />
            ))}
            {skill.manaCost > 10 && (
              <span className="text-orange-500 text-xs ml-1">+{skill.manaCost - 10}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-500 text-xs">-</span>
        );
        
        // Translate universe name
        const universeName = t(`universe.${skill.universe}`);
        
        // Translate skill class name
        let className = '';
        if (skill.class) {
          // Try translation key first, then fallback to parsed names
          const classKey = `skillclass.${skill.class}`;
          const translatedClass = t(classKey, { defaultValue: '' });
          
          if (translatedClass && translatedClass !== classKey) {
            className = translatedClass;
          } else {
            // Fallback to parsed names
            if (i18n.language === 'en' && skill.classNameEN) {
              className = skill.classNameEN;
            } else if (i18n.language === 'ko' && skill.classNameKO) {
              className = skill.classNameKO;
            } else if (skill.classNameCN) {
              className = skill.classNameCN;
            } else {
              className = `Class ${skill.class}`;
            }
          }
        }
        
        return {
          ...skill,
          name,
          effectDescription,
          iconDisplay,
          manaDisplay,
          universe: universeName,
          universeNum: skill.universe, // Keep numeric value for sorting
          className: className,
          damageType: damageTypeTranslated,
          skillCategory: skillCategoryTranslated,
          targetType: targetTypeTranslated
        };
      })
      
      // Sort by universe: non-zero universes first (1-13), then universe 0
      const sortedSkills = localizedSkills.sort((a, b) => {
        // If both are universe 0, sort by ID
        if (a.universeNum === 0 && b.universeNum === 0) {
          return a.id - b.id;
        }
        // Universe 0 goes to the end
        if (a.universeNum === 0) return 1;
        if (b.universeNum === 0) return -1;
        // Otherwise sort by universe number, then by ID
        if (a.universeNum !== b.universeNum) {
          return a.universeNum - b.universeNum;
        }
        return a.id - b.id;
      });
      
      setSkills(sortedSkills)
    }
  }, [i18n.language, t])

  const columns = [
    { key: 'iconDisplay', label: t('skills.columns.icon'), sortable: false, width: '80px' },
    { key: 'name', label: t('skills.columns.name'), sortable: true },
    { key: 'universe', label: t('skills.columns.universe'), sortable: true, width: '100px' },
    { key: 'manaDisplay', label: t('skills.columns.manaCost'), sortable: false, width: '120px' },
    { key: 'skillCategory', label: t('skills.columns.category'), sortable: true },
    { key: 'damageType', label: t('skills.columns.damageType'), sortable: true },
    { key: 'basePower', label: t('skills.columns.basePower'), sortable: true, width: '80px' }
  ]

  const handleRowHover = (skill, event) => {
    if (!skill) {
      setTooltip({ visible: false, content: null, position: null })
      return
    }

    // Strip color tags for display
    const cleanDescription = skill.effectDescription?.replace(/\[color=[^\]]+\]/g, '').replace(/\[\/color\]/g, '') || ''

    const content = (
      <div className="max-w-md">
        <h3 className="font-bold text-lg mb-2">{skill.name}</h3>
        <div className="space-y-1 text-sm">
          <p><span className="font-semibold">{t('skills.tooltip.universe')}:</span> {skill.universe}</p>
          <p><span className="font-semibold">{t('skills.tooltip.type')}:</span> {skill.skillCategory || 'Unknown'}</p>
          <p><span className="font-semibold">{t('skills.tooltip.damageType')}:</span> {skill.damageType || 'None'}</p>
          <p><span className="font-semibold">{t('skills.tooltip.manaCost')}:</span> {skill.manaCost || 0}</p>
          <p><span className="font-semibold">{t('skills.tooltip.basePower')}:</span> {skill.basePower || 0}%
            {skill.basePower2 > 0 && <span className="text-orange-400"> + {skill.basePower2}%</span>}
            {skill.basePower2 > 0 && <span className="text-green-400"> = {skill.basePower + skill.basePower2}%</span>}
          </p>
          <p><span className="font-semibold">{t('skills.tooltip.target')}:</span> {skill.targetType || 'N/A'}</p>
          {skill.buffChance > 0 && (
            <p><span className="font-semibold">{t('skills.tooltip.buffChance')}:</span> {skill.buffChance}%</p>
          )}
          {cleanDescription && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="text-sm whitespace-pre-wrap">{cleanDescription}</p>
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

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">{t('skills.title')}</h1>
      <SortableTable
        data={skills}
        columns={columns}
        onRowHover={handleRowHover}
      />
      <Tooltip
        visible={tooltip.visible}
        content={tooltip.content}
        position={tooltip.position}
      />
    </div>
  )
}

