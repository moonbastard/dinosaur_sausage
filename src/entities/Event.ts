import eventsData from '@/data/events.json';
import type { Phase } from '@/store/gameStore';

export interface EventChoice {
  id: string;
  label: string;
  effect: {
    usefulness: number;
    stamina: number;
    dissociation: number;
    rations: number;
  };
  outcome: string;
  journalEntry?: string;
}

export interface EventTrigger {
  type: 'random' | 'day';
  weight?: number;
  day?: number;
  minDay?: number;
  maxDay?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  trigger: EventTrigger;
  choices: EventChoice[];
}

export interface JournalUnlock {
  day: number;
  text: string;
}

export class EventLibrary {
  private events: GameEvent[];
  private journalUnlocks: JournalUnlock[];

  constructor() {
    this.events = eventsData.events as GameEvent[];
    this.journalUnlocks = eventsData.journalUnlocks as JournalUnlock[];
  }

  getEventForDay(day: number, _phase: Phase, triggeredEvents: string[]): GameEvent | null {
    // Check for day-specific events first
    const dayEvent = this.events.find(
      (e) => e.trigger.type === 'day' && e.trigger.day === day && !triggeredEvents.includes(e.id)
    );
    if (dayEvent) return dayEvent;

    // Check for random events
    const eligible = this.events.filter(
      (e) =>
        e.trigger.type === 'random' &&
        !triggeredEvents.includes(e.id) &&
        day >= (e.trigger.minDay ?? 0) &&
        day <= (e.trigger.maxDay ?? 999)
    );

    if (eligible.length === 0) return null;

    // Weighted random selection
    const totalWeight = eligible.reduce((sum, e) => sum + (e.trigger.weight ?? 10), 0);
    let roll = Math.random() * totalWeight;

    for (const event of eligible) {
      roll -= event.trigger.weight ?? 10;
      if (roll <= 0) return event;
    }

    return null;
  }

  getJournalEntryForDay(day: number): JournalUnlock | null {
    return this.journalUnlocks.find((j) => j.day === day) ?? null;
  }

  getAllJournalEntries(unlockedDays: number[]): JournalUnlock[] {
    return this.journalUnlocks
      .filter((j) => unlockedDays.includes(j.day))
      .sort((a, b) => a.day - b.day);
  }
}
