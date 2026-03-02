// Game dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854; // Mobile portrait ratio

// Historical dates (days from May 15, 1944 — Nyiszli's arrival)
// Liberation: January 27, 1945 = 257 days
export const LIBERATION_DAY = 257;
export const REVOLT_DAY = 145; // October 7, 1944

// Phase thresholds (by day)
export const PHASE_SONDERKOMMANDO_END = 90;
export const PHASE_MEDICAL_END = 210;
// After 210 days = Pathologist phase until liberation

// Stat bounds
export const MAX_STAMINA = 100;
export const MAX_USEFULNESS = 100;
export const MAX_DISSOCIATION = 100; // Hidden: increases with compliance
export const MAX_RATIONS = 10; // Daily ration units

// Critical thresholds
export const DEATH_USEFULNESS_THRESHOLD = 15; // Below this = selection risk
export const STARVATION_STAMINA_DRAIN = 5; // Per day without rations

// Ration amounts per phase (historically accurate scarcity)
export const BASE_DAILY_RATIONS = 3; // Sonderkommando got more than average prisoners
export const MEDICAL_DAILY_RATIONS = 4; // Slight improvement with Mengele proximity
export const PATHOLOGIST_DAILY_RATIONS = 5; // Nyiszli ate at SS mess occasionally

// Stamina recovery per ration unit
export const STAMINA_PER_RATION = 8;

// Usefulness decay per day (must keep working to maintain value)
export const USEFULNESS_DAILY_DECAY = 3;

// How much Dissociation increases per compliant task
export const DISSOCIATION_PER_COMPLIANCE = 2;
// How much it decreases per act of resistance/humanity
export const DISSOCIATION_PER_RESISTANCE = 5;

// Ending thresholds
export const ENDING_DISSOCIATION_HIGH = 70; // "Empty Shell" ending path
export const ENDING_DISSOCIATION_LOW = 30; // "Witness" ending path

// Colors (pixel art palette — muted, desaturated)
export const COLORS = {
  background: 0x1a1a1a,
  barBg: 0x2a2a2a,
  stamina: 0x8b6f47, // Brown — exhaustion
  usefulness: 0x4a7c59, // Muted green — survival
  dissociation: 0x6b5b7b, // Muted purple — psychological distance
  rations: 0x7a6040, // Dark wheat
  text: 0xd4c9b0, // Aged paper
  textDim: 0x7a7060,
  danger: 0x8b3a3a, // Muted red
  liberation: 0x6b7a8b, // Cold blue — distant hope
  accent: 0x9b8b6b, // Aged gold
};

// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  MAIN_MENU: 'MainMenuScene',
  GAME: 'GameScene',
  UPGRADE: 'UpgradeScene',
  ENDING: 'EndingScene',
} as const;

// Storage key
export const SAVE_KEY = 'gastown_save';
