import { useGameStore } from '@/store/gameStore';
import { DEATH_USEFULNESS_THRESHOLD } from '@/utils/constants';

export class SurvivalSystem {
  checkDeathConditions(): { dead: boolean; cause: 'starvation' | 'selection' | null } {
    const state = useGameStore.getState();

    if (state.stamina <= 0) {
      return { dead: true, cause: 'starvation' };
    }

    if (state.usefulness <= DEATH_USEFULNESS_THRESHOLD && state.day > 10) {
      // Risk, not guaranteed — let EventSystem fire selection event
      // If no selection event fires, death is deferred
      return { dead: false, cause: null };
    }

    return { dead: false, cause: null };
  }

  isAtSelectionRisk(): boolean {
    const state = useGameStore.getState();
    return state.usefulness <= DEATH_USEFULNESS_THRESHOLD && !state.dead;
  }

  getDaysUntilLiberation(): number {
    const state = useGameStore.getState();
    return Math.max(0, 257 - state.day);
  }

  getProgressPercent(): number {
    const state = useGameStore.getState();
    return Math.min(100, (state.day / 257) * 100);
  }

  getStaminaPercent(): number {
    return useGameStore.getState().stamina;
  }

  getUsefulnessPercent(): number {
    return useGameStore.getState().usefulness;
  }
}
