import { create } from 'zustand';
import {
  LIBERATION_DAY,
  MAX_STAMINA,
  MAX_USEFULNESS,
  MAX_DISSOCIATION,
  MAX_RATIONS,
  USEFULNESS_DAILY_DECAY,
  DISSOCIATION_PER_COMPLIANCE,
  DISSOCIATION_PER_RESISTANCE,
  BASE_DAILY_RATIONS,
  MEDICAL_DAILY_RATIONS,
  PATHOLOGIST_DAILY_RATIONS,
  STAMINA_PER_RATION,
  STARVATION_STAMINA_DRAIN,
  DEATH_USEFULNESS_THRESHOLD,
  PHASE_SONDERKOMMANDO_END,
  PHASE_MEDICAL_END,
  SAVE_KEY,
} from '@/utils/constants';

export type Phase = 'sonderkommando' | 'medical' | 'pathologist';
export type DeathCause = 'selection' | 'starvation' | null;
export type EndingType = 'witness' | 'empty' | 'fighter' | null;

export interface UpgradeState {
  extraRation: boolean;
  betterQuarters: boolean;
  medicalKnowledge: boolean;
  dissociationMastery: boolean;
  witnessPurpose: boolean;
}

export interface GameStats {
  stamina: number;
  usefulness: number;
  dissociation: number; // Hidden during play — only revealed in ending
  rations: number;
  day: number;
  phase: Phase;
  survived: boolean;
  dead: boolean;
  deathCause: DeathCause;
  endingType: EndingType;
  revolted: boolean; // Did they participate in the October 7 revolt?
  totalComplianceActs: number;
  totalResistanceActs: number;
  journalUnlockedDays: number[];
  upgrades: UpgradeState;
}

interface GameStore extends GameStats {
  // Actions
  advanceDay: () => void;
  performTask: (taskId: string, complianceLevel: 'comply' | 'resist') => void;
  applyEventChoice: (effect: EventEffect) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  rest: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
  resetGame: () => void;
  setRevolted: (value: boolean) => void;
}

export interface EventEffect {
  usefulness: number;
  stamina: number;
  dissociation: number;
  rations: number;
  isResistance?: boolean;
}

const DEFAULT_STATE: GameStats = {
  stamina: 70,
  usefulness: 40,
  dissociation: 0,
  rations: BASE_DAILY_RATIONS,
  day: 1,
  phase: 'sonderkommando',
  survived: false,
  dead: false,
  deathCause: null,
  endingType: null,
  revolted: false,
  totalComplianceActs: 0,
  totalResistanceActs: 0,
  journalUnlockedDays: [],
  upgrades: {
    extraRation: false,
    betterQuarters: false,
    medicalKnowledge: false,
    dissociationMastery: false,
    witnessPurpose: false,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getPhaseForDay(day: number): Phase {
  if (day <= PHASE_SONDERKOMMANDO_END) return 'sonderkommando';
  if (day <= PHASE_MEDICAL_END) return 'medical';
  return 'pathologist';
}

function getDailyRations(phase: Phase, upgrades: UpgradeState): number {
  const base =
    phase === 'sonderkommando'
      ? BASE_DAILY_RATIONS
      : phase === 'medical'
        ? MEDICAL_DAILY_RATIONS
        : PATHOLOGIST_DAILY_RATIONS;
  return base + (upgrades.extraRation ? 1 : 0);
}

function determineEnding(state: GameStats): EndingType {
  if (state.revolted && state.dissociation < 40) return 'fighter';
  if (state.dissociation >= 70) return 'empty';
  return 'witness';
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...DEFAULT_STATE,

  advanceDay: () => {
    const state = get();
    if (state.dead || state.survived) return;

    const newDay = state.day + 1;
    const newPhase = getPhaseForDay(newDay);
    const dailyRations = getDailyRations(newPhase, state.upgrades);

    // Apply daily rations -> stamina recovery
    const staminaFromRations = dailyRations * STAMINA_PER_RATION;
    const staminaWithoutFood = dailyRations === 0 ? -STARVATION_STAMINA_DRAIN : 0;
    const staminaRecoveryBonus = state.upgrades.betterQuarters ? 5 : 0;
    const newStamina = clamp(
      state.stamina + staminaFromRations + staminaWithoutFood + staminaRecoveryBonus,
      0,
      MAX_STAMINA
    );

    // Usefulness decays daily — must keep working
    const decayReduction = state.upgrades.medicalKnowledge ? 1 : 0;
    const newUsefulness = clamp(
      state.usefulness - (USEFULNESS_DAILY_DECAY - decayReduction),
      0,
      MAX_USEFULNESS
    );

    // Witness purpose: slowly reduce dissociation if that upgrade is purchased
    const dissociationDelta = state.upgrades.witnessPurpose ? -3 : 0;
    const newDissociation = clamp(state.dissociation + dissociationDelta, 0, MAX_DISSOCIATION);

    // Track journal unlocks
    const journalUnlockedDays = [...state.journalUnlockedDays];
    if (!journalUnlockedDays.includes(newDay)) {
      // Will be checked against events.json journalUnlocks in EventSystem
      journalUnlockedDays.push(newDay);
    }

    // Check liberation
    if (newDay >= LIBERATION_DAY) {
      set({
        day: newDay,
        phase: newPhase,
        stamina: newStamina,
        usefulness: newUsefulness,
        dissociation: newDissociation,
        rations: dailyRations,
        survived: true,
        endingType: determineEnding({ ...state, dissociation: newDissociation }),
        journalUnlockedDays,
      });
      return;
    }

    // Check death conditions
    if (newStamina <= 0) {
      set({
        day: newDay,
        stamina: 0,
        dead: true,
        deathCause: 'starvation',
        journalUnlockedDays,
      });
      return;
    }

    if (newUsefulness <= DEATH_USEFULNESS_THRESHOLD) {
      // Risk of selection — not immediate death, but flagged for event system
      // EventSystem will trigger selection event
    }

    set({
      day: newDay,
      phase: newPhase,
      stamina: newStamina,
      usefulness: newUsefulness,
      dissociation: newDissociation,
      rations: dailyRations,
      journalUnlockedDays,
    });
  },

  applyEventChoice: (effect: EventEffect) => {
    const state = get();

    const newStamina = clamp(state.stamina + effect.stamina, 0, MAX_STAMINA);
    const newUsefulness = clamp(state.usefulness + effect.usefulness, 0, MAX_USEFULNESS);
    const dissociationChange = effect.isResistance
      ? -DISSOCIATION_PER_RESISTANCE
      : effect.dissociation > 0
        ? DISSOCIATION_PER_COMPLIANCE
        : 0;
    const newDissociation = clamp(
      state.dissociation + effect.dissociation + dissociationChange,
      0,
      MAX_DISSOCIATION
    );
    const newRations = clamp(state.rations + effect.rations, 0, MAX_RATIONS);

    const newCompliance = effect.isResistance
      ? state.totalComplianceActs
      : state.totalComplianceActs + 1;
    const newResistance = effect.isResistance
      ? state.totalResistanceActs + 1
      : state.totalResistanceActs;

    // Check death after applying effects
    const dead = newStamina <= 0 || (newUsefulness <= 0 && state.day > 10);
    const deathCause: DeathCause = dead
      ? newStamina <= 0
        ? 'starvation'
        : 'selection'
      : null;

    set({
      stamina: newStamina,
      usefulness: newUsefulness,
      dissociation: newDissociation,
      rations: newRations,
      totalComplianceActs: newCompliance,
      totalResistanceActs: newResistance,
      dead,
      deathCause,
    });
  },

  performTask: (taskId: string, complianceLevel: 'comply' | 'resist') => {
    // Task effects applied via applyEventChoice after task lookup
    // This is called by GameScene after looking up the task in tasks.json
    void taskId;
    void complianceLevel;
  },

  rest: () => {
    const state = get();
    set({
      stamina: clamp(state.stamina + 5, 0, MAX_STAMINA),
      usefulness: clamp(state.usefulness - 1, 0, MAX_USEFULNESS),
    });
  },

  purchaseUpgrade: (upgradeId: string) => {
    const state = get();
    const upgradeKey = upgradeId as keyof UpgradeState;
    if (state.upgrades[upgradeKey] !== undefined) {
      set({
        upgrades: { ...state.upgrades, [upgradeKey]: true },
      });
    }
  },

  setRevolted: (value: boolean) => {
    set({ revolted: value });
  },

  saveGame: () => {
    const state = get();
    const saveData: GameStats = {
      stamina: state.stamina,
      usefulness: state.usefulness,
      dissociation: state.dissociation,
      rations: state.rations,
      day: state.day,
      phase: state.phase,
      survived: state.survived,
      dead: state.dead,
      deathCause: state.deathCause,
      endingType: state.endingType,
      revolted: state.revolted,
      totalComplianceActs: state.totalComplianceActs,
      totalResistanceActs: state.totalResistanceActs,
      journalUnlockedDays: state.journalUnlockedDays,
      upgrades: state.upgrades,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  },

  loadGame: () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const data: GameStats = JSON.parse(raw);
      set(data);
      return true;
    } catch {
      return false;
    }
  },

  resetGame: () => {
    localStorage.removeItem(SAVE_KEY);
    set(DEFAULT_STATE);
  },
}));
