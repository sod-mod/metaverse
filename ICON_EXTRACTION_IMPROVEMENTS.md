# Hero Icon Extraction - Improvement Summary

## Problems Found

1. **Inconsistent File Naming**
   - Old script used `hero.id` but files ended up with `rawData[0]` IDs
   - Example: Hero ID 1 (张角) saved as `3_zhang_jiao.webp` instead of `1_zhang_jiao.webp`

2. **Dual Data Sources**
   - `spriteMap.json` - uses pivot points (中文名 key)
   - `hero-face-anchors.json` - uses face anchors (hero.id key) ✅ Better!

3. **No Automatic Mapping Generation**
   - Had to manually create mapping file after extraction

## Improvements Made

### New Script: `extractHeroIconsImproved.cjs`

✅ **Uses `hero-face-anchors.json`**
- Direct hero.id lookup (no Chinese name lookup needed)
- More accurate face positioning
- Already has all 152 heroes mapped

✅ **Consistent Naming: `{hero.id}_{english_name}.webp`**
```
1_zhang_jiao.webp   ← Hero ID 1
2_diao_chan.webp    ← Hero ID 2
3_lu_bu.webp        ← Hero ID 3
```

✅ **Better Face Cropping**
```javascript
cropWidth = spriteWidth * 0.6   // 60% width for face
cropHeight = spriteHeight * 0.5 // 50% height for upper body
// Centered on faceCenter anchor point
```

✅ **Auto-generates `hero-icon-mapping.json`**
- No manual mapping needed
- Includes metadata about extraction

## Usage

### Re-extract Icons (Optional)
```bash
npm run extract-icons-improved
```

### Current Setup Still Works
The current `HeroFaceAvatar` component already uses the mapping file, so it works with existing icons.

## Recommendation

**Keep current icons** unless you want:
- More consistent file naming (hero.id based)
- Better face cropping using anchor data
- Cleaner extraction pipeline

The mapping file bridges the gap between current filenames and hero.id, so no urgent need to re-extract.



