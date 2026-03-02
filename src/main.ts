import Phaser from 'phaser';
import { BootScene } from '@/scenes/BootScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { GameScene } from '@/scenes/GameScene';
import { UpgradeScene } from '@/scenes/UpgradeScene';
import { EndingScene } from '@/scenes/EndingScene';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '@/utils/constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.background,
  parent: document.body,
  scene: [BootScene, MainMenuScene, GameScene, UpgradeScene, EndingScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  audio: {
    disableWebAudio: false,
  },
};

new Phaser.Game(config);
