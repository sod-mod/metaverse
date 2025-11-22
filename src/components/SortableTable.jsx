import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Reusable sortable table component
 * @param {Object} props
 * @param {Array} props.data - Array of objects to display
 * @param {Array} props.columns - Column definitions [{key, label, sortable, render}]
 * @param {Function} props.onRowClick - Optional click handler
 * @param {Function} props.onRowHover - Optional hover handler
 */
export default function SortableTable({ data, columns, onRowClick, onRowHover, rowKey = 'id' }) {
  const { t } = useTranslation()
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filter, setFilter] = useState('')

  // Helper function to get nested property value
  const getNestedValue = (obj, path) => {
    if (!path) return obj
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = getNestedValue(a, sortConfig.key)
    const bValue = getNestedValue(b, sortConfig.key)

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    // Handle strings with proper locale comparison
    const aStr = String(aValue || '')
    const bStr = String(bValue || '')
    
    if (sortConfig.direction === 'asc') {
      return aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' })
    } else {
      return bStr.localeCompare(aStr, undefined, { numeric: true, sensitivity: 'base' })
    }
  })

  // Filter data
  const filteredData = sortedData.filter(row => {
    if (!filter) return true
    return columns.some(col => {
      const value = String(getNestedValue(row, col.key) || '').toLowerCase()
      return value.includes(filter.toLowerCase())
    })
  })

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortClass = (key) => {
    if (sortConfig.key !== key) return 'sortable-header'
    return `sortable-header sorted-${sortConfig.direction}`
  }

  return (
    <div className="w-full">
      {/* Search Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('common.search')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-4 py-2 bg-teal-900 bg-opacity-50 text-white border border-teal-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-teal-700 shadow-2xl">
        <table className="min-w-full divide-y divide-teal-700" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-teal-800">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ width: col.width }}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider overflow-visible ${
                    col.sortable !== false ? getSortClass(col.key) : ''
                  }`}
                >
                  <div className="flex items-center whitespace-nowrap">
                    {col.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-teal-900 bg-opacity-40 divide-y divide-teal-800">
            {filteredData.map((row) => (
              <tr
                key={row[rowKey] || row.id}
                onClick={() => onRowClick && onRowClick(row)}
                onMouseEnter={(e) => onRowHover && onRowHover(row, e)}
                onMouseLeave={(e) => onRowHover && onRowHover(null, e)}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-gray-800' : ''
                } transition-colors`}
                style={{ height: '56px' }}
              >
                {columns.map(col => (
                  <td 
                    key={col.key} 
                    className={`${col.noPadding ? 'p-0' : 'px-3 py-4'} ${col.allowOverflow ? '' : 'whitespace-nowrap'} text-sm text-gray-300`}
                    style={{ verticalAlign: 'middle' }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-gray-400">
        {t('common.showing')} {filteredData.length} {t('common.of')} {data.length} {t('common.entries')}
      </div>
    </div>
  )
}

