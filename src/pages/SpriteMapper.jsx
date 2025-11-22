import { useState } from 'react'
import { getHeroSpriteSheetUrl } from '../utils/imageUrl'

/**
 * Sprite Coordinate Mapper Tool
 * 
 * This tool helps you find sprite coordinates for heroes
 * Open this page in the browser to visually map hero positions
 */

export default function SpriteMapper() {
  const [sheetNumber, setSheetNumber] = useState(0)
  const [gridSize, setGridSize] = useState(128)
  const [showGrid, setShowGrid] = useState(true)
  const [selectedCoord, setSelectedCoord] = useState(null)
  const [mappings, setMappings] = useState([])
  
  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / gridSize) * gridSize
    const y = Math.floor((e.clientY - rect.top) / gridSize) * gridSize
    
    setSelectedCoord({ x, y })
  }
  
  const addMapping = () => {
    if (!selectedCoord) return
    
    const heroId = prompt('Enter Hero ID:')
    if (heroId) {
      const mapping = {
        heroId: parseInt(heroId),
        sheet: sheetNumber,
        x: selectedCoord.x,
        y: selectedCoord.y,
        width: gridSize,
        height: gridSize
      }
      setMappings([...mappings, mapping])
    }
  }
  
  const exportMappings = () => {
    const exportObj = {}
    mappings.forEach(m => {
      exportObj[m.heroId] = {
        sheet: m.sheet,
        x: m.x,
        y: m.y,
        width: m.width,
        height: m.height
      }
    })
    
    const json = JSON.stringify(exportObj, null, 2)
    console.log('Copy this to HeroAvatar.jsx SPRITE_MAPPING:')
    console.log(json)
    
    // Copy to clipboard
    navigator.clipboard.writeText(json)
    alert('Mapping copied to clipboard! Paste it into HeroAvatar.jsx')
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎨 Sprite Coordinate Mapper</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Select a sprite sheet number below</li>
            <li>Adjust grid size to match character size (usually 128px)</li>
            <li>Click on a character in the grid</li>
            <li>Click "Add Mapping" and enter the Hero ID</li>
            <li>Repeat for all characters</li>
            <li>Click "Export Mappings" to get the JSON</li>
            <li>Copy the JSON to <code className="bg-gray-700 px-2 py-1 rounded">src/components/HeroAvatar.jsx</code></li>
          </ol>
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded">
            <label className="block text-sm font-medium mb-2">Sprite Sheet</label>
            <select
              value={sheetNumber}
              onChange={(e) => setSheetNumber(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              {[...Array(33)].map((_, i) => (
                <option key={i} value={i}>Sheet {i}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <label className="block text-sm font-medium mb-2">Grid Size (px)</label>
            <input
              type="number"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              step="8"
            />
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <label className="block text-sm font-medium mb-2">Show Grid</label>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`w-full px-4 py-2 rounded ${
                showGrid ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              {showGrid ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <label className="block text-sm font-medium mb-2">Actions</label>
            <div className="flex gap-2">
              <button
                onClick={addMapping}
                disabled={!selectedCoord}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm"
              >
                Add
              </button>
              <button
                onClick={exportMappings}
                disabled={mappings.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm"
              >
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Selected Coordinate Info */}
        {selectedCoord && (
          <div className="bg-blue-900 border border-blue-700 rounded p-4 mb-6">
            <p className="font-semibold">
              Selected: x={selectedCoord.x}px, y={selectedCoord.y}px
            </p>
          </div>
        )}
        
        {/* Sprite Sheet Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 overflow-auto">
          <h2 className="text-xl font-bold mb-4">
            hero-sprites-sheet{sheetNumber}.webp
          </h2>
          <div className="relative inline-block">
            <img
              src={getHeroSpriteSheetUrl(sheetNumber)}
              alt={`Sprite Sheet ${sheetNumber}`}
              onClick={handleImageClick}
              className="cursor-crosshair"
              style={{ imageRendering: 'pixelated' }}
            />
            
            {/* Grid Overlay */}
            {showGrid && (
              <div
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `
                    repeating-linear-gradient(
                      0deg,
                      rgba(255,255,255,0.1) 0px,
                      rgba(255,255,255,0.1) 1px,
                      transparent 1px,
                      transparent ${gridSize}px
                    ),
                    repeating-linear-gradient(
                      90deg,
                      rgba(255,255,255,0.1) 0px,
                      rgba(255,255,255,0.1) 1px,
                      transparent 1px,
                      transparent ${gridSize}px
                    )
                  `
                }}
              />
            )}
            
            {/* Selection Highlight */}
            {selectedCoord && (
              <div
                className="absolute border-4 border-yellow-400 pointer-events-none"
                style={{
                  left: selectedCoord.x,
                  top: selectedCoord.y,
                  width: gridSize,
                  height: gridSize
                }}
              />
            )}
          </div>
        </div>
        
        {/* Mappings List */}
        {mappings.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              Mapped Characters ({mappings.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mappings.map((mapping, i) => (
                <div key={i} className="bg-gray-900 p-4 rounded border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-blue-400">Hero #{mapping.heroId}</span>
                    <button
                      onClick={() => setMappings(mappings.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Sheet: {mapping.sheet}</p>
                    <p>Position: ({mapping.x}, {mapping.y})</p>
                    <p>Size: {mapping.width}×{mapping.height}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

