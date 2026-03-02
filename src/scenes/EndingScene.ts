import Phaser from 'phaser';
import { SCENES, COLORS } from '@/utils/constants';
import { useGameStore } from '@/store/gameStore';
import { MoralitySystem } from '@/systems/MoralitySystem';
import dialogueData from '@/data/dialogue.json';

export class EndingScene extends Phaser.Scene {
  private morality!: MoralitySystem;

  constructor() {
    super({ key: SCENES.ENDING });
  }

  create(data: { survived?: boolean; cause?: string; endingType?: string }) {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.cameras.main.fadeIn(1500, 0, 0, 0);

    this.morality = new MoralitySystem();
    const state = useGameStore.getState();

    if (data?.survived) {
      this.renderSurvivedEnding(width, height, state);
    } else {
      this.renderDeathEnding(width, height, data?.cause ?? 'selection');
    }
  }

  private renderSurvivedEnding(
    width: number,
    height: number,
    state: ReturnType<typeof useGameStore.getState>
  ) {
    const endingType = this.morality.getEndingType();
    const endings = dialogueData.endings as Record<string, { title: string; text: string }>;

    const endingKey = `liberation_${endingType}`;
    const ending = endings[endingKey] ?? endings['liberation_witness'];

    // Title
    this.add
      .text(width / 2, height * 0.06, 'January 27, 1945', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#6b7a8b',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.12, ending.title, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#d4c9b0',
      })
      .setOrigin(0.5);

    // Main text
    this.add
      .text(width / 2, height * 0.22, ending.text, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#b4a990',
        align: 'center',
        wordWrap: { width: width - 30 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0);

    // Dissociation reveal
    const dissociationNarrative = this.morality.getDissociationNarrative();
    const dissociationValue = this.morality.getDissociation();

    this.add.rectangle(width / 2, height * 0.65, width - 20, 1, 0x3a3a3a);

    this.add
      .text(width / 2, height * 0.67, 'The hidden measure', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#5a4a6a',
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.71,
        `Dissociation: ${dissociationValue}%\n\n${dissociationNarrative}`,
        {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#7a6a8a',
          align: 'center',
          wordWrap: { width: width - 30 },
          lineSpacing: 4,
        }
      )
      .setOrigin(0.5, 0);

    // Stats summary
    this.add
      .text(
        width / 2,
        height * 0.83,
        [
          `Days survived: ${state.day}`,
          `Acts of compliance: ${this.morality.getComplianceActs()}`,
          `Acts of resistance: ${this.morality.getResistanceActs()}`,
          state.revolted ? 'Participated in October 7 revolt' : '',
        ]
          .filter(Boolean)
          .join('\n'),
        {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#5a5a5a',
          align: 'center',
          lineSpacing: 3,
        }
      )
      .setOrigin(0.5, 0);

    this.addPlayAgainButton(width, height);
  }

  private renderDeathEnding(width: number, height: number, cause: string) {
    const endings = dialogueData.endings as Record<string, { title: string; text: string }>;
    const endingKey = `death_${cause}`;
    const ending = endings[endingKey] ?? endings['death_selection'];

    this.add
      .text(width / 2, height * 0.08, ending.title, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#8b3a3a',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.18, ending.text, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#9a8a80',
        align: 'center',
        wordWrap: { width: width - 30 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0);

    const state = useGameStore.getState();
    this.add
      .text(width / 2, height * 0.62, `You survived ${state.day} days.`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#5a5a5a',
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.69,
        'Of approximately 2,200 Sonderkommando\nwho served at Auschwitz-Birkenau,\napproximately 110 survived the war.',
        {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#4a4a4a',
          align: 'center',
          lineSpacing: 4,
        }
      )
      .setOrigin(0.5);

    this.addPlayAgainButton(width, height);
  }

  private addPlayAgainButton(width: number, height: number) {
    const bg = this.add
      .rectangle(width / 2, height * 0.92, 180, 38, 0x2a2a2a)
      .setInteractive({ cursor: 'pointer' });
    const label = this.add
      .text(width / 2, height * 0.92, 'Begin Again', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#7a7060',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => { bg.setFillStyle(0x3a3a3a); label.setColor('#d4c9b0'); });
    bg.on('pointerout', () => { bg.setFillStyle(0x2a2a2a); label.setColor('#7a7060'); });
    bg.on('pointerdown', () => {
      useGameStore.getState().resetGame();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MAIN_MENU);
      });
    });
  }
}
