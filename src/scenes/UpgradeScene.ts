import Phaser from 'phaser';
import { SCENES, COLORS } from '@/utils/constants';
import { useGameStore } from '@/store/gameStore';
import { TaskManager, type UpgradeDefinition } from '@/entities/Task';

/**
 * UpgradeScene — "Arrangements"
 *
 * The upgrade screen is deliberately titled "Arrangements" rather than "Upgrades"
 * to reflect the historical reality: Sonderkommando and privileged prisoners
 * had to negotiate, barter, and arrange for small improvements to their conditions.
 * Nothing was freely given; everything had a cost.
 */
export class UpgradeScene extends Phaser.Scene {
  private taskManager!: TaskManager;

  constructor() {
    super({ key: SCENES.UPGRADE });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.background);

    this.taskManager = new TaskManager();

    // Header
    this.add.rectangle(width / 2, 28, width, 56, 0x222222);
    this.add
      .text(width / 2, 20, 'Arrangements', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#d4c9b0',
      })
      .setOrigin(0.5, 0);

    this.add
      .text(width / 2, 40, 'Privileges negotiated with your captors', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#5a5a5a',
      })
      .setOrigin(0.5, 0);

    const state = useGameStore.getState();
    const upgrades = this.taskManager.getAvailableUpgrades();

    upgrades.forEach((upgrade, i) => {
      this.renderUpgrade(upgrade, 10, 70 + i * 80, width - 20, state);
    });

    // Back button
    this.add
      .text(10, height - 30, '← Back', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#7a7060',
      })
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => {
        this.scene.stop();
        this.scene.resume(SCENES.GAME);
      })
      .on('pointerover', function (this: Phaser.GameObjects.Text) { this.setColor('#d4c9b0'); })
      .on('pointerout', function (this: Phaser.GameObjects.Text) { this.setColor('#7a7060'); });
  }

  private renderUpgrade(
    upgrade: UpgradeDefinition,
    x: number,
    y: number,
    cardWidth: number,
    state: ReturnType<typeof useGameStore.getState>
  ) {
    const isOwned = state.upgrades[upgrade.id as keyof typeof state.upgrades];
    const isAffordable = state.usefulness >= upgrade.cost;

    const bgColor = isOwned ? 0x1a2a1a : isAffordable ? 0x252525 : 0x1e1e1e;
    const bg = this.add.rectangle(x + cardWidth / 2, y + 35, cardWidth, 70, bgColor).setOrigin(
      0.5,
      0
    );
    bg.setStrokeStyle(1, isOwned ? 0x3a5a3a : 0x333333);

    const titleColor = isOwned ? '#6b9b6b' : isAffordable ? '#d4c9b0' : '#5a5a5a';
    this.add.text(x + 8, y + 6, upgrade.title, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: titleColor,
    });

    this.add.text(x + 8, y + 24, upgrade.description, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#6a6a6a',
      wordWrap: { width: cardWidth - 70 },
    });

    const costLabel = isOwned ? 'Arranged' : `Cost: ${upgrade.cost} Usefulness`;
    const costColor = isOwned ? '#6b9b6b' : isAffordable ? '#9b8b6b' : '#5a4a4a';
    this.add
      .text(x + cardWidth - 8, y + 6, costLabel, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: costColor,
      })
      .setOrigin(1, 0);

    if (!isOwned && isAffordable) {
      bg.setInteractive({ cursor: 'pointer' });
      bg.on('pointerover', () => bg.setFillStyle(0x303030));
      bg.on('pointerout', () => bg.setFillStyle(bgColor));
      bg.on('pointerdown', () => {
        useGameStore.getState().applyEventChoice({
          usefulness: -upgrade.cost,
          stamina: 0,
          dissociation: 0,
          rations: 0,
        });
        this.taskManager.purchaseUpgrade(upgrade.id);
        this.scene.restart();
      });
    }
  }
}
