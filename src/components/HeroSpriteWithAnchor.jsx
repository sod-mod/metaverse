import React, { useState } from 'react';
import heroMapping from '../../public/images/heroes/hero-sprite-mapping-with-anchors.json';
import { getHeroSpriteSheetUrl } from '../utils/imageUrl';

/**
 * HeroSprite Component with Face Anchor Support
 * Displays hero portrait centered on the face anchor point
 */
export const HeroSpriteWithAnchor = ({ 
  heroId, 
  size = 64, 
  className = '',
  showAnchor = false  // 디버깅용: 앵커 포인트 표시
}) => {
  const [spriteError, setSpriteError] = useState(false);
  const hero = heroMapping.heroes[heroId];
  
  if (!hero || spriteError) {
    return (
      <div 
        className={`hero-sprite-placeholder ${className}`} 
        style={{ width: size, height: size, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        #{heroId}
      </div>
    );
  }
  
  const sheetUrl = getHeroSpriteSheetUrl(hero.sprite.sheet);
  const scale = size / heroMapping._metadata.spriteSize.width;
  
  // 얼굴 중심을 기준으로 표시
  const faceAnchor = hero.faceAnchor;
  
  return (
    <div 
      className={`hero-sprite ${className}`}
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        position: 'relative',
      }}
      title={`${hero.name} (Face Anchor: ${faceAnchor.relativeX.toFixed(0)}, ${faceAnchor.relativeY.toFixed(0)})`}
    >
      <img
        src={sheetUrl}
        alt={hero.name}
        style={{
          position: 'absolute',
          // 얼굴 앵커를 중심으로 배치
          left: `${size / 2}px`,
          top: `${size / 2}px`,
          transform: `translate(-${faceAnchor.absoluteX * scale}px, -${faceAnchor.absoluteY * scale}px) scale(${scale})`,
          transformOrigin: '0 0',
          imageRendering: 'auto',
        }}
        onError={() => setSpriteError(true)}
        loading="lazy"
      />
      
      {showAnchor && (
        <div 
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '10px',
            height: '10px',
            background: 'red',
            border: '2px solid white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
};

export default HeroSpriteWithAnchor;
