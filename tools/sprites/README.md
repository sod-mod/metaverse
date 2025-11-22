# Sprite & Image Tools

This directory contains tools for extracting and processing game sprites and images.

## Sprite Extraction
- **datamineHeroSprites.cjs** - Extract hero sprites from game files
- **extractHeroSprites.cjs** - Extract hero sprite sheets
- **extractHeroImages.cjs** - Extract individual hero images
- **extractSpriteMetadata.cjs** - Extract sprite metadata

## Icon Generation
- **createHeroIcons.cjs** - Generate hero icon files
- **extractHeroIcons.cjs** - Extract hero icons from sprite sheets
- **extractHeroIconsImproved.cjs** - Improved hero icon extraction

## Face Anchors & Analysis
- **extractHeroFaceAnchors.cjs** - Extract face anchor positions
- **displayFaceAnchors.cjs** - Display face anchor data
- **analyzeFaceAnchors.cjs** - Analyze face anchor patterns

## Sprite Maps
- **buildSpriteMap.cjs** - Build sprite mapping files
- **copySpriteSheets.cjs** - Copy sprite sheets to output directories

## Supporting Files
- **sprite_metadata_sample.json** - Sample sprite metadata structure

## Usage

Most scripts can be run directly with Node.js:

```bash
# Extract hero sprites
node datamineHeroSprites.cjs

# Build sprite map
node buildSpriteMap.cjs

# Generate hero icons
node createHeroIcons.cjs
```

## Related Directories
- `/public/images/` - Output directory for extracted images
- `/public/images/heroes_icon/` - Hero icon output
- `/public/spriteMap.json` - Generated sprite mapping

## Main Data Parser
For game data parsing (not images), see `/tools/parsers/` directory.

