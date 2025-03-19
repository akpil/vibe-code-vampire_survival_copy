import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { ButtonFactory } from '../utils/ButtonFactory';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.PAUSE });
  }

  create() {
    console.log('PauseScene created');
    
    // Semi-transparent background overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    
    // Pause title
    const pauseTitle = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      'Paused',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    pauseTitle.setOrigin(0.5);
    
    // Resume button
    ButtonFactory.createButton(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'btn-green',
      'Resume',
      () => {
        console.log('Resume button clicked');
        this.resumeGame();
      },
      180,
      60,
      '20px',
      100
    );
    
    // Title button
    ButtonFactory.createButton(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'btn-red',
      'Main Menu',
      () => {
        console.log('Title button clicked');
        this.returnToTitle();
      },
      180,
      60,
      '20px',
      100
    );
    
    // ESC key handling
    this.input.keyboard.on('keydown-ESC', () => {
      this.resumeGame();
    });
    
    console.log('PauseScene setup completed');
  }
  
  resumeGame() {
    // Resume main scene
    this.scene.resume(SceneKeys.MAIN);
    // Hide pause scene
    this.scene.stop();
  }
  
  returnToTitle() {
    // Stop main scene
    this.scene.stop(SceneKeys.MAIN);
    // Stop pause scene
    this.scene.stop();
    // Go to title scene
    this.scene.start(SceneKeys.TITLE);
  }
}
