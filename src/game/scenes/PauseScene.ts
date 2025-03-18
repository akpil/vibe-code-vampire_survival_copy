import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { ButtonFactory } from '../utils/ButtonFactory';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.PAUSE });
  }

  create() {
    console.log('PauseScene created');
    
    // ë°í¬ëª ë°°ê²½ ì¤ë²ë ì´
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    
    // ì¼ìì ì§ íì´í
    const pauseTitle = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      'ì¼ìì ì§',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    pauseTitle.setOrigin(0.5);
    
    // ê³ìíê¸° ë²í¼
    ButtonFactory.createButton(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'btn-green',
      'ê³ìíê¸°',
      () => {
        console.log('Resume button clicked');
        this.resumeGame();
      },
      180,
      60,
      '20px',
      100
    );
    
    // íì´íë¡ ë²í¼
    ButtonFactory.createButton(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'btn-red',
      'íì´íë¡',
      () => {
        console.log('Title button clicked');
        this.returnToTitle();
      },
      180,
      60,
      '20px',
      100
    );
    
    // ESC í¤ ìë ¥ ì²ë¦¬
    this.input.keyboard.on('keydown-ESC', () => {
      this.resumeGame();
    });
    
    console.log('PauseScene setup completed');
  }
  
  resumeGame() {
    // ë©ì¸ ì¬ ì¬ê°
    this.scene.resume(SceneKeys.MAIN);
    // ì¼ìì ì§ ì¬ ì¨ê¸°ê¸°
    this.scene.stop();
  }
  
  returnToTitle() {
    // ë©ì¸ ì¬ ì¤ì§
    this.scene.stop(SceneKeys.MAIN);
    // ì¼ìì ì§ ì¬ ì¤ì§
    this.scene.stop();
    // íì´í ì¬ì¼ë¡ ì´ë
    this.scene.start(SceneKeys.TITLE);
  }
}
