import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { CharacterType } from '../types/CharacterType';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedChapter: number = 1;
  private characterFrames: Record<CharacterType, string[]> = {} as Record<CharacterType, string[]>;
  
  constructor() {
    super({ key: SceneKeys.CHARACTER_SELECT });
  }
  
  init(data: any) {
    // ì´ì  ì¬ìì ì ë¬ë°ì ì±í° ì ë³´
    this.selectedChapter = data.chapter || 1;
  }
  
  create() {
    // ì¬ ë³ê²½ ì´ë²¤í¸ ë°ì
    gameEvents.emit('scene-changed', SceneKeys.CHARACTER_SELECT);
    
    console.log('CharacterSelectScene: create started');
    
    // íì¤ì² ë¡ë íì¸
    this.checkTextures();
    
    // ë°°ê²½ ì¤ì 
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033);
    bg.setOrigin(0, 0);
    
    // íì´í íì¤í¸
    const titleText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.15,
      'ìºë¦­í° ì í',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    titleText.setOrigin(0.5);
    
    // ì íí ì±í° íì
    const chapterText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.25,
      `ì íí ì±í°: ${this.selectedChapter}`,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffff00'
      }
    );
    chapterText.setOrigin(0.5);
    
    // ìºë¦­í° íë ì ì ë³´ ê°ì ¸ì¤ê¸°
    this.prepareCharacterFrames();
    
    // ìºë¦­í° ì¹´ë ìì±
    this.createCharacterCard(
      this.cameras.main.centerX - 250,
      this.cameras.main.centerY + 30,
      CharacterType.WARRIOR,
      'ì ì¬',
      'ê·¼ì  ê³µê²© ì ë¬¸ê°',
      'ì²´ë ¥: ëì\nê³µê²©ë ¥: ì¤ê°\nìë: ë®ì'
    );
    
    this.createCharacterCard(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 30,
      CharacterType.MAGE,
      'ë§ë²ì¬',
      'ìê±°ë¦¬ ê³µê²© ì ë¬¸ê°',
      'ì²´ë ¥: ë®ì\nê³µê²©ë ¥: ëì\nìë: ì¤ê°'
    );
    
    this.createCharacterCard(
      this.cameras.main.centerX + 250,
      this.cameras.main.centerY + 30,
      CharacterType.ARCHER,
      'ê¶ì',
      'ë¹ ë¥¸ ê³µê²© ì ë¬¸ê°',
      'ì²´ë ¥: ì¤ê°\nê³µê²©ë ¥: ì¤ê°\nìë: ëì'
    );
    
    // ë¤ë¡ ê°ê¸° ë²í¼ - ButtonFactory ì¬ì©
    ButtonFactory.createButton(
      this,
      100,
      this.cameras.main.height - 50,
      'btn-red',
      'ë¤ë¡',
      () => {
        this.scene.start(SceneKeys.CHAPTER_SELECT);
      },
      150,
      50
    );
    
    console.log('CharacterSelectScene: create completed');
  }
  
  // íì¤ì² ë¡ë íì¸
  checkTextures() {
    console.log('CharacterSelectScene - Checking textures:');
    console.log('- frame:', this.textures.exists('frame'));
    console.log('- btn-red:', this.textures.exists('btn-red'));
    console.log('- btn-blue:', this.textures.exists('btn-blue'));
    console.log('- characters:', this.textures.exists('characters'));
    
    // íì¤ì²ê° ìë ê²½ì° í´ë°± ìì±
    if (!this.textures.exists('frame')) {
      this.createFallbackFrame();
    }
    
    if (!this.textures.exists('btn-red')) {
      this.createFallbackButton('btn-red', 0xe74c3c);
    }
    
    if (!this.textures.exists('btn-blue')) {
      this.createFallbackButton('btn-blue', 0x3498db);
    }
  }
  
  // í´ë°± íë ì ìì±
  createFallbackFrame() {
    console.log('Creating fallback frame');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // íë ì ë°°ê²½
    graphics.fillStyle(0x333333, 0.8);
    graphics.fillRoundedRect(0, 0, 200, 300, 10);
    
    // íë ì íëë¦¬
    graphics.lineStyle(4, 0x666666, 1);
    graphics.strokeRoundedRect(0, 0, 200, 300, 10);
    
    // íì¤ì² ìì±
    graphics.generateTexture('frame', 200, 300);
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
  
  // ìºë¦­í° íë ì ì ë³´ ì¤ë¹
  prepareCharacterFrames() {
    if (this.textures.exists('characters')) {
      const frames = this.textures.get('characters').getFrameNames();
      
      // ê° ìºë¦­í° íìë³ë¡ íë ì íí°ë§
      Object.values(CharacterType).forEach(type => {
        this.characterFrames[type] = frames.filter(frame => frame.includes(`cha_${type}_`));
      });
      
      console.log('Character frames prepared:', this.characterFrames);
    } else {
      console.error('Characters texture not loaded in CharacterSelectScene');
    }
  }
  
  createCharacterCard(x: number, y: number, characterType: CharacterType, title: string, description: string, stats: string) {
    // íë ì ë°°ê²½
    const frame = this.add.image(x, y, 'frame');
    frame.setDisplaySize(200, 300);
    frame.setTint(0x888888);
    
    // ìºë¦­í° íë¦¬ë·° ì´ë¯¸ì§ (ì¤íë¼ì´í¸ ìíë¼ì¤ìì)
    let characterImage;
    
    if (this.characterFrames[characterType] && this.characterFrames[characterType].length > 0) {
      // ì¤íë¼ì´í¸ ìíë¼ì¤ìì ì²« ë²ì§¸ íë ì ì¬ì©
      characterImage = this.add.image(x, y - 70, 'characters', this.characterFrames[characterType][0]);
      characterImage.setDisplaySize(160, 160);
      
      // ì ëë©ì´ì ì¤ì 
      const animKey = `${characterType}_select`;
      
      if (!this.anims.exists(animKey) && this.characterFrames[characterType].length >= 2) {
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNames('characters', {
            frames: this.characterFrames[characterType].slice(0, Math.min(4, this.characterFrames[characterType].length))
          }),
          frameRate: 8,
          repeat: -1
        });
        
        // ì¤íë¼ì´í¸ë¡ ë³ííì¬ ì ëë©ì´ì ì¬ì
        characterImage.destroy();
        characterImage = this.add.sprite(x, y - 70, 'characters', this.characterFrames[characterType][0]);
        characterImage.setDisplaySize(160, 160);
        characterImage.play(animKey);
      }
    } else {
      // í´ë°±: ìì ìë ì¬ê°íì¼ë¡ íì
      characterImage = this.add.rectangle(x, y - 70, 160, 160, this.getColorForCharacter(characterType));
    }
    
    // ìºë¦­í° ì´ë¦
    const titleText = this.add.text(
      x,
      y + 30,
      title,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    titleText.setOrigin(0.5);
    
    // ìºë¦­í° ì¤ëª
    const descText = this.add.text(
      x,
      y + 60,
      description,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#cccccc',
        align: 'center'
      }
    );
    descText.setOrigin(0.5);
    
    // ìºë¦­í° ì¤í¯
    const statsText = this.add.text(
      x,
      y + 100,
      stats,
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        align: 'center'
      }
    );
    statsText.setOrigin(0.5);
    
    // ì í ë²í¼
    const selectButton = ButtonFactory.createButton(
      this,
      x,
      y + 140,
      'btn-blue',
      'ì í',
      () => {
        // ê²ì ìì - ì íí ì±í°ì ìºë¦­í° ì ë³´ ì ë¬
        this.scene.start(SceneKeys.MAIN, { 
          chapter: this.selectedChapter,
          character: characterType
        });
      },
      120,
      40,
      '16px'
    );
    
    // ì ì²´ ì¹´ëë¥¼ ì¸í°ëí°ë¸íê² ë§ë¤ê¸°
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      // ê²ì ìì - ì íí ì±í°ì ìºë¦­í° ì ë³´ ì ë¬
      this.scene.start(SceneKeys.MAIN, { 
        chapter: this.selectedChapter,
        character: characterType
      });
    });
    
    // í¸ë² í¨ê³¼
    frame.on('pointerover', () => {
      frame.setTint(0xaaaaaa);
    });
    
    frame.on('pointerout', () => {
      frame.setTint(0x888888);
    });
    
    return frame;
  }
  
  // ìºë¦­í° íìì ë°ë¥¸ ìì ë°í (í´ë°±ì©)
  getColorForCharacter(type: CharacterType): number {
    switch (type) {
      case CharacterType.WARRIOR:
        return 0xff0000;
      case CharacterType.MAGE:
        return 0x0000ff;
      case CharacterType.ARCHER:
        return 0x00ff00;
      case CharacterType.PRIEST:
        return 0xffff00;
      case CharacterType.GHOST:
        return 0xaaaaaa;
      default:
        return 0xffffff;
    }
  }
}
