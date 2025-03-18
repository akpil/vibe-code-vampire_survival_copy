import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { CharacterType } from '../types/CharacterType';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedChapter: number = 1;
  
  constructor() {
    super({ key: SceneKeys.CHARACTER_SELECT });
  }
  
  preload() {
    // 캐릭터 프리뷰 이미지 로드 (실제 게임에서는 스프라이트시트에서 추출)
    this.load.image('warrior-preview', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/characters/warrior_preview.png');
    this.load.image('mage-preview', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/characters/mage_preview.png');
    this.load.image('archer-preview', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/characters/archer_preview.png');
    
    // 프레임 이미지 로드
    this.load.image('frame', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/frame/bg_frame_02.png');
  }
  
  init(data: any) {
    // 이전 씬에서 전달받은 챕터 정보
    this.selectedChapter = data.chapter || 1;
  }
  
  create() {
    // 씬 변경 이벤트 발생
    gameEvents.emit('scene-changed', SceneKeys.CHARACTER_SELECT);
    
    // 배경 설정
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033);
    bg.setOrigin(0, 0);
    
    // 타이틀 텍스트
    const titleText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.15,
      '캐릭터 선택',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    titleText.setOrigin(0.5);
    
    // 선택한 챕터 표시
    const chapterText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height * 0.25,
      `선택한 챕터: ${this.selectedChapter}`,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffff00'
      }
    );
    chapterText.setOrigin(0.5);
    
    // 캐릭터 카드 생성
    this.createCharacterCard(
      this.cameras.main.centerX - 250,
      this.cameras.main.centerY + 30,
      'warrior-preview',
      '전사',
      '근접 공격 전문가',
      '체력: 높음\n공격력: 중간\n속도: 낮음',
      CharacterType.WARRIOR
    );
    
    this.createCharacterCard(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 30,
      'mage-preview',
      '마법사',
      '원거리 공격 전문가',
      '체력: 낮음\n공격력: 높음\n속도: 중간',
      CharacterType.MAGE
    );
    
    this.createCharacterCard(
      this.cameras.main.centerX + 250,
      this.cameras.main.centerY + 30,
      'archer-preview',
      '궁수',
      '빠른 공격 전문가',
      '체력: 중간\n공격력: 중간\n속도: 높음',
      CharacterType.ARCHER
    );
    
    // 뒤로 가기 버튼 - ButtonFactory 사용
    ButtonFactory.createButton(
      this,
      100,
      this.cameras.main.height - 50,
      'btn-red',
      '뒤로',
      () => {
        this.scene.start(SceneKeys.CHAPTER_SELECT);
      },
      150,
      50
    );
  }
  
  createCharacterCard(x: number, y: number, imageKey: string, title: string, description: string, stats: string, characterType: CharacterType) {
    // 프레임 배경
    const frame = this.add.image(x, y, 'frame');
    frame.setDisplaySize(200, 300);
    frame.setTint(0x888888);
    
    // 캐릭터 프리뷰 이미지
    const characterImage = this.add.image(x, y - 70, imageKey);
    characterImage.setDisplaySize(160, 160);
    
    // 캐릭터 이름
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
    
    // 캐릭터 설명
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
    
    // 캐릭터 스탯
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
    
    // 선택 버튼
    const selectButton = ButtonFactory.createButton(
      this,
      x,
      y + 140,
      'btn-blue',
      '선택',
      () => {
        // 게임 시작 - 선택한 챕터와 캐릭터 정보 전달
        this.scene.start(SceneKeys.MAIN, { 
          chapter: this.selectedChapter,
          character: characterType
        });
      },
      120,
      40,
      '16px'
    );
    
    // 전체 카드를 인터랙티브하게 만들기
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      // 게임 시작 - 선택한 챕터와 캐릭터 정보 전달
      this.scene.start(SceneKeys.MAIN, { 
        chapter: this.selectedChapter,
        character: characterType
      });
    });
    
    // 호버 효과
    frame.on('pointerover', () => {
      frame.setTint(0xaaaaaa);
    });
    
    frame.on('pointerout', () => {
      frame.setTint(0x888888);
    });
    
    return frame;
  }
}
