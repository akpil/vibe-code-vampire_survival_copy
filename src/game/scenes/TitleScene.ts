import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.TITLE });
  }

  create() {
    // ì¬ ë³ê²½ ì´ë²¤í¸ ë°ì
    gameEvents.emit('scene-changed', SceneKeys.TITLE);
    
    console.log('TitleScene: create started');
    
    // íì¤ì² ë¡ë íì¸
    this.checkTextures();
    
    // ë°°ê²½ ì´ë¯¸ì§ ì¶ê°
    const bg = this.add.image(0, 0, 'bg-title');
    bg.setOrigin(0, 0);
    
    // íë©´ í¬ê¸°ì ë§ê² ë°°ê²½ ì´ë¯¸ì§ ì¤ì¼ì¼ ì¡°ì 
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    
    // ê²ì íì´í íì¤í¸ ì¶ê°
    const titleText = this.add.text(
      this.cameras.main.centerX, 
      this.cameras.main.height * 0.3, 
      'Vampire Survival', 
      {
        fontFamily: 'Arial',
        fontSize: '64px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 8 }
      }
    );
    titleText.setOrigin(0.5);
    
    // ìì ë²í¼ ì¶ê° - ButtonFactory ì¬ì©
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.6,
      'btn-blue',
      'ê²ì ìì',
      () => {
        this.scene.start(SceneKeys.CHAPTER_SELECT);
      }
    );
    
    // ì¤ì  ë²í¼ ì¶ê° - ButtonFactory ì¬ì©
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.7,
      'btn-green',
      'ì¤ì ',
      () => {
        // ì¤ì  ê¸°ë¥ (ë¯¸êµ¬í)
        console.log('Settings button clicked');
      }
    );
    
    // ì¢ë£ ë²í¼ ì¶ê° - ButtonFactory ì¬ì©
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.8,
      'btn-red',
      'ì¢ë£',
      () => {
        // ë¸ë¼ì°ì ììë ì¤ì ë¡ ê²ìì ì¢ë£í  ì ìì¼ë¯ë¡ ê²½ê³  íì
        alert('ë¸ë¼ì°ì  ê²ìììë ì¢ë£ ê¸°ë¥ì´ ì íë©ëë¤.');
      }
    );
    
    // ë²ì  ì ë³´ íì
    const versionText = this.add.text(
      10, 
      this.cameras.main.height - 30, 
      'Version 1.0.0', 
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    
    console.log('TitleScene: create completed');
  }
  
  // íì¤ì² ë¡ë íì¸
  checkTextures() {
    console.log('TitleScene - Checking textures:');
    console.log('- bg-title:', this.textures.exists('bg-title'));
    console.log('- btn-blue:', this.textures.exists('btn-blue'));
    console.log('- btn-green:', this.textures.exists('btn-green'));
    console.log('- btn-red:', this.textures.exists('btn-red'));
    
    // íì¤ì²ê° ìë ê²½ì° í´ë°± ìì±
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
  
  // í´ë°± ë°°ê²½ ìì±
  createFallbackBackground() {
    console.log('Creating fallback background');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // ê·¸ë¼ë°ì´ì ë°°ê²½
    const width = 800;
    const height = 600;
    
    graphics.fillGradientStyle(0x000033, 0x000033, 0x000066, 0x000066, 1);
    graphics.fillRect(0, 0, width, height);
    
    // ë³ ì¶ê°
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      
      graphics.fillStyle(0xffffff, Math.random() * 0.5 + 0.5);
      graphics.fillCircle(x, y, size);
    }
    
    // íì¤ì² ìì±
    graphics.generateTexture('bg-title', width, height);
    graphics.destroy();
  }
  
  // í´ë°± ë²í¼ ìì±
  createFallbackButton(key: string, color: number) {
    console.log(`Creating fallback button: ${key}`);
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // ë²í¼ ë°°ê²½
    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, 180, 60, 10);
    
    // ë²í¼ íëë¦¬
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRoundedRect(0, 0, 180, 60, 10);
    
    // íì¤ì² ìì±
    graphics.generateTexture(key, 180, 60);
    graphics.destroy();
  }
}
