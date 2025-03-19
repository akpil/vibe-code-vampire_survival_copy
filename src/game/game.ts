import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { ChapterSelectScene } from './scenes/ChapterSelectScene';
import { MainScene } from './scenes/MainScene';
import { PauseScene } from './scenes/PauseScene';

export const createGame = (parent: string): Phaser.Game => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parent,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [
      BootScene,
      TitleScene,
      CharacterSelectScene,
      ChapterSelectScene,
      MainScene,
      PauseScene
    ],
    pixelArt: true,
    roundPixels: true
  };

  return new Phaser.Game(config);
};
