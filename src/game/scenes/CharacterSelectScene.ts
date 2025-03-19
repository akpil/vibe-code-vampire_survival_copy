import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { CharacterType } from '../types/CharacterType';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedChapter: number = 1;
  private characterFrames: Record<CharacterType, string[]> = {} as Record<CharacterType, string[]>;
  private alternativeSprites: Record<CharacterType, string | null> = {} as Record<CharacterType, string | null>;
  
  constructor() {
    super({ key: SceneKeys.CHARACTER_SELECT });
  }
  
  init(data: any) {
    // Get chapter info from previous scene
    this.selectedChapter = data.chapter || 1;
  }
  
  create() {
    // Emit scene change event
    gameEvents.emit('scene-changed', SceneKeys.CHARACTER_SELECT);
    
    console.log('CharacterSelectScene: create started');
    
    // Check texture loading
    this.checkTextures();
    
    // Set background
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033);
    bg.setOrigin(0, 0);
    
    // Title text
    const titleText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.15,
      'Select Character',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    titleText.setOrigin(0.5);
    
    // Selected chapter display
    const chapterText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.25,
      `Selected Chapter: ${this.selectedChapter}`,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffff00'
      }
    );
    chapterText.setOrigin(0.5);
    
    // Get character frame info
    this.prepareCharacterFrames();
    
    // Create character cards
    this.createCharacterCard(
      this.cameras.main.centerX - 250,
      this.cameras.main.centerY + 30,
      CharacterType.WARRIOR,
      'Warrior',
      'Melee Combat Specialist',
      'Health: High\nAttack: Medium\nSpeed: Low'
    );
    
    this.createCharacterCard(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 30,
      CharacterType.MAGE,
      'Mage',
      'Ranged Attack Specialist',
      'Health: Low\nAttack: High\nSpeed: Medium'
    );
    
    // Adjust priest title and description based on actual sprite used
    const priestAlternative = this.alternativeSprites[CharacterType.PRIEST];
    let priestTitle = 'Priest';
    let priestDesc = 'Healing Specialist';
    let priestStats = 'Health: Medium\nAttack: Medium\nSpeed: Medium';
    
    if (priestAlternative === 'monk') {
      priestTitle = 'Monk';
      priestDesc = 'Balanced Combat Skills';
      priestStats = 'Health: Medium\nAttack: Medium\nSpeed: Medium';
    } else if (priestAlternative === 'knight') {
      priestTitle = 'Knight';
      priestDesc = 'Defense Specialist';
      priestStats = 'Health: High\nAttack: Medium\nSpeed: Low';
    }
    
    this.createCharacterCard(
      this.cameras.main.centerX + 250,
      this.cameras.main.centerY + 30,
      CharacterType.PRIEST,
      priestTitle,
      priestDesc,
      priestStats
    );
    
    // Back button - using ButtonFactory
    ButtonFactory.createButton(
      this,
      100,
      this.cameras.main.height - 50,
      'btn-red',
      'Back',
      () => {
        this.scene.start(SceneKeys.CHAPTER_SELECT);
      },
      150,
      50
    );
    
    console.log('CharacterSelectScene: create completed');
  }
  
  // Check texture loading
  checkTextures() {
    console.log('CharacterSelectScene - Checking textures:');
    console.log('- frame:', this.textures.exists('frame'));
    console.log('- btn-red:', this.textures.exists('btn-red'));
    console.log('- btn-blue:', this.textures.exists('btn-blue'));
    console.log('- characters:', this.textures.exists('characters'));
    
    // Create fallback textures if needed
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
  
  // Create fallback frame
  createFallbackFrame() {
    console.log('Creating fallback frame');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Frame background
    graphics.fillStyle(0x333333, 0.8);
    graphics.fillRoundedRect(0, 0, 200, 300, 10);
    
    // Frame border
    graphics.lineStyle(4, 0x666666, 1);
    graphics.strokeRoundedRect(0, 0, 200, 300, 10);
    
    // Generate texture
    graphics.generateTexture('frame', 200, 300);
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
  
  // Prepare character frame info
  prepareCharacterFrames() {
    if (this.textures.exists('characters')) {
      const frames = this.textures.get('characters').getFrameNames();
      
      // Filter frames for each character type
      Object.values(CharacterType).forEach(type => {
        // Set default frames
        const typePrefix = `cha_${type}_`;
        this.characterFrames[type] = frames.filter(frame => frame.includes(typePrefix));
        this.alternativeSprites[type] = null;
        
        // Check for alternative sprites for priest character
        if (type === CharacterType.PRIEST && this.characterFrames[type].length === 0) {
          // Try using 'monk' sprite for priest character
          const monkFrames = frames.filter(frame => frame.includes('cha_monk_'));
          if (monkFrames.length > 0) {
            this.characterFrames[type] = monkFrames;
            this.alternativeSprites[type] = 'monk';
            console.log(`Using monk sprite for priest in selection screen`);
            return;
          }
          
          // If 'monk' not available, try 'knight' sprite
          const knightFrames = frames.filter(frame => frame.includes('cha_knight_'));
          if (knightFrames.length > 0) {
            this.characterFrames[type] = knightFrames;
            this.alternativeSprites[type] = 'knight';
            console.log(`Using knight sprite for priest in selection screen`);
            return;
          }
        }
      });
      
      console.log('Character frames prepared:', this.characterFrames);
      console.log('Alternative sprites:', this.alternativeSprites);
    } else {
      console.error('Characters texture not loaded in CharacterSelectScene');
    }
  }
  
  createCharacterCard(x: number, y: number, characterType: CharacterType, title: string, description: string, stats: string) {
    // Frame background
    const frame = this.add.image(x, y, 'frame');
    frame.setDisplaySize(200, 300);
    frame.setTint(0x888888);
    
    // Character preview image (from sprite atlas)
    let characterImage;
    
    if (this.characterFrames[characterType] && this.characterFrames[characterType].length > 0) {
      // Use first frame from sprite atlas
      characterImage = this.add.image(x, y - 70, 'characters', this.characterFrames[characterType][0]);
      characterImage.setDisplaySize(160, 160);
      
      // Set up animation
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
        
        // Convert to sprite and play animation
        characterImage.destroy();
        characterImage = this.add.sprite(x, y - 70, 'characters', this.characterFrames[characterType][0]);
        characterImage.setDisplaySize(160, 160);
        characterImage.play(animKey);
      }
    } else {
      // Fallback: colored rectangle
      characterImage = this.add.rectangle(x, y - 70, 160, 160, this.getColorForCharacter(characterType));
    }
    
    // Character name
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
    
    // Character description
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
    
    // Character stats
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
    
    // Select button
    const selectButton = ButtonFactory.createButton(
      this,
      x,
      y + 140,
      'btn-blue',
      'Select',
      () => {
        // Start game - pass selected chapter and character info
        this.scene.start(SceneKeys.MAIN, { 
          chapter: this.selectedChapter,
          character: characterType
        });
      },
      120,
      40,
      '16px'
    );
    
    // Make the entire card interactive
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      // Start game - pass selected chapter and character info
      this.scene.start(SceneKeys.MAIN, { 
        chapter: this.selectedChapter,
        character: characterType
      });
    });
    
    // Hover effects
    frame.on('pointerover', () => {
      frame.setTint(0xaaaaaa);
    });
    
    frame.on('pointerout', () => {
      frame.setTint(0x888888);
    });
    
    return frame;
  }
  
  // Get color for character type (for fallback)
  getColorForCharacter(type: CharacterType): number {
    switch (type) {
      case CharacterType.WARRIOR:
        return 0xff0000;
      case CharacterType.MAGE:
        return 0x0000ff;
      case CharacterType.PRIEST:
        return 0xffff00;
      case CharacterType.GHOST:
        return 0xaaaaaa;
      default:
        return 0xffffff;
    }
  }
}
