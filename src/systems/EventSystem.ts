import { EventLibrary, type GameEvent } from '@/entities/Event';
import { useGameStore } from '@/store/gameStore';
import type { Phase } from '@/store/gameStore';

export class EventSystem {
  private library: EventLibrary;
  private triggeredEvents: string[] = [];

  constructor() {
    this.library = new EventLibrary();
  }

  checkForEvent(day: number, phase: Phase): GameEvent | null {
    // Only trigger events on some days (not every day)
    // Probability scales with how eventful the historical period was
    const eventChance = this.getEventChance(day, phase);
    if (Math.random() > eventChance) return null;

    return this.library.getEventForDay(day, phase, this.triggeredEvents);
  }

  triggerEvent(eventId: string): void {
    if (!this.triggeredEvents.includes(eventId)) {
      this.triggeredEvents.push(eventId);
    }

    // Track revolt participation for ending determination
    if (eventId === 'sonderkommando_revolt') {
      // Handled by choice selection in GameScene
    }
  }

  getJournalEntry(day: number) {
    return this.library.getJournalEntryForDay(day);
  }

  getAllUnlockedJournal() {
    const state = useGameStore.getState();
    return this.library.getAllJournalEntries(state.journalUnlockedDays);
  }

  private getEventChance(day: number, _phase: Phase): number {
    // Historical density of events
    if (day >= 1 && day <= 56) return 0.4; // Heavy transport period
    if (day >= 57 && day <= 90) return 0.25;
    if (day >= 91 && day <= 145) return 0.35; // Mengele period + revolt
    if (day >= 145 && day <= 180) return 0.3; // Post-revolt
    if (day >= 181 && day <= 248) return 0.2; // Wind-down
    if (day >= 248) return 0.5; // Evacuation period — high event density
    return 0.25;
  }

  // Force-check for day-locked events regardless of probability
  forceCheckDayEvent(day: number, phase: Phase): GameEvent | null {
    return this.library.getEventForDay(day, phase, this.triggeredEvents);
  }
}
