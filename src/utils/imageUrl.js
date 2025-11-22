/**
 * Image URL Utility
 * Generates image URLs from local paths or Cloudflare R2
 */

/**
 * Get the base URL for images
 * Uses Cloudflare R2 in production, local paths in development
 */
function getImageBaseUrl() {
  // Check if we should use local images (for development)
  if (import.meta.env.VITE_USE_LOCAL_IMAGES === 'true') {
    return '';
  }

  // Use Cloudflare R2 URL if configured
  const r2Url = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
  if (r2Url) {
    // Remove trailing slash if present
    return r2Url.replace(/\/$/, '');
  }

  // Fallback to local paths
  return '';
}

/**
 * Generate full image URL from relative path
 * @param {string} imagePath - Relative path starting with /images/
 * @returns {string} Full URL to the image
 */
export function getImageUrl(imagePath) {
  // Ensure path starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const baseUrl = getImageBaseUrl();
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Generate hero icon image URL
 * @param {number} heroId - Hero ID
 * @param {string} sanitizedName - Sanitized hero name
 * @returns {string} Full URL to hero icon
 */
export function getHeroIconUrl(heroId) {
  return getImageUrl(`/images/heroes_icon/${heroId}.webp`);
}

/**
 * Generate skill image URL
 * @param {number} skillId - Skill ID
 * @returns {string} Full URL to skill image
 */
export function getSkillImageUrl(skillId) {
  return getImageUrl(`/images/skills/skill_${skillId}.webp`);
}

/**
 * Generate item image URL
 * @param {string} itemId - Item ID or filename
 * @returns {string} Full URL to item image
 */
export function getItemImageUrl(itemId) {
  return getImageUrl(`/images/items/${itemId}.webp`);
}

/**
 * Generate hero sprite sheet URL
 * @param {number} sheetNumber - Sheet number
 * @returns {string} Full URL to sprite sheet
 */
export function getHeroSpriteSheetUrl(sheetNumber) {
  return getImageUrl(`/images/heroes/hero-sprites-sheet${sheetNumber}.webp`);
}

/**
 * Generate buff image URL
 * @param {number} buffId - Buff ID
 * @returns {string} Full URL to buff image
 */
export function getBuffImageUrl(buffId) {
  return getImageUrl(`/images/buffs/buff_${buffId}.webp`);
}

/**
 * Generate talent image URL
 * @param {number} talentId - Talent ID
 * @returns {string} Full URL to talent image
 */
export function getTalentImageUrl(talentId) {
  return getImageUrl(`/images/talents/icon_${talentId}.webp`);
}

export default {
  getImageUrl,
  getHeroIconUrl,
  getSkillImageUrl,
  getItemImageUrl,
  getHeroSpriteSheetUrl,
  getBuffImageUrl,
  getTalentImageUrl,
};

