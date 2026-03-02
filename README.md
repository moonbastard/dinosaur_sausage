# GasTown

A pixel-art survival game exploring the moral weight of complicity through the lens of Dr. Miklós Nyiszli's memoir *Auschwitz: A Doctor's Eyewitness Account*.

> **Content Warning**: This game depicts the Holocaust and contains disturbing historical content. It is intended as serious interactive media, not entertainment.

## About

GasTown is an idle survival game that subverts genre expectations to create emotional and moral dissonance. Players assume the role of a Sonderkommando—Jewish prisoners forced to assist in the Nazi extermination process—and must survive long enough to witness liberation.

The game draws inspiration from:
- **Soda Dungeon** (mechanical framework: progression, resource management, survival loops)
- **Papers, Please** (moral weight through mundane mechanics)
- **This War of Mine** (civilian perspective on atrocity)
- **Night in the Woods** (pixel art delivering emotional gravity)

### Design Philosophy

The deliberate clash between pixelated, "retro game" aesthetics and historically accurate horror creates cognitive dissonance that prevents emotional distance. As players "progress," they realize:

1. **Survival requires complicity** — Getting better at the game means becoming more effective at horrific tasks
2. **The reward loop is the punishment** — Upgrades and progression feel increasingly hollow
3. **There is no winning** — Only surviving, and reckoning with what survival cost

## Gameplay Overview

### Progression Arc

1. **Sonderkommando (Early Game)**
   - Basic tasks: body removal, belongings sorting
   - Survival through physical labor efficiency
   - 3-month "lifespan" timer constantly visible

2. **Medical Assistant (Mid Game)**
   - Assisting with Dr. Mengele's experiments
   - "Combat" sequences against experiment victims (deeply uncomfortable by design)
   - Moral choice moments with no good options

3. **Pathologist (Late Game)**
   - Nyiszli's role: documenting atrocities
   - Preservation mechanics (saving specimens, records)
   - Working toward liberation date

### Core Mechanics

- **Stamina/Health**: Physical survival resources
- **Usefulness**: How valuable you are to your captors (too low = death)
- **Humanity**: Hidden stat affecting endings and player experience
- **Days Survived**: Primary progression metric
- **Liberation Counter**: Countdown to January 27, 1945

### Random Events

Based on Nyiszli's memoir:
- Transports arriving
- Selection days
- Sonderkommando revolts
- Allied bombing raids
- SS inspections
- Moments of humanity amid horror

## Technical Stack

| Component | Technology |
|-----------|------------|
| Engine | Phaser 3 (TypeScript) |
| Build | Vite |
| State Management | Zustand |
| Art | Aseprite pixel art |
| Audio | Howler.js |
| Platform | Web (PWA), Android (Capacitor) |
| CI/CD | GitHub Actions |

## Project Structure

```
gastown/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, test, build on every PR
│       ├── deploy-web.yml      # Deploy to GitHub Pages
│       └── build-android.yml   # Build Android APK
├── src/
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── GameScene.ts
│   │   ├── UpgradeScene.ts
│   │   └── EndingScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Task.ts
│   │   └── Event.ts
│   ├── systems/
│   │   ├── SurvivalSystem.ts
│   │   ├── ProgressionSystem.ts
│   │   ├── EventSystem.ts
│   │   └── MoralitySystem.ts
│   ├── data/
│   │   ├── events.json         # Historical events from memoir
│   │   ├── tasks.json          # Task definitions
│   │   └── dialogue.json       # Text content
│   ├── assets/
│   │   ├── sprites/
│   │   ├── audio/
│   │   └── fonts/
│   ├── store/
│   │   └── gameStore.ts        # Zustand state
│   ├── utils/
│   │   └── constants.ts
│   └── main.ts
├── android/                    # Capacitor Android project
├── public/
│   ├── index.html
│   └── manifest.json           # PWA manifest
├── tests/
├── docs/
│   ├── DESIGN.md               # Full game design document
│   ├── HISTORICAL_NOTES.md     # Source citations, accuracy notes
│   └── CONTENT_WARNINGS.md     # Detailed content warnings
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
├── capacitor.config.ts
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for mobile builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/steveyegge/gastown.git
cd gastown

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run test suite
npm run lint         # ESLint check
npm run format       # Prettier formatting
npm run android      # Build and open in Android Studio
npm run android:run  # Build and run on connected device
```

## CI/CD Pipeline

### Continuous Integration (`.github/workflows/ci.yml`)

Runs on every push and pull request:
- Lint (ESLint)
- Type check (TypeScript)
- Unit tests (Vitest)
- Build verification

### Web Deployment (`.github/workflows/deploy-web.yml`)

On push to `main`:
- Builds production bundle
- Deploys to GitHub Pages
- Available at `https://steveyegge.github.io/gastown`

### Android Build (`.github/workflows/build-android.yml`)

On release tag or manual trigger:
- Builds Android APK via Capacitor
- Uploads artifact to release
- Signs with release keystore (secrets required)

## Configuration

### Environment Variables

```bash
# .env.local (not committed)
VITE_DEBUG_MODE=true
VITE_SKIP_CONTENT_WARNING=false
```

### GitHub Secrets (for Android builds)

- `ANDROID_KEYSTORE_BASE64`: Base64-encoded release keystore
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_ALIAS`: Key alias
- `ANDROID_KEY_PASSWORD`: Key password

## Contributing

This is a personal project with specific artistic intent. If you'd like to contribute:

1. Read `docs/DESIGN.md` thoroughly
2. Understand the tone and intent
3. Open an issue before starting work
4. Ensure contributions maintain historical accuracy

### Content Guidelines

- All historical content must be sourced from Nyiszli's memoir or verified secondary sources
- No gratuitous content—everything serves the narrative
- Pixel art should suggest rather than depict explicit violence
- Text should be understated; the mechanics carry the weight

## Historical Sources

- Nyiszli, Miklós. *Auschwitz: A Doctor's Eyewitness Account*. Arcade Publishing, 2011.
- Müller, Filip. *Eyewitness Auschwitz: Three Years in the Gas Chambers*. Ivan R. Dee, 1999.
- United States Holocaust Memorial Museum archives

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

The historical content and narrative are handled with respect for the victims and survivors. This is not entertainment—it is interactive remembrance.

## Acknowledgments

- Dr. Miklós Nyiszli, whose testimony made this possible
- The Sonderkommando who left written records buried at Auschwitz
- Holocaust educators who reviewed the design approach
- My family's history at Auschwitz

---

*"Those who cannot remember the past are condemned to repeat it."* — George Santayana

*"The one who does not remember history is bound to live through it again."* — George Santayana, as paraphrased at Dachau*
