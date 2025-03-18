import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { generatePlayerSprite, generateEnemySprite, generateWeaponSprite, generateGemSprite } from '../utils/spriteGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  preload() {
    console.log('BootScene: preload started');
    
    // 배경 타일 로드
    this.load.image('background-tile', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/background_tile/tile.png');
    
    // 타이틀 배경 이미지 로드
    this.load.image('bg-title', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/bg_title.png');
    
    // 버튼 이미지 로드
    this.load.image('btn-blue', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_blue.png');
    this.load.image('btn-red', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_red.png');
    this.load.image('btn-green', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_green.png');
    
    // 프레임 이미지 로드
    this.load.image('frame', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/frame/bg_frame_02.png');
    
    // 경험치 젬 아이콘 로드
    this.load.image('xp-gem', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ingame_icon/icon_exp.png');
    
    // 무기 아이콘 로드 - 프로젝타일 방식
    this.load.image('knife', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/projectile/sword.png');
    // 도끼 대신 방패 스프라이트 사용 (회전 오브젝트)
    this.load.image('axe', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/projectile/shield.png');
    this.load.image('magic', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/effectSheet/whip.png');
    
    // 캐릭터 스프라이트 아틀라스 로드 - 아틀라스 방식
    this.load.atlas(
      'characters', 
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/cha_sprite.png',
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/cha_sprite_table.json'
    );
    
    console.log('BootScene: preload completed');
  }

  create() {
    console.log('BootScene: create started');
    
    // 텍스처가 로드되지 않은 경우에만 프로그래매틱 텍스처 생성
    if (!this.textures.exists('enemy1')) {
      generateEnemySprite(this, 'enemy1', '#e74c3c');
    }
    
    if (!this.textures.exists('enemy2')) {
      generateEnemySprite(this, 'enemy2', '#e67e22');
    }
    
    if (!this.textures.exists('enemy3')) {
      generateEnemySprite(this, 'enemy3', '#9b59b6');
    }
    
    // 캐릭터 애니메이션 생성
    this.createCharacterAnimations();
    
    // 텍스처 로드 확인
    this.checkLoadedTextures();
    
    console.log('BootScene: create completed');
    
    // 타이틀 씬으로 전환
    this.scene.start(SceneKeys.TITLE);
  }
  
  checkLoadedTextures() {
    console.log('Checking loaded textures:');
    
    // characters 아틀라스 확인
    if (this.textures.exists('characters')) {
      const frames = this.textures.get('characters').getFrameNames();
      console.log('Characters atlas loaded with frames:', frames.length);
      console.log('Sample frames:', frames.slice(0, 5));
    } else {
      console.error('Characters atlas not loaded!');
    }
    
    // 배경 및 UI 텍스처 확인
    console.log('Background tile loaded:', this.textures.exists('background-tile'));
    console.log('Title background loaded:', this.textures.exists('bg-title'));
    console.log('Blue button loaded:', this.textures.exists('btn-blue'));
    console.log('Red button loaded:', this.textures.exists('btn-red'));
    console.log('Green button loaded:', this.textures.exists('btn-green'));
    console.log('Frame loaded:', this.textures.exists('frame'));
    
    // 무기 텍스처 확인
    console.log('Knife texture loaded:', this.textures.exists('knife'));
    console.log('Axe texture loaded:', this.textures.exists('axe'));
    console.log('Magic texture loaded:', this.textures.exists('magic'));
    
    // 경험치 젬 텍스처 확인
    console.log('XP Gem texture loaded:', this.textures.exists('xp-gem'));
  }
  
  createCharacterAnimations() {
    // 캐릭터 타입별 애니메이션 프레임 정의
    const characterTypes = ['warrior', 'mage', 'priest', 'ghost'];
    
    // 텍스처가 로드되었는지 확인
    if (!this.textures.exists('characters')) {
      console.error('Cannot create character animations: characters atlas not loaded');
      return;
    }
    
    const frames = this.textures.get('characters').getFrameNames();
    console.log('Available frames for animations:', frames);
    
    // 각 캐릭터 타입별로 애니메이션 생성
    characterTypes.forEach(type => {
      // 해당 타입의 프레임 필터링
      const typeFrames = frames.filter(frame => frame.includes(`cha_${type}_`));
      
      if (typeFrames.length > 0) {
        console.log(`Creating animations for ${type} with frames:`, typeFrames);
        
        // 걷기 애니메이션
        this.anims.create({
          key: `${type}_walk`,
          frames: typeFrames.map(frame => ({ key: 'characters', frame })),
          frameRate: 8,
          repeat: -1
        });
        
        // 대기 애니메이션 (첫 번째 프레임만 사용)
        this.anims.create({
          key: `${type}_idle`,
          frames: [{ key: 'characters', frame: typeFrames[0] }],
          frameRate: 1,
          repeat: 0
        });
      } else {
        console.error(`No frames found for character type: ${type}`);
      }
    });
  }
}
