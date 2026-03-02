import { useGameStore } from '@/store/gameStore';
import type { Phase } from '@/store/gameStore';
import {
  PHASE_SONDERKOMMANDO_END,
  PHASE_MEDICAL_END,
  LIBERATION_DAY,
} from '@/utils/constants';

export class ProgressionSystem {
  getCurrentPhase(): Phase {
    return useGameStore.getState().phase;
  }

  didPhaseChange(previousDay: number, currentDay: number): Phase | null {
    const previousPhase = this.getPhaseForDay(previousDay);
    const currentPhase = this.getPhaseForDay(currentDay);
    if (previousPhase !== currentPhase) return currentPhase;
    return null;
  }

  getPhaseForDay(day: number): Phase {
    if (day <= PHASE_SONDERKOMMANDO_END) return 'sonderkommando';
    if (day <= PHASE_MEDICAL_END) return 'medical';
    return 'pathologist';
  }

  getPhaseProgress(day: number): number {
    const phase = this.getPhaseForDay(day);
    if (phase === 'sonderkommando') {
      return (day / PHASE_SONDERKOMMANDO_END) * 100;
    } else if (phase === 'medical') {
      return ((day - PHASE_SONDERKOMMANDO_END) / (PHASE_MEDICAL_END - PHASE_SONDERKOMMANDO_END)) * 100;
    } else {
      return ((day - PHASE_MEDICAL_END) / (LIBERATION_DAY - PHASE_MEDICAL_END)) * 100;
    }
  }

  getPhaseLabel(phase: Phase): string {
    switch (phase) {
      case 'sonderkommando': return 'Sonderkommando';
      case 'medical': return 'Medical Assistant';
      case 'pathologist': return 'Pathologist';
    }
  }

  getPhaseTaskTypes(phase: Phase): string[] {
    switch (phase) {
      case 'sonderkommando':
        return ['body_removal', 'belongings_sorting', 'hair_processing', 'maintenance', 'platform_duty'];
      case 'medical':
        return ['autopsies', 'specimen_preparation', 'selection_assistance', 'experiment_records'];
      case 'pathologist':
        return ['mass_documentation', 'evidence_preservation', 'hidden_chronicle'];
    }
  }
}
