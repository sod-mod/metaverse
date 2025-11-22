import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SortableTable from '../components/SortableTable'
import Tooltip from '../components/Tooltip'
import equipmentData from '@data/equipment.json'

export default function ItemList() {
  const { i18n } = useTranslation()
  const [items, setItems] = useState([])
  const [tooltip, setTooltip] = useState({ visible: false, content: null, position: null })

  // Update item names when language changes
  useEffect(() => {
    if (equipmentData.length > 0) {
      const localizedItems = equipmentData.map(item => {
        let name = item.displayName || item.nameCN;
        if (i18n.language === 'en' && item.nameEN) {
          name = item.nameEN;
        } else if (i18n.language === 'ko' && item.nameKO) {
          name = item.nameKO;
        }
        
        return {
          ...item,
          name
        };
      })
      setItems(localizedItems)
    }
  }, [i18n.language])

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'tier', label: 'Tier', sortable: true },
    {
      key: 'stats',
      label: 'STR',
      sortable: true,
      render: (stats) => stats?.str || 0
    },
    {
      key: 'stats',
      label: 'INT',
      sortable: true,
      render: (stats) => stats?.int || 0
    }
  ]

  const handleRowHover = (item, event) => {
    if (!item) {
      setTooltip({ visible: false, content: null, position: null })
      return
    }

    const content = (
      <div>
        <h3 className="font-bold text-lg mb-2">{item.name}</h3>
        <div className="space-y-1">
          <p><span className="font-semibold">Type:</span> {item.type}</p>
          <p><span className="font-semibold">Tier:</span> {item.tier}</p>
          {item.effect && (
            <p><span className="font-semibold">Effect:</span> {item.effect}</p>
          )}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <p className="font-semibold mb-1">Stats:</p>
            <div className="text-sm space-y-0.5">
              <p>STR: {item.stats?.str || 0}</p>
              <p>INT: {item.stats?.int || 0}</p>
              <p>CON: {item.stats?.con || 0}</p>
              <p>AGI: {item.stats?.agi || 0}</p>
              <p>MEN: {item.stats?.men || 0}</p>
            </div>
          </div>
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
      <h1 className="text-3xl font-bold text-white mb-6">Items & Equipment</h1>
      <SortableTable
        data={items}
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

