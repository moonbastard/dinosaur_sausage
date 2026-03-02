import { useGameStore } from '@/store/gameStore';
import { DEATH_USEFULNESS_THRESHOLD } from '@/utils/constants';

export class Player {
  get stamina(): number {
    return useGameStore.getState().stamina;
  }

  get usefulness(): number {
    return useGameStore.getState().usefulness;
  }

  get dissociation(): number {
    return useGameStore.getState().dissociation;
  }

  get rations(): number {
    return useGameStore.getState().rations;
  }

  get day(): number {
    return useGameStore.getState().day;
  }

  get phase() {
    return useGameStore.getState().phase;
  }

  get isAlive(): boolean {
    const state = useGameStore.getState();
    return !state.dead;
  }

  get isAtRisk(): boolean {
    return this.usefulness <= DEATH_USEFULNESS_THRESHOLD;
  }

  get hasWon(): boolean {
    return useGameStore.getState().survived;
  }

  advanceDay(): void {
    useGameStore.getState().advanceDay();
    useGameStore.getState().saveGame();
  }

  rest(): void {
    useGameStore.getState().rest();
  }
}
