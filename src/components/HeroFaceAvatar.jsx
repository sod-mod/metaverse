import React from 'react';
import { getHeroIconUrl } from '../utils/imageUrl';

/**
 * Hero Face Avatar Component
 * Displays hero face from extracted sprite images
 * Uses hero.sprite.faceCenter data for face-centered cropping
 */
const HeroFaceAvatar = ({ hero, heroName, size = 48 }) => {
  const [imageError, setImageError] = React.useState(false);
  
  // 1:1.6 ratio (height:width)
  const height = size;
  const width = size * 1.6;

  if (!hero) {
    return (
      <div
        style={{
          width: width,
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: height / 3,
          fontWeight: 'bold',
          color: '#9ca3af',
          padding: 0,
          margin: 0,
        }}
        title={heroName}
      >
        ?
      </div>
    );
  }

  const imagePath = getHeroIconUrl(hero.id);

  // Calculate face-centered position - face anchor at center of viewport
  // Adjusted: -20% Y (move up) for better face framing, no padding
  let objectPosition = 'center 20%'; // Default: horizontally centered, face at ~20% from top
  if (hero.sprite?.faceCenter) {
    // Convert faceCenter (0-1 range) to CSS percentage
    const xPercent = (hero.sprite.faceCenter.x * 100).toFixed(1);
    const yPercent = ((hero.sprite.faceCenter.y - 0.35) * 100).toFixed(1); // Move up 20%
    objectPosition = `${xPercent}% ${yPercent}%`;
  }

  if (imageError) {
    // Fallback placeholder if image fails to load
    return (
      <div
        style={{
          width: width,
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: height / 3,
          fontWeight: 'bold',
          color: '#9ca3af',
          backgroundColor: '#374151',
          padding: 0,
          margin: 0,
        }}
        title={heroName}
      >
        #{hero.id}
      </div>
    );
  }

  return (
    <div
      style={{
        width: width,
        height: height,
        overflow: 'hidden',
        position: 'relative',
        padding: 0,
        margin: 0,
        lineHeight: 0,
        fontSize: 0,
        boxSizing: 'border-box',
      }}
      title={heroName}
    >
      <img
        src={imagePath}
        alt={heroName}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: objectPosition,
          imageRendering: 'auto',
          display: 'block',
        }}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default HeroFaceAvatar;
