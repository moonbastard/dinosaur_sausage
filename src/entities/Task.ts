import { useGameStore } from '@/store/gameStore';
import type { Phase } from '@/store/gameStore';
import tasksData from '@/data/tasks.json';

export interface TaskDefinition {
  id: string;
  phase: string;
  title: string;
  description: string;
  usefulnessGain: number;
  staminaCost: number;
  dissociationGain: number;
  timeRequired: number;
  unlocked: boolean;
}

export interface UpgradeDefinition {
  id: string;
  title: string;
  description: string;
  cost: number;
  effect: Record<string, number>;
  requires: string;
}

export class TaskManager {
  private tasks: TaskDefinition[];
  private upgrades: UpgradeDefinition[];

  constructor() {
    this.tasks = tasksData.tasks as TaskDefinition[];
    this.upgrades = tasksData.upgrades as unknown as UpgradeDefinition[];
  }

  getAvailableTasks(phase: Phase): TaskDefinition[] {
    return this.tasks.filter((t) => {
      if (t.phase === 'sonderkommando' && phase === 'sonderkommando') return true;
      if (t.phase === 'medical' && (phase === 'medical' || phase === 'pathologist')) return true;
      if (t.phase === 'pathologist' && phase === 'pathologist') return true;
      return false;
    });
  }

  getTask(id: string): TaskDefinition | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  performTask(taskId: string): void {
    const task = this.getTask(taskId);
    if (!task) return;

    useGameStore.getState().applyEventChoice({
      usefulness: task.usefulnessGain,
      stamina: -task.staminaCost,
      dissociation: task.dissociationGain,
      rations: 0,
      isResistance: task.dissociationGain < 0,
    });
  }

  getAvailableUpgrades(): UpgradeDefinition[] {
    return this.upgrades;
  }

  purchaseUpgrade(upgradeId: string): void {
    useGameStore.getState().purchaseUpgrade(upgradeId);
  }
}
