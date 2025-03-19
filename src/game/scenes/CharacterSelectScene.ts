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
    // 이전 씬에서 전달받은 챕터 정보
    this.selectedChapter = data.chapter || 1;
  }
  
  create() {
    // 씬 변경 이벤트 발생
    gameEvents.emit('scene-changed', SceneKeys.CHARACTER_SELECT);
    
    console.log('CharacterSelectScene: create started');
    
    // 텍스처 로드 확인
    this.checkTextures();
    
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
    
    // 캐릭터 프레임 정보 가져오기
    this.prepareCharacterFrames();
    
    // 캐릭터 카드 생성
    this.createCharacterCard(
      this.cameras.main.centerX - 250,
      this.cameras.main.centerY + 30,
      CharacterType.WARRIOR,
      '전사',
      '근접 공격 전문가',
      '체력: 높음\n공격력: 중간\n속도: 낮음'
    );
    
    this.createCharacterCard(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 30,
      CharacterType.MAGE,
      '마법사',
      '원거리 공격 전문가',
      '체력: 낮음\n공격력: 높음\n속도: 중간'
    );
    
    // 성직자 대신 실제 사용되는 스프라이트에 맞게 이름과 설명 변경
    const priestAlternative = this.alternativeSprites[CharacterType.PRIEST];
    let priestTitle = '성직자';
    let priestDesc = '회복 능력 전문가';
    let priestStats = '체력: 중간\n공격력: 중간\n속도: 중간';
    
    if (priestAlternative === 'monk') {
      priestTitle = '수도사';
      priestDesc = '균형 잡힌 전투 능력';
      priestStats = '체력: 중간\n공격력: 중간\n속도: 중간';
    } else if (priestAlternative === 'knight') {
      priestTitle = '기사';
      priestDesc = '방어 능력 전문가';
      priestStats = '체력: 높음\n공격력: 중간\n속도: 낮음';
    }
    
    this.createCharacterCard(
      this.cameras.main.centerX + 250,
      this.cameras.main.centerY + 30,
      CharacterType.PRIEST,
      priestTitle,
      priestDesc,
      priestStats
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
    
    console.log('CharacterSelectScene: create completed');
  }
  
  // 텍스처 로드 확인
  checkTextures() {
    console.log('CharacterSelectScene - Checking textures:');
    console.log('- frame:', this.textures.exists('frame'));
    console.log('- btn-red:', this.textures.exists('btn-red'));
    console.log('- btn-blue:', this.textures.exists('btn-blue'));
    console.log('- characters:', this.textures.exists('characters'));
    
    // 텍스처가 없는 경우 폴백 생성
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
  
  // 폴백 프레임 생성
  createFallbackFrame() {
    console.log('Creating fallback frame');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // 프레임 배경
    graphics.fillStyle(0x333333, 0.8);
    graphics.fillRoundedRect(0, 0, 200, 300, 10);
    
    // 프레임 테두리
    graphics.lineStyle(4, 0x666666, 1);
    graphics.strokeRoundedRect(0, 0, 200, 300, 10);
    
    // 텍스처 생성
    graphics.generateTexture('frame', 200, 300);
    graphics.destroy();
  }
  
  // 폴백 버튼 생성
  createFallbackButton(key: string, color: number) {
    console.log(`Creating fallback button: ${key}`);
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // 버튼 배경
    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, 180, 60, 10);
    
    // 버튼 테두리
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRoundedRect(0, 0, 180, 60, 10);
    
    // 텍스처 생성
    graphics.generateTexture(key, 180, 60);
    graphics.destroy();
  }
  
  // 캐릭터 프레임 정보 준비
  prepareCharacterFrames() {
    if (this.textures.exists('characters')) {
      const frames = this.textures.get('characters').getFrameNames();
      
      // 각 캐릭터 타입별로 프레임 필터링
      Object.values(CharacterType).forEach(type => {
        // 기본 프레임 설정
        const typePrefix = `cha_${type}_`;
        this.characterFrames[type] = frames.filter(frame => frame.includes(typePrefix));
        this.alternativeSprites[type] = null;
        
        // 성직자 캐릭터에 대한 대체 스프라이트 확인
        if (type === CharacterType.PRIEST && this.characterFrames[type].length === 0) {
          // 'monk' 스프라이트를 성직자 캐릭터로 사용
          const monkFrames = frames.filter(frame => frame.includes('cha_monk_'));
          if (monkFrames.length > 0) {
            this.characterFrames[type] = monkFrames;
            this.alternativeSprites[type] = 'monk';
            console.log(`Using monk sprite for priest in selection screen`);
            return;
          }
          
          // 'monk'가 없으면 'knight' 스프라이트 시도
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
    // 프레임 배경
    const frame = this.add.image(x, y, 'frame');
    frame.setDisplaySize(200, 300);
    frame.setTint(0x888888);
    
    // 캐릭터 프리뷰 이미지 (스프라이트 아틀라스에서)
    let characterImage;
    
    if (this.characterFrames[characterType] && this.characterFrames[characterType].length > 0) {
      // 스프라이트 아틀라스에서 첫 번째 프레임 사용
      characterImage = this.add.image(x, y - 70, 'characters', this.characterFrames[characterType][0]);
      characterImage.setDisplaySize(160, 160);
      
      // 애니메이션 설정
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
        
        // 스프라이트로 변환하여 애니메이션 재생
        characterImage.destroy();
        characterImage = this.add.sprite(x, y - 70, 'characters', this.characterFrames[characterType][0]);
        characterImage.setDisplaySize(160, 160);
        characterImage.play(animKey);
      }
    } else {
      // 폴백: 색상 있는 사각형으로 표시
      characterImage = this.add.rectangle(x, y - 70, 160, 160, this.getColorForCharacter(characterType));
    }
    
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
  
  // 캐릭터 타입에 따른 색상 반환 (폴백용)
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
