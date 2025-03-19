import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.TITLE });
  }

  create() {
    // Emit scene change event
    gameEvents.emit('scene-changed', SceneKeys.TITLE);
    
    console.log('TitleScene: create started');
    
    // Check texture loading
    this.checkTextures();
    
    // Add background image
    const bg = this.add.image(0, 0, 'bg-title');
    bg.setOrigin(0, 0);
    
    // Scale background image to fit screen
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    
    // Add game title text
    const titleText = this.add.text(
      this.cameras.main.centerX, 
      this.cameras.main.height * 0.3, 
      'Vampire Survival', 
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '64px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 8 }
      }
    );
    titleText.setOrigin(0.5);
    
    // Add start button - using ButtonFactory
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.6,
      'btn-blue',
      'Start Game',
      () => {
        this.scene.start(SceneKeys.CHAPTER_SELECT);
      }
    );
    
    // Add settings button - using ButtonFactory
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.7,
      'btn-green',
      'Settings',
      () => {
        // Settings feature (not implemented)
        console.log('Settings button clicked');
      }
    );
    
    // Add exit button - using ButtonFactory
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.8,
      'btn-red',
      'Exit',
      () => {
        // In browser games, we can't really exit, so show a warning
        alert('Exit function is limited in browser games.');
      }
    );
    
    // Display version info
    const versionText = this.add.text(
      10, 
      this.cameras.main.height - 30, 
      'Version 1.0.0', 
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    
    console.log('TitleScene: create completed');
  }
  
  // Check texture loading
  checkTextures() {
    console.log('TitleScene - Checking textures:');
    console.log('- bg-title:', this.textures.exists('bg-title'));
    console.log('- btn-blue:', this.textures.exists('btn-blue'));
    console.log('- btn-green:', this.textures.exists('btn-green'));
    console.log('- btn-red:', this.textures.exists('btn-red'));
    
    // Create fallback textures if needed
    if (!this.textures.exists('bg-title')) {
      this.createFallbackBackground();
    }
    
    if (!this.textures.exists('btn-blue')) {
      this.createFallbackButton('btn-blue', 0x3498db);
    }
    
    if (!this.textures.exists('btn-green')) {
      this.createFallbackButton('btn-green', 0x2ecc71);
    }
    
    if (!this.textures.exists('btn-red')) {
      this.createFallbackButton('btn-red', 0xe74c3c);
    }
  }
  
  // Create fallback background
  createFallbackBackground() {
    console.log('Creating fallback background');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Gradient background
    const width = 800;
    const height = 600;
    
    graphics.fillGradientStyle(0x000033, 0x000033, 0x000066, 0x000066, 1);
    graphics.fillRect(0, 0, width, height);
    
    // Add stars
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      
      graphics.fillStyle(0xffffff, Math.random() * 0.5 + 0.5);
      graphics.fillCircle(x, y, size);
    }
    
    // Generate texture
    graphics.generateTexture('bg-title', width, height);
    graphics.destroy();
  }
  
  // Create fallback button
  createFallbackButton(key: string, color: number) {
    console.log(`Creating fallback button: ${key}`);
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Button background
    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, 180, 60, 10);
    
    // Button border
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRoundedRect(0, 0, 180, 60, 10);
    
    // Generate texture
    graphics.generateTexture(key, 180, 60);
    graphics.destroy();
  }
}
