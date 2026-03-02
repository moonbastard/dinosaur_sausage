import Phaser from 'phaser';
import { SCENES, COLORS } from '@/utils/constants';
import { useGameStore } from '@/store/gameStore';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Generate pixel art assets programmatically — no external files needed for MVP
    this.createPlaceholderTextures();
  }

  create() {
    const { width, height } = this.scale;

    // Content warning screen
    this.cameras.main.setBackgroundColor(COLORS.background);

    const warningText = this.add
      .text(width / 2, height * 0.3, 'CONTENT WARNING', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#8b3a3a',
        align: 'center',
      })
      .setOrigin(0.5);

    const bodyText = this.add
      .text(
        width / 2,
        height * 0.45,
        'This game depicts the Holocaust\nwith historical accuracy.\n\nIt contains descriptions of atrocity,\nforced complicity, and the moral\ncost of survival under impossible conditions.\n\nIt is intended as interactive remembrance,\nnot entertainment.',
        {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#d4c9b0',
          align: 'center',
          lineSpacing: 6,
        }
      )
      .setOrigin(0.5);

    const continueText = this.add
      .text(width / 2, height * 0.78, '[ click or tap to continue ]', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#7a7060',
        align: 'center',
      })
      .setOrigin(0.5);

    // Blink the continue text
    this.tweens.add({
      targets: continueText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Try to load saved game
    const hasSave = useGameStore.getState().loadGame();

    this.input.once('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MAIN_MENU, { hasSave });
      });
    });

    void warningText;
    void bodyText;
  }

  private createPlaceholderTextures() {
    // Create simple pixel art textures programmatically
    // In production, these would be loaded from Aseprite exports

    // Bar fill texture (1x1 white pixel, colored via tint)
    const barGraphics = this.make.graphics({ x: 0, y: 0 });
    barGraphics.fillStyle(0xffffff);
    barGraphics.fillRect(0, 0, 1, 1);
    barGraphics.generateTexture('pixel', 1, 1);
    barGraphics.destroy();

    // Panel background
    const panelGraphics = this.make.graphics({ x: 0, y: 0 });
    panelGraphics.fillStyle(0x2a2a2a);
    panelGraphics.fillRect(0, 0, 460, 120);
    panelGraphics.lineStyle(1, 0x4a4a4a);
    panelGraphics.strokeRect(0, 0, 460, 120);
    panelGraphics.generateTexture('panel', 460, 120);
    panelGraphics.destroy();

    // Button texture
    const btnGraphics = this.make.graphics({ x: 0, y: 0 });
    btnGraphics.fillStyle(0x3a3a3a);
    btnGraphics.fillRect(0, 0, 200, 36);
    btnGraphics.lineStyle(1, 0x6a6a6a);
    btnGraphics.strokeRect(0, 0, 200, 36);
    btnGraphics.generateTexture('button', 200, 36);
    btnGraphics.destroy();

    // Prisoner figure (5x8 pixels, scaled up)
    const figureGraphics = this.make.graphics({ x: 0, y: 0 });
    // Head
    figureGraphics.fillStyle(0x9b8b6b);
    figureGraphics.fillRect(1, 0, 3, 3);
    // Body - striped uniform
    figureGraphics.fillStyle(0x8a8a8a);
    figureGraphics.fillRect(0, 3, 5, 5);
    figureGraphics.fillStyle(0x6a6a6a);
    figureGraphics.fillRect(0, 4, 5, 1);
    figureGraphics.fillRect(0, 6, 5, 1);
    figureGraphics.generateTexture('prisoner', 5, 8);
    figureGraphics.destroy();
  }
}
