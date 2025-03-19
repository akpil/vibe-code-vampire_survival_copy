import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class ChapterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.CHAPTER_SELECT });
  }

  preload() {
    // Load chapter thumbnail images
    this.load.image('chapter-1', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_01.png');
    this.load.image('chapter-2', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_02.png');
    this.load.image('chapter-3', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_03.png');
  }

  create() {
    // Emit scene change event
    gameEvents.emit('scene-changed', SceneKeys.CHAPTER_SELECT);
    
    // Set background
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033);
    bg.setOrigin(0, 0);
    
    // Title text
    const titleText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.15,
      'Select Chapter',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    titleText.setOrigin(0.5);
    
    // Create chapter cards with preview images
    this.createChapterCard(
      this.cameras.main.centerX - 250,
      this.cameras.main.centerY,
      'chapter-1',
      'Chapter 1',
      'Beginner',
      'Face basic enemies and learn the game mechanics.',
      1
    );
    
    this.createChapterCard(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'chapter-2',
      'Chapter 2',
      'Intermediate',
      'More enemies will appear with increased difficulty.',
      2
    );
    
    this.createChapterCard(
      this.cameras.main.centerX + 250,
      this.cameras.main.centerY,
      'chapter-3',
      'Chapter 3',
      'Advanced',
      'Face powerful bosses and hordes of enemies.',
      3
    );
    
    // Back button - using ButtonFactory
    ButtonFactory.createButton(
      this,
      100,
      this.cameras.main.height - 50,
      'btn-red',
      'Back',
      () => {
        this.scene.start(SceneKeys.TITLE);
      },
      150,
      50
    );
  }
  
  createChapterCard(x: number, y: number, imageKey: string, title: string, difficulty: string, description: string, chapterNumber: number) {
    // Frame background
    const frame = this.add.rectangle(x, y, 200, 280, 0x333333, 0.8);
    frame.setStrokeStyle(2, 0x888888);
    
    // Chapter thumbnail image
    const thumbnail = this.add.image(x, y - 50, imageKey);
    thumbnail.setDisplaySize(180, 120);
    
    // Chapter title
    const titleText = this.add.text(
      x,
      y + 30,
      title,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    titleText.setOrigin(0.5);
    
    // Difficulty display
    const difficultyText = this.add.text(
      x,
      y + 60,
      difficulty,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#ffff00'
      }
    );
    difficultyText.setOrigin(0.5);
    
    // Description text
    const descText = this.add.text(
      x,
      y + 90,
      description,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: 180 }
      }
    );
    descText.setOrigin(0.5);
    
    // Select button
    const selectButton = ButtonFactory.createButton(
      this,
      x,
      y + 130,
      'btn-blue',
      'Select',
      () => {
        // Go to character select screen with selected chapter info
        this.scene.start(SceneKeys.CHARACTER_SELECT, { chapter: chapterNumber });
      },
      120,
      40,
      '16px'
    );
    
    // Make the entire card interactive
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      // Go to character select screen with selected chapter info
      this.scene.start(SceneKeys.CHARACTER_SELECT, { chapter: chapterNumber });
    });
    
    // Hover effects
    frame.on('pointerover', () => {
      frame.setStrokeStyle(2, 0xaaaaaa);
      frame.setFillStyle(0x444444, 0.8);
    });
    
    frame.on('pointerout', () => {
      frame.setStrokeStyle(2, 0x888888);
      frame.setFillStyle(0x333333, 0.8);
    });
    
    return frame;
  }
}
