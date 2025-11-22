# Multiverse Loot Hunter Wiki

A web-based wiki and party builder for the game Multiverse Loot Hunter (诸天刷宝录).

## Features

- **Hero Database**: Browse all heroes with sortable tables, search/filter, and detailed tooltips
- **Item Database**: Explore weapons and equipment with stats and effects
- **Skill Database**: Discover all available skills and abilities
- **Party Builder**: Create your dream team of 6 heroes
  - Real-time stat calculations
  - Goal tracking system
  - Compare current stats vs target goals

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Internationalization**: i18next + react-i18next
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Parse game data:
   ```bash
   npm run parse-data
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

### Data Processing

The game data is extracted from the original game files:

- `package/hh.json` → Heroes
- `package/jn.json` → Skills  
- `package/wp.json` → Weapons/Equipment

Run the data parser to convert these to usable JSON:

```bash
node scripts/analyzeDataStructure.js  # Analyze data structure
node scripts/parseAllData.js          # Parse and generate JSON files
```

The CSV file is used for cross-checking data accuracy.

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

Alternatively, connect your GitHub repository to Vercel for automatic deployments on every push.

## Project Structure

```
multiverse-wiki/
├── src/
│   ├── components/          # Reusable components
│   │   ├── SortableTable.jsx
│   │   └── Tooltip.jsx
│   ├── pages/              # Page components
│   │   ├── HeroList.jsx
│   │   ├── ItemList.jsx
│   │   ├── SkillList.jsx
│   │   └── PartyBuilder.jsx
│   ├── data/               # Generated JSON data
│   │   ├── heroes.json
│   │   ├── skills.json
│   │   └── equipment.json
│   └── App.jsx
├── scripts/                # Data parsing scripts
│   ├── analyzeDataStructure.js
│   ├── parseAllData.js
│   └── parseHeroData.js
├── public/                 # Static assets
│   └── images/
└── package.json
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run parse-data` - Parse game data files

## License

This is a fan-made wiki for Multiverse Loot Hunter. All game data and assets belong to their original creators.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

