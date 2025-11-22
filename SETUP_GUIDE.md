# Multiverse Loot Hunter Wiki - Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Node.js

Download and install Node.js from https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```

### 2. Install Dependencies

Navigate to the project directory and install packages:
```bash
cd "c:/Users/lemon/My project/multiverse/multiverse-wiki"
npm install
```

This will install:
- React & React DOM
- Vite (dev server and build tool)
- React Router (navigation)
- Tailwind CSS (styling)
- Firebase SDK (backend services)

### 3. Parse Game Data

Run the data parsing scripts to convert game files to JSON:

```bash
# First, analyze the data structure
node scripts/analyzeDataStructure.js

# Then parse all data files
node scripts/parseAllData.js
```

This will generate:
- `src/data/heroes.json` - Hero database
- `src/data/skills.json` - Skill database  
- `src/data/equipment.json` - Equipment database

The CSV file will be used to cross-check the parsed data for accuracy.

### 4. Run Development Server

Start the local development server:
```bash
npm run dev
```

Open your browser to http://localhost:3000

You should see the Multiverse Loot Hunter Wiki homepage!

### 5. Firebase Setup (for user features)

To enable user authentication and party saving:

1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable these services:
   - **Authentication** → Sign-in methods → Enable Google & Email/Password
   - **Firestore Database** → Create database in production mode
   - **Hosting** → Get started

4. Get your Firebase config:
   - Project Settings → Your apps → Web app → Config object

5. Update `src/services/firebase.js` with your config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     // ... rest of your config
   };
   ```

6. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

7. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 6. Deploy to Firebase Hosting

When ready to deploy:

```bash
# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

Your site will be live at `https://your-project.firebaseapp.com`

## Troubleshooting

### Data Parsing Issues

If the parsed JSON doesn't look right:

1. Check `scripts/analyzeDataStructure.js` output to understand data structure
2. Update column mappings in `scripts/parseAllData.js`
3. Re-run the parser
4. Cross-check with the CSV file

### Firebase Errors

- **Auth not working**: Make sure you've enabled the sign-in methods in Firebase Console
- **Firestore permission denied**: Deploy the firestore.rules file
- **Hosting 404 errors**: Check firebase.json rewrites configuration

### Missing Images

Image extraction from sprite sheets requires additional work:
- Option 1: Manual extraction using image editing tools
- Option 2: Write a sprite sheet parser (complex)
- Option 3: Use coordinate mapping to display sprites in-browser

## Next Steps

### Phase 1: Data Refinement ✅ (In Progress)
- [ ] Analyze actual column structure in JSON files
- [ ] Map all hero attributes correctly (stats, talents, etc.)
- [ ] Map item/equipment attributes
- [ ] Map skill attributes
- [ ] Verify data accuracy with CSV

### Phase 2: Image Processing
- [ ] Extract hero portraits from sprite sheets
- [ ] Extract item icons
- [ ] Extract skill icons
- [ ] Add images to public/images/ folder
- [ ] Update components to display images

### Phase 3: Enhanced Features
- [ ] Add hero detail pages
- [ ] Add advanced filters (by universe, class, stat ranges)
- [ ] Implement user authentication UI
- [ ] Add save/load functionality for parties
- [ ] Add party sharing via URL
- [ ] Add comparison tool

### Phase 4: Optimization & Deploy
- [ ] Optimize images (compression, lazy loading)
- [ ] Add loading states and error handling
- [ ] Test on mobile devices
- [ ] Deploy to Firebase Hosting
- [ ] Monitor Firebase quota usage

## File Overview

### Key Files
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `firebase.json` - Firebase hosting configuration
- `firestore.rules` - Database security rules

### Source Files
- `src/main.jsx` - App entry point
- `src/App.jsx` - Main app component with routing
- `src/pages/*.jsx` - Page components
- `src/components/*.jsx` - Reusable components
- `src/services/firebase.js` - Firebase configuration

### Scripts
- `scripts/analyzeDataStructure.js` - Analyze game data files
- `scripts/parseAllData.js` - Parse game data to JSON
- `scripts/parseHeroData.js` - CSV parser (for verification)

## Tips

1. **Development**: Use `npm run dev` and hot reload for quick iteration
2. **Data Changes**: Re-run parsers whenever game data is updated
3. **Firebase Costs**: Stay within free tier by storing game data as static files
4. **Performance**: Lazy load images and use pagination for large lists
5. **Mobile**: Test responsive design on various screen sizes

## Support

For issues or questions:
1. Check the console for error messages
2. Review Firebase logs in the console
3. Verify all environment variables are set
4. Check network tab for failed requests

Good luck building your wiki! 🚀

