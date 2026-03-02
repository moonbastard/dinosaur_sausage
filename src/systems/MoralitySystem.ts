import { useGameStore } from '@/store/gameStore';
import type { EndingType } from '@/store/gameStore';
import { ENDING_DISSOCIATION_HIGH, ENDING_DISSOCIATION_LOW } from '@/utils/constants';

/**
 * MoralitySystem tracks the hidden dissociation arc and determines endings.
 *
 * Dissociation is intentionally hidden from the player during gameplay —
 * reflecting how the psychological distancing that enabled survival was
 * itself invisible to those experiencing it.
 *
 * The ending reveals what dissociation level the player reached, and what it
 * means for their character's post-liberation life.
 */
export class MoralitySystem {
  // Hidden from player during game — revealed only in ending
  getDissociation(): number {
    return useGameStore.getState().dissociation;
  }

  getEndingType(): EndingType {
    const state = useGameStore.getState();
    const dissociation = state.dissociation;

    if (state.revolted && dissociation < 40) return 'fighter';
    if (dissociation >= ENDING_DISSOCIATION_HIGH) return 'empty';
    return 'witness';
  }

  isHighDissociation(): boolean {
    return this.getDissociation() >= ENDING_DISSOCIATION_HIGH;
  }

  isLowDissociation(): boolean {
    return this.getDissociation() <= ENDING_DISSOCIATION_LOW;
  }

  // Used internally to check if player has participated in resistance
  hasResisted(): boolean {
    const state = useGameStore.getState();
    return state.totalResistanceActs > 0 || state.revolted;
  }

  // Summary for the ending scene — reveals the hidden arc
  getDissociationNarrative(): string {
    const d = this.getDissociation();

    if (d < 20) {
      return 'You maintained an extraordinary degree of psychological presence throughout your ordeal. You witnessed. You remained.';
    } else if (d < 40) {
      return 'You learned to compartmentalize, but never entirely. Parts of you remained present, resistant, human.';
    } else if (d < 60) {
      return 'The necessary dissociation of survival left its marks. You became efficient. The efficiency cost something.';
    } else if (d < 80) {
      return 'You mastered the psychological distance that efficiency required. The person who arrived on May 15 is not the person who survived.';
    } else {
      return 'The machinery of survival completed its work on you. You emerged functional, hollowed, and alive. This is not failure — it is what survival cost in that place.';
    }
  }

  // Count acts for ending scene statistics
  getComplianceActs(): number {
    return useGameStore.getState().totalComplianceActs;
  }

  getResistanceActs(): number {
    return useGameStore.getState().totalResistanceActs;
  }
}
