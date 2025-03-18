import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { ChapterSelectScene } from './scenes/ChapterSelectScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
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
      ChapterSelectScene,
      CharacterSelectScene,
      MainScene,
      PauseScene // 일시 정지 씬 추가
    ],
    pixelArt: true,
    roundPixels: true
  };

  return new Phaser.Game(config);
};
