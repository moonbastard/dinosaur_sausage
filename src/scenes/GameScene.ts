import Phaser from 'phaser';
import { SCENES, COLORS, LIBERATION_DAY } from '@/utils/constants';
import { useGameStore } from '@/store/gameStore';
import { Player } from '@/entities/Player';
import { TaskManager, type TaskDefinition } from '@/entities/Task';
import { type GameEvent, type EventChoice } from '@/entities/Event';
import { EventSystem } from '@/systems/EventSystem';
import { SurvivalSystem } from '@/systems/SurvivalSystem';
import { ProgressionSystem } from '@/systems/ProgressionSystem';

interface StatBar {
  bg: Phaser.GameObjects.Rectangle;
  fill: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  value: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private taskManager!: TaskManager;
  private eventSystem!: EventSystem;
  private survivalSystem!: SurvivalSystem;
  private progressionSystem!: ProgressionSystem;

  // UI elements
  private dayText!: Phaser.GameObjects.Text;
  private liberationText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private staminaBar!: StatBar;
  private usefulnessBar!: StatBar;
  private rationsText!: Phaser.GameObjects.Text;
  private taskListContainer!: Phaser.GameObjects.Container;
  private warningText!: Phaser.GameObjects.Text;
  private eventModal: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: SCENES.GAME });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.player = new Player();
    this.taskManager = new TaskManager();
    this.eventSystem = new EventSystem();
    this.survivalSystem = new SurvivalSystem();
    this.progressionSystem = new ProgressionSystem();
    this.buildUI(width, height);
    this.refreshUI();

    // Check for day-locked events on load
    this.checkDayStart();
  }

  private buildUI(width: number, height: number) {
    const pad = 10;

    // Header band
    this.add.rectangle(width / 2, 28, width, 56, 0x222222);
    this.add.rectangle(width / 2, 56, width, 1, 0x3a3a3a); // separator

    this.dayText = this.add
      .text(pad, 14, '', { fontFamily: 'monospace', fontSize: '13px', color: '#d4c9b0' })
      .setOrigin(0, 0.5);

    this.liberationText = this.add
      .text(width - pad, 14, '', { fontFamily: 'monospace', fontSize: '11px', color: '#6b7a8b' })
      .setOrigin(1, 0.5);

    this.phaseText = this.add
      .text(width / 2, 42, '', { fontFamily: 'monospace', fontSize: '10px', color: '#7a7060' })
      .setOrigin(0.5, 0.5);

    // Stat bars
    const barY = 80;
    this.staminaBar = this.createStatBar(pad, barY, width - pad * 2, 'Stamina', 0x8b6f47);
    this.usefulnessBar = this.createStatBar(pad, barY + 28, width - pad * 2, 'Usefulness', 0x4a7c59);

    // Rations
    this.rationsText = this.add
      .text(pad, barY + 58, '', { fontFamily: 'monospace', fontSize: '10px', color: '#7a6040' })
      .setOrigin(0, 0);

    // Separator
    this.add.rectangle(width / 2, barY + 74, width, 1, 0x2a2a2a);

    // Warning text (danger indicator)
    this.warningText = this.add
      .text(width / 2, barY + 85, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#8b3a3a',
        align: 'center',
      })
      .setOrigin(0.5, 0);
    this.warningText.setVisible(false);

    // Task list area
    this.taskListContainer = this.add.container(0, 0);
    this.buildTaskList(width, 190);

    // End turn button (advance day)
    this.createEndTurnButton(width / 2, height - 60);

    // Journal button
    this.add
      .text(width - 10, height - 60, 'Journal', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#6b5b7b',
      })
      .setOrigin(1, 0.5)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.showJournal())
      .on('pointerover', function (this: Phaser.GameObjects.Text) { this.setColor('#9b8bab'); })
      .on('pointerout', function (this: Phaser.GameObjects.Text) { this.setColor('#6b5b7b'); });

    // Upgrade/Arrangements button
    this.add
      .text(10, height - 60, 'Arrangements', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#6b6b4b',
      })
      .setOrigin(0, 0.5)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.scene.launch(SCENES.UPGRADE))
      .on('pointerover', function (this: Phaser.GameObjects.Text) { this.setColor('#9b9b6b'); })
      .on('pointerout', function (this: Phaser.GameObjects.Text) { this.setColor('#6b6b4b'); });
  }

  private createStatBar(
    x: number,
    y: number,
    barWidth: number,
    label: string,
    color: number
  ): StatBar {
    const barHeight = 14;
    const bg = this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight, 0x2a2a2a).setOrigin(
      0.5,
      0
    );
    const fill = this.add.rectangle(x, y, barWidth, barHeight, color).setOrigin(0, 0);

    const labelText = this.add
      .text(x + 4, y + 2, label, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#1a1a1a',
      })
      .setDepth(1);

    const valueText = this.add
      .text(x + barWidth - 4, y + 2, '100', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#1a1a1a',
      })
      .setOrigin(1, 0)
      .setDepth(1);

    return { bg, fill, label: labelText, value: valueText };
  }

  private updateStatBar(bar: StatBar, value: number, max: number = 100) {
    const fullWidth = bar.bg.width;
    const newWidth = Math.max(2, (value / max) * fullWidth);
    bar.fill.width = newWidth;
    bar.value.setText(String(Math.round(value)));
  }

  private buildTaskList(width: number, startY: number) {
    this.taskListContainer.removeAll(true);

    const tasks = this.taskManager.getAvailableTasks(this.player.phase);
    const pad = 10;

    tasks.forEach((task, i) => {
      const y = startY + i * 68;
      this.addTaskCard(task, pad, y, width - pad * 2);
    });

    // Rest option at bottom
    const restY = startY + tasks.length * 68;
    this.addRestOption(pad, restY, width - pad * 2);
  }

  private addTaskCard(task: TaskDefinition, x: number, y: number, cardWidth: number) {
    const bg = this.add.rectangle(x + cardWidth / 2, y + 30, cardWidth, 58, 0x252525).setOrigin(
      0.5,
      0
    );
    bg.setInteractive({ cursor: 'pointer' });

    const titleText = this.add.text(x + 8, y + 8, task.title, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#d4c9b0',
    });

    const descText = this.add.text(x + 8, y + 24, task.description, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#7a7060',
      wordWrap: { width: cardWidth - 16 },
    });

    const statText = this.add.text(
      x + 8,
      y + 50,
      `+${task.usefulnessGain} useful  -${task.staminaCost} stamina`,
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#5a7a5a',
      }
    );

    this.taskListContainer.add([bg, titleText, descText, statText]);

    bg.on('pointerover', () => bg.setFillStyle(0x353535));
    bg.on('pointerout', () => bg.setFillStyle(0x252525));
    bg.on('pointerdown', () => this.performTask(task));
  }

  private addRestOption(x: number, y: number, cardWidth: number) {
    const bg = this.add.rectangle(x + cardWidth / 2, y + 20, cardWidth, 38, 0x1e1e1e).setOrigin(
      0.5,
      0
    );
    bg.setInteractive({ cursor: 'pointer' });

    const restText = this.add.text(x + 8, y + 10, 'Rest  (+5 Stamina, -1 Usefulness)', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#5a5a5a',
    });

    this.taskListContainer.add([bg, restText]);

    bg.on('pointerover', () => bg.setFillStyle(0x2a2a2a));
    bg.on('pointerout', () => bg.setFillStyle(0x1e1e1e));
    bg.on('pointerdown', () => {
      this.player.rest();
      this.refreshUI();
    });
  }

  private createEndTurnButton(x: number, y: number) {
    const bg = this.add.rectangle(x, y, 160, 38, 0x3a3a2a).setInteractive({ cursor: 'pointer' });
    const label = this.add
      .text(x, y, 'End Day →', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#d4c9b0',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => { bg.setFillStyle(0x4a4a3a); label.setColor('#ffffff'); });
    bg.on('pointerout', () => { bg.setFillStyle(0x3a3a2a); label.setColor('#d4c9b0'); });
    bg.on('pointerdown', () => this.endDay());
  }

  private performTask(task: TaskDefinition) {
    if (this.player.stamina < task.staminaCost) {
      this.showMessage('You do not have the stamina for this.');
      return;
    }
    this.taskManager.performTask(task.id);
    this.refreshUI();
  }

  private endDay() {
    this.player.advanceDay();
    this.checkDayStart();
    this.refreshUI();

    const state = useGameStore.getState();
    if (state.dead) {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.ENDING, { cause: state.deathCause });
      });
      return;
    }

    if (state.survived) {
      this.cameras.main.fadeOut(1200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.ENDING, { survived: true, endingType: state.endingType });
      });
      return;
    }

    // Rebuild task list in case phase changed
    const { width } = this.scale;
    this.buildTaskList(width, 190);
  }

  private checkDayStart() {
    const state = useGameStore.getState();
    const event = this.eventSystem.forceCheckDayEvent(state.day, state.phase);
    if (event) {
      this.eventSystem.triggerEvent(event.id);
      this.showEventModal(event);
    }
  }

  private refreshUI() {
    const state = useGameStore.getState();

    this.dayText.setText(`Day ${state.day} / ${LIBERATION_DAY}`);
    this.liberationText.setText(
      `Liberation: ${LIBERATION_DAY - state.day}d`
    );
    this.phaseText.setText(
      this.progressionSystem.getPhaseLabel(state.phase).toUpperCase()
    );

    this.updateStatBar(this.staminaBar, state.stamina);
    this.updateStatBar(this.usefulnessBar, state.usefulness);

    this.rationsText.setText(`Rations: ${state.rations} units/day`);

    // Show warning if at risk
    if (this.survivalSystem.isAtSelectionRisk()) {
      this.warningText.setText('⚠ Usefulness critically low — selection risk');
      this.warningText.setVisible(true);
    } else if (state.stamina < 20) {
      this.warningText.setText('⚠ Stamina critically low — starvation risk');
      this.warningText.setVisible(true);
    } else {
      this.warningText.setVisible(false);
    }
  }

  private showEventModal(event: GameEvent) {
    if (this.eventModal) {
      this.eventModal.destroy();
      this.eventModal = null;
    }

    const { width, height } = this.scale;
    const modalW = width - 20;
    const modalX = width / 2;
    const modalY = height / 2;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    const bg = this.add.rectangle(modalX, modalY, modalW, height * 0.75, 0x1e1e1e);
    bg.setStrokeStyle(1, 0x4a4a4a);

    const titleText = this.add
      .text(modalX, modalY - height * 0.32, event.title, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9b8b6b',
      })
      .setOrigin(0.5, 0);

    const descText = this.add
      .text(modalX, modalY - height * 0.27, event.description, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#d4c9b0',
        align: 'center',
        wordWrap: { width: modalW - 30 },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0);

    const choiceObjects: Phaser.GameObjects.GameObject[] = [];

    event.choices.forEach((choice, i) => {
      const choiceY = modalY + height * 0.05 + i * 75;
      const choiceBg = this.add.rectangle(modalX, choiceY, modalW - 20, 65, 0x2a2a2a);
      choiceBg.setStrokeStyle(1, 0x3a3a3a);
      choiceBg.setInteractive({ cursor: 'pointer' });

      const choiceLabel = this.add
        .text(modalX, choiceY - 15, choice.label, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#d4c9b0',
          align: 'center',
          wordWrap: { width: modalW - 40 },
        })
        .setOrigin(0.5, 0);

      const effectStr = this.formatEffects(choice.effect);
      const effectText = this.add
        .text(modalX, choiceY + 12, effectStr, {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#6a8a6a',
          align: 'center',
        })
        .setOrigin(0.5, 0);

      choiceBg.on('pointerover', () => choiceBg.setFillStyle(0x3a3a3a));
      choiceBg.on('pointerout', () => choiceBg.setFillStyle(0x2a2a2a));
      choiceBg.on('pointerdown', () => {
        this.applyChoice(choice, event.id);
        this.closeModal();
      });

      choiceObjects.push(choiceBg, choiceLabel, effectText);
    });

    this.eventModal = this.add.container(0, 0, [
      overlay,
      bg,
      titleText,
      descText,
      ...choiceObjects,
    ]);
  }

  private formatEffects(effect: EventChoice['effect']): string {
    const parts: string[] = [];
    if (effect.usefulness !== 0) {
      parts.push(`${effect.usefulness > 0 ? '+' : ''}${effect.usefulness} Usefulness`);
    }
    if (effect.stamina !== 0) {
      parts.push(`${effect.stamina > 0 ? '+' : ''}${effect.stamina} Stamina`);
    }
    if (effect.rations !== 0) {
      parts.push(`${effect.rations > 0 ? '+' : ''}${effect.rations} Rations`);
    }
    return parts.join('  ');
  }

  private applyChoice(choice: EventChoice, eventId: string) {
    const isResistance = choice.id.includes('resist') || choice.id.includes('slow') ||
      choice.id.includes('minimize') || choice.id.includes('share') ||
      choice.id.includes('speak') || choice.id.includes('document') ||
      choice.id.includes('fight') || choice.id.includes('join') ||
      choice.id.includes('memorize');

    useGameStore.getState().applyEventChoice({
      ...choice.effect,
      isResistance,
    });

    // Special: revolt participation
    if (eventId === 'sonderkommando_revolt' && choice.id === 'fight') {
      useGameStore.getState().setRevolted(true);
    }

    this.refreshUI();
    this.showOutcome(choice.outcome);
  }

  private showOutcome(text: string) {
    const { width, height } = this.scale;
    const outcomeText = this.add
      .text(width / 2, height * 0.85, text, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#9b8b6b',
        align: 'center',
        wordWrap: { width: width - 40 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: outcomeText,
      alpha: 0,
      delay: 3000,
      duration: 1000,
      onComplete: () => outcomeText.destroy(),
    });
  }

  private closeModal() {
    if (this.eventModal) {
      this.eventModal.destroy();
      this.eventModal = null;
    }
  }

  private showJournal() {
    const { width, height } = this.scale;
    const entries = this.eventSystem.getAllUnlockedJournal();

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setInteractive();
    overlay.setDepth(100);

    const titleText = this.add
      .text(width / 2, 30, 'Testimony', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9b8b6b',
      })
      .setOrigin(0.5)
      .setDepth(101);

    if (entries.length === 0) {
      this.add
        .text(width / 2, height / 2, 'No entries yet.\nSurvive longer.', {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#5a5a5a',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(101);
    } else {
      const lastEntry = entries[entries.length - 1];
      this.add
        .text(
          width / 2,
          height / 2,
          `Day ${lastEntry.day}\n\n"${lastEntry.text}"`,
          {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#d4c9b0',
            align: 'center',
            wordWrap: { width: width - 40 },
            lineSpacing: 5,
          }
        )
        .setOrigin(0.5)
        .setDepth(101);
    }

    const closeText = this.add
      .text(width / 2, height - 30, '[ tap to close ]', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#5a5a5a',
      })
      .setOrigin(0.5)
      .setDepth(101);

    overlay.once('pointerdown', () => {
      overlay.destroy();
      titleText.destroy();
      closeText.destroy();
    });
  }

  private showMessage(msg: string) {
    const { width, height } = this.scale;
    const t = this.add
      .text(width / 2, height / 2, msg, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#8b3a3a',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.tweens.add({
      targets: t,
      alpha: 0,
      delay: 2000,
      duration: 500,
      onComplete: () => t.destroy(),
    });
  }
}
