import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { CharacterType } from '../types/CharacterType';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedChapter: number = 1;
  private characterFrames: Record<CharacterType, string[]> = {} as Record<CharacterType, string[]>;
  private selectedCharacter: CharacterType | null = null;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private previewContainer?: Phaser.GameObjects.Container;
  private characterStats: Record<CharacterType, { hp: number; attack: number; speed: number }> = {
    [CharacterType.WARRIOR]: { hp: 100, attack: 70, speed: 40 },
    [CharacterType.MAGE]: { hp: 50, attack: 90, speed: 60 },
    [CharacterType.ARCHER]: { hp: 70, attack: 65, speed: 85 },
    [CharacterType.PRIEST]: { hp: 60, attack: 50, speed: 55 },
    [CharacterType.GHOST]: { hp: 45, attack: 80, speed: 75 }
  };

  constructor() {
    super({ key: SceneKeys.CHARACTER_SELECT });
  }

  init(data: any) {
    this.selectedChapter = data.chapter || 1;
  }

  preload() {
    // Load additional assets
    this.load.audio('select-bg', 'assets/audio/character-select-bg.mp3');
    this.load.image('parallax-bg', 'assets/images/parallax-bg.png');
    this.load.image('glow-effect', 'assets/images/glow.png');
  }

  create() {
    gameEvents.emit('scene-changed', SceneKeys.CHARACTER_SELECT);
    
    // Add parallax background
    this.createParallaxBackground();
    
    // Add background music
    this.backgroundMusic = this.sound.add('select-bg', { loop: true, volume: 0.5 });
    this.backgroundMusic.play();

    // Enhanced UI elements
    this.createEnhancedUI();
    
    this.checkTextures();
    this.prepareCharacterFrames();
    
    // Create character cards with new characters
    const characters = [
      { type: CharacterType.WARRIOR, x: -450, title: 'Warrior', desc: 'Melee Specialist' },
      { type: CharacterType.MAGE, x: -150, title: 'Mage', desc: 'Magic Master' },
      { type: CharacterType.ARCHER, x: 150, title: 'Archer', desc: 'Ranged Expert' },
      { type: CharacterType.PRIEST, x: 450, title: 'Priest', desc: 'Support Healer' }
    ];

    characters.forEach(char => {
      this.createCharacterCard(
        this.cameras.main.centerX + char.x,
        this.cameras.main.centerY + 30,
        char.type,
        char.title,
        char.desc,
        this.getCharacterStatsText(char.type)
      );
    });

    // Add navigation buttons
    this.createNavigationButtons();
    
    // Add character preview container
    this.createPreviewContainer();
  }

  private createParallaxBackground() {
    const bg = this.add.image(0, 0, 'parallax-bg')
      .setOrigin(0)
      .setDisplaySize(this.cameras.main.width * 1.2, this.cameras.main.height);
    
    this.tweens.add({
      targets: bg,
      x: -100,
      duration: 20000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createEnhancedUI() {
    // Gradient background
    const gradient = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height)
      .setOrigin(0)
      .setInteractive();
    gradient.setFillStyle(0x000033, 0.8);
    
    // Animated title
    const title = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.15,
      'Character Selection',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#ffd700',
        strokeThickness: 6
      }
    ).setOrigin(0.5);
    
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Chapter info
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.25,
      `Selected Chapter: ${this.selectedChapter}`,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffd700'
      }
    ).setOrigin(0.5);
  }

  private createNavigationButtons() {
    ButtonFactory.createButton(
      this,
      100,
      this.cameras.main.height - 50,
      'btn-red',
      'Back',
      () => this.scene.start(SceneKeys.CHAPTER_SELECT),
      150,
      50
    );

    ButtonFactory.createButton(
      this,
      this.cameras.main.width - 100,
      this.cameras.main.height - 50,
      'btn-blue',
      'Confirm',
      () => {
        if (this.selectedCharacter) {
          this.startGame();
        } else {
          this.showWarning('Please select a character first!');
        }
      },
      150,
      50
    );
  }

  private createPreviewContainer() {
    this.previewContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY - 200);
    this.previewContainer.setVisible(false);
  }

  private updatePreview(characterType: CharacterType) {
    if (!this.previewContainer) return;
    
    this.previewContainer.removeAll(true);
    this.previewContainer.setVisible(true);

    const sprite = this.add.sprite(0, 0, 'characters', this.characterFrames[characterType][0])
      .setScale(2);
    
    const glow = this.add.image(0, 0, 'glow-effect')
      .setBlendMode('ADD')
      .setAlpha(0.5)
      .setScale(2);
    
    this.previewContainer.add([glow, sprite]);
    
    this.tweens.add({
      targets: glow,
      alpha: 0.8,
      scale: 2.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  private createCharacterCard(x: number, y: number, characterType: CharacterType, title: string, description: string, stats: string) {
    const card = this.add.container(x, y);
    const frame = this.add.image(0, 0, 'frame')
      .setDisplaySize(220, 320)
      .setInteractive({ useHandCursor: true });

    const characterImage = this.createCharacterSprite(characterType, 0, -80);
    const titleText = this.createText(0, 40, title, '24px', '#ffffff');
    const descText = this.createText(0, 70, description, '16px', '#cccccc');
    const statsText = this.createText(0, 110, stats, '14px', '#ffffff');

    const selectButton = ButtonFactory.createButton(
      this,
      0,
      150,
      'btn-blue',
      'Select',
      () => this.selectCharacter(characterType),
      120,
      40
    );

    card.add([frame, characterImage, titleText, descText, statsText, selectButton]);

    // Enhanced interactions
    frame.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        y: y - 20,
        duration: 200,
        ease: 'Power2'
      });
      this.updatePreview(characterType);
    });

    frame.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        y: y,
        duration: 200,
        ease: 'Power2'
      });
      if (this.previewContainer) this.previewContainer.setVisible(false);
    });

    frame.on('pointerdown', () => this.selectCharacter(characterType));
  }

  private createCharacterSprite(characterType: CharacterType, x: number, y: number) {
    if (this.characterFrames[characterType]?.length) {
      const sprite = this.add.sprite(x, y, 'characters', this.characterFrames[characterType][0])
        .setDisplaySize(160, 160);
      const animKey = `${characterType}_select`;
      if (this.anims.exists(animKey)) sprite.play(animKey);
      return sprite;
    }
    return this.add.rectangle(x, y, 160, 160, this.getColorForCharacter(characterType));
  }

  private createText(x: number, y: number, text: string, size: string, color: string) {
    return this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: size,
      color,
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5);
  }

  private selectCharacter(characterType: CharacterType) {
    this.selectedCharacter = characterType;
    this.sound.play('select-sound', { volume: 0.8 });
    this.showSelectionFeedback(characterType);
  }

  private showSelectionFeedback(characterType: CharacterType) {
    const feedback = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.35,
      `${characterType} Selected!`,
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#00ff00'
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      alpha: 0,
      y: this.cameras.main.height * 0.25,
      duration: 1500,
      onComplete: () => feedback.destroy()
    });
  }

  private showWarning(message: string) {
    const warning = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.35,
      message,
      {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ff4444'
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: warning,
      alpha: 0,
      duration: 2000,
      onComplete: () => warning.destroy()
    });
  }

  private getCharacterStatsText(characterType: CharacterType): string {
    const stats = this.characterStats[characterType];
    return `HP: ${stats.hp}\nAttack: ${stats.attack}\nSpeed: ${stats.speed}`;
  }

  private startGame() {
    this.backgroundMusic?.stop();
    this.scene.start(SceneKeys.MAIN, {
      chapter: this.selectedChapter,
      character: this.selectedCharacter
    });
  }

  shutdown() {
    this.backgroundMusic?.stop();
    this.tweens.killAll();
  }

  // Existing methods (checkTextures, createFallbackFrame, etc.) remain largely unchanged
  // Add your existing methods here with minor optimizations if needed
}
