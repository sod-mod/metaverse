import React from 'react';
import heroSpriteMapping from './hero-sprite-mapping.json';

/**
 * HeroSprite Component
 * Displays a hero portrait from sprite sheets
 */
export const HeroSprite = ({ heroId, size = 64, className = '' }) => {
  const sprite = heroSpriteMapping.heroes[heroId];
  
  if (!sprite) {
    return <div className={`hero-sprite-placeholder ${className}`} style={{ width: size, height: size }} />;
  }
  
  const sheetUrl = `/images/heroes/hero-sprites-sheet${sprite.sheet}.webp`;
  const scale = size / heroSpriteMapping._metadata.estimatedSpriteSize.width;
  
  return (
    <div 
      className={`hero-sprite ${className}`}
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        position: 'relative'
      }}
      title={sprite.nameEn}
    >
      <img
        src={sheetUrl}
        alt={sprite.nameEn}
        style={{
          position: 'absolute',
          transform: `translate(-${sprite.x * scale}px, -${sprite.y * scale}px) scale(${scale})`,
          transformOrigin: '0 0',
          imageRendering: 'auto'
        }}
        loading="lazy"
      />
    </div>
  );
};

export default HeroSprite;
