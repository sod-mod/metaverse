# Tools Directory

This directory contains all build-time tools for the Multiverse Wiki project.

## Directory Structure

```
tools/
├── parsers/      # Game data parsing (JSON extraction)
├── sprites/      # Image and sprite processing
└── analysis/     # Data analysis and debugging tools
```

## Parsers (`/parsers`)

Main game data extraction system. Parses C2Array format JSON files from the game.

**Usage:**
```bash
# Parse all game data (multilingual)
node tools/parsers/cli.cjs --source=../package,../package_kor --output=data/extracted --verbose

# Or use npm script
npm run parse-data
```

**Key Files:**
- `cli.cjs` - Command-line interface
- `core/` - Core parsing utilities (C2ArrayParser, FieldMapper, TypeConverter)
- `domain/` - Domain-specific parsers (HeroParser, SkillParser, etc.)

**Output:** `data/extracted/` (heroes, skills, equipment, etc.)

## Sprites (`/sprites`)

Image extraction and sprite processing tools.

**Usage:**
```bash
# Extract hero sprites
npm run datamine-sprites

# Copy sprite sheets
npm run copy-sprites

# Full sprite setup
npm run setup-sprites

# Extract hero icons
npm run extract-icons
```

**Key Files:**
- `datamineHeroSprites.cjs` - Mine hero sprites from game
- `copySpriteSheets.cjs` - Copy sprites to public folder
- `extractHeroIconsImproved.cjs` - Generate hero icon files

## Analysis (`/analysis`)

Data analysis and debugging tools for game data exploration.

**Key Files:**
- `analyzeDataStructure.cjs` - Analyze JSON data structure
- `analyzeTalentMappings.cjs` - Analyze talent ID mappings
- `analyzeFormula.cjs` - Analyze game formulas
- `extractTalentMappings.cjs` - Extract talent mapping data
- `parseHeroCSV.cjs` - Parse CSV for verification

## Data Flow

```
Game Files (../package)
       ↓
   tools/parsers/
       ↓
  data/extracted/
       ↓
   src/ (via @data alias)
```

## Adding New Tools

1. Place parsing logic in `parsers/domain/`
2. Place image tools in `sprites/`
3. Place analysis/debug tools in `analysis/`
4. Update this README accordingly
