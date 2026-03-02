import Phaser from 'phaser';
import { SCENES, COLORS, LIBERATION_DAY } from '@/utils/constants';
import { useGameStore } from '@/store/gameStore';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MAIN_MENU });
  }

  create(data: { hasSave?: boolean }) {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Title
    this.add
      .text(width / 2, height * 0.12, 'GasTown', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#d4c9b0',
        align: 'center',
      })
      .setOrigin(0.5);

    // Subtitle / historical framing
    this.add
      .text(
        width / 2,
        height * 0.2,
        'Auschwitz-Birkenau\nMay 15, 1944 — January 27, 1945\n257 days',
        {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#7a7060',
          align: 'center',
          lineSpacing: 4,
        }
      )
      .setOrigin(0.5);

    // Epigraph
    this.add
      .text(
        width / 2,
        height * 0.34,
        '"I was already dead. Only my body\ndid not yet know it."\n\n— Dr. Miklós Nyiszli',
        {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#6b6050',
          align: 'center',
          lineSpacing: 5,
        }
      )
      .setOrigin(0.5);

    // Buttons
    const buttonY = height * 0.55;
    const buttonSpacing = 50;

    if (data?.hasSave) {
      this.createButton(width / 2, buttonY, 'Continue', () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME);
        });
      });

      this.createButton(width / 2, buttonY + buttonSpacing, 'New Game', () => {
        useGameStore.getState().resetGame();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME);
        });
      });
    } else {
      this.createButton(width / 2, buttonY, 'Begin', () => {
        useGameStore.getState().resetGame();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME);
        });
      });
    }

    this.createButton(width / 2, buttonY + buttonSpacing * (data?.hasSave ? 2 : 1), 'About', () => {
      this.showAbout();
    });

    // Liberation counter at bottom — always visible as a beacon
    this.add
      .text(width / 2, height * 0.88, `Liberation: January 27, 1945`, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#6b7a8b',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.92, `${LIBERATION_DAY} days`, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#4a5a6a',
        align: 'center',
      })
      .setOrigin(0.5);
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.add.image(0, 0, 'button').setOrigin(0.5);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#d4c9b0',
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(200, 36);
    container.setInteractive({ cursor: 'pointer' });

    container.on('pointerover', () => {
      text.setColor('#ffffff');
      bg.setTint(0x505050);
    });
    container.on('pointerout', () => {
      text.setColor('#d4c9b0');
      bg.clearTint();
    });
    container.on('pointerdown', onClick);

    return container;
  }

  private showAbout() {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    overlay.setInteractive();

    const aboutText = this.add
      .text(
        width / 2,
        height / 2,
        [
          'About GasTown',
          '',
          'Based on the memoir of Dr. Miklós Nyiszli,',
          '"Auschwitz: A Doctor\'s Eyewitness Account"',
          '',
          'Dr. Nyiszli was a Hungarian-Jewish forensic',
          'pathologist who survived Auschwitz by serving',
          'as Dr. Josef Mengele\'s chief pathologist.',
          '',
          'He survived. He testified.',
          'His memoir was published in 1946.',
          '',
          'Of approximately 2,200 Sonderkommando,',
          'approximately 110 survived the war.',
          '',
          '[ tap to close ]',
        ].join('\n'),
        {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#d4c9b0',
          align: 'center',
          lineSpacing: 5,
        }
      )
      .setOrigin(0.5);

    overlay.once('pointerdown', () => {
      overlay.destroy();
      aboutText.destroy();
    });
  }
}
