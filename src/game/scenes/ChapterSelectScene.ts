import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class ChapterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.CHAPTER_SELECT });
  }

  preload() {
    // ì±í° ì¸ë¤ì¼ ì´ë¯¸ì§ ë¡ë
    this.load.image('chapter-1', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_01.png');
    this.load.image('chapter-2', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_02.png');
    this.load.image('chapter-3', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_03.png');
  }

  create() {
    // ì¬ ë³ê²½ ì´ë²¤í¸ ë°ì
    gameEvents.emit('scene-changed', SceneKeys.CHAPTER_SELECT);
    
    // ë°°ê²½ ì¤ì 
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033);
    bg.setOrigin(0, 0);
    
    // íì´í íì¤í¸
    const titleText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.15,
      'ì±í° ì í',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    titleText.setOrigin(0.5);
    
    // ì±í° ë²í¼ ìì± - íë¦¬ë·° ì´ë¯¸ì§ í¬í¨
    this.createChapterCard(
      this.cameras.main.centerX - 250,
      this.cameras.main.centerY,
      'chapter-1',
      'ì±í° 1',
      'ì´ê¸',
      'ê¸°ë³¸ ëì´ëì ì ë¤ê³¼ ì¸ì°ì¸ì.',
      1
    );
    
    this.createChapterCard(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'chapter-2',
      'ì±í° 2',
      'ì¤ê¸',
      'ë ë§ì ì ë¤ì´ ë±ì¥í©ëë¤.',
      2
    );
    
    this.createChapterCard(
      this.cameras.main.centerX + 250,
      this.cameras.main.centerY,
      'chapter-3',
      'ì±í° 3',
      'ê³ ê¸',
      'ê°ë ¥í ë³´ì¤ì ë§ì ì¸ì°ì¸ì.',
      3
    );
    
    // ë¤ë¡ ê°ê¸° ë²í¼ - ButtonFactory ì¬ì©
    ButtonFactory.createButton(
      this,
      100,
      this.cameras.main.height - 50,
      'btn-red',
      'ë¤ë¡',
      () => {
        this.scene.start(SceneKeys.TITLE);
      },
      150,
      50
    );
  }
  
  createChapterCard(x: number, y: number, imageKey: string, title: string, difficulty: string, description: string, chapterNumber: number) {
    // íë ì ë°°ê²½
    const frame = this.add.image(x, y, 'frame');
    frame.setDisplaySize(200, 280);
    frame.setTint(0x888888);
    
    // ì±í° ì¸ë¤ì¼ ì´ë¯¸ì§
    const thumbnail = this.add.image(x, y - 50, imageKey);
    thumbnail.setDisplaySize(180, 120);
    
    // ì±í° ì ëª©
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
    
    // ëì´ë íì
    const difficultyText = this.add.text(
      x,
      y + 60,
      difficulty,
      {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffff00'
      }
    );
    difficultyText.setOrigin(0.5);
    
    // ì¤ëª íì¤í¸
    const descText = this.add.text(
      x,
      y + 90,
      description,
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: 180 }
      }
    );
    descText.setOrigin(0.5);
    
    // ì í ë²í¼
    const selectButton = ButtonFactory.createButton(
      this,
      x,
      y + 130,
      'btn-blue',
      'ì í',
      () => {
        // ìºë¦­í° ì í íë©´ì¼ë¡ ì´ëíë©´ì ì íí ì±í° ì ë³´ ì ë¬
        this.scene.start(SceneKeys.CHARACTER_SELECT, { chapter: chapterNumber });
      },
      120,
      40,
      '16px'
    );
    
    // ì ì²´ ì¹´ëë¥¼ ì¸í°ëí°ë¸íê² ë§ë¤ê¸°
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      // ìºë¦­í° ì í íë©´ì¼ë¡ ì´ëíë©´ì ì íí ì±í° ì ë³´ ì ë¬
      this.scene.start(SceneKeys.CHARACTER_SELECT, { chapter: chapterNumber });
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
}
