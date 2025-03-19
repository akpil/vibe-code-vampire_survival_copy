import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class ChapterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.CHAPTER_SELECT });
  }

  preload() {
    // 챕터 썸네일 이미지 로드
    this.load.image('chapter-1', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_01.png');
    this.load.image('chapter-2', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_02.png');
    this.load.image('chapter-3', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/thumbnail_chapter/chapter_03.png');
  }

  create() {
    // 씬 변경 이벤트 발생
    gameEvents.emit('scene-changed', SceneKeys.CHAPTER_SELECT);
    
    // 배경 설정
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033);
    bg.setOrigin(0, 0);
    
    // 타이틀 텍스트
    const titleText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.15,
      '챕터 선택',
      {
        fontFamily: 'Arial, Malgun Gothic, 맑은 고딕, Dotum, 돋움, sans-serif',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    titleText.setOrigin(0.5);
    
    // 챕터 버튼 생성 - 프리뷰 이미지 포함
    this.createChapterCard(
      this.cameras.main.centerX - 250,
      this.cameras.main.centerY,
      'chapter-1',
      '챕터 1',
      '초급',
      '기본 난이도의 적들과 싸우세요.',
      1
    );
    
    this.createChapterCard(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'chapter-2',
      '챕터 2',
      '중급',
      '더 많은 적들이 등장합니다.',
      2
    );
    
    this.createChapterCard(
      this.cameras.main.centerX + 250,
      this.cameras.main.centerY,
      'chapter-3',
      '챕터 3',
      '고급',
      '강력한 보스와 맞서 싸우세요.',
      3
    );
    
    // 뒤로 가기 버튼 - ButtonFactory 사용
    ButtonFactory.createButton(
      this,
      100,
      this.cameras.main.height - 50,
      'btn-red',
      '뒤로',
      () => {
        this.scene.start(SceneKeys.TITLE);
      },
      150,
      50
    );
  }
  
  createChapterCard(x: number, y: number, imageKey: string, title: string, difficulty: string, description: string, chapterNumber: number) {
    // 프레임 배경
    const frame = this.add.rectangle(x, y, 200, 280, 0x333333, 0.8);
    frame.setStrokeStyle(2, 0x888888);
    
    // 챕터 썸네일 이미지
    const thumbnail = this.add.image(x, y - 50, imageKey);
    thumbnail.setDisplaySize(180, 120);
    
    // 챕터 제목
    const titleText = this.add.text(
      x,
      y + 30,
      title,
      {
        fontFamily: 'Arial, Malgun Gothic, 맑은 고딕, Dotum, 돋움, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    titleText.setOrigin(0.5);
    
    // 난이도 표시
    const difficultyText = this.add.text(
      x,
      y + 60,
      difficulty,
      {
        fontFamily: 'Arial, Malgun Gothic, 맑은 고딕, Dotum, 돋움, sans-serif',
        fontSize: '18px',
        color: '#ffff00'
      }
    );
    difficultyText.setOrigin(0.5);
    
    // 설명 텍스트
    const descText = this.add.text(
      x,
      y + 90,
      description,
      {
        fontFamily: 'Arial, Malgun Gothic, 맑은 고딕, Dotum, 돋움, sans-serif',
        fontSize: '14px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: 180 }
      }
    );
    descText.setOrigin(0.5);
    
    // 선택 버튼
    const selectButton = ButtonFactory.createButton(
      this,
      x,
      y + 130,
      'btn-blue',
      '선택',
      () => {
        // 캐릭터 선택 화면으로 이동하면서 선택한 챕터 정보 전달
        this.scene.start(SceneKeys.CHARACTER_SELECT, { chapter: chapterNumber });
      },
      120,
      40,
      '16px'
    );
    
    // 전체 카드를 인터랙티브하게 만들기
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      // 캐릭터 선택 화면으로 이동하면서 선택한 챕터 정보 전달
      this.scene.start(SceneKeys.CHARACTER_SELECT, { chapter: chapterNumber });
    });
    
    // 호버 효과
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
