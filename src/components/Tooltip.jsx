import { useState, useEffect } from 'react'

/**
 * Tooltip component that follows mouse cursor
 */
export default function Tooltip({ content, visible, position }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (position) {
      setCoords({
        x: position.x + 10,
        y: position.y + 10
      })
    }
  }, [position])

  if (!visible || !content) return null

  return (
    <div
      className="tooltip show"
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        maxWidth: '400px',
        position: 'fixed'
      }}
    >
      {content}
    </div>
  )
}

