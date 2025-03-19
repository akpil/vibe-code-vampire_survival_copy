import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  preload() {
    // 로딩 화면 표시
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: '로딩 중...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);
    
    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    assetText.setOrigin(0.5, 0.5);
    
    // 로딩 이벤트 리스너
    this.load.on('progress', (value: number) => {
      percentText.setText(parseInt((value * 100).toString()) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on('fileprogress', (file: any) => {
      assetText.setText('로딩 중: ' + file.key);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
    
    // 게임 에셋 로드
    this.loadGameAssets();
  }
  
  loadGameAssets() {
    // 타이틀 화면 배경 로드
    this.load.image('bg-title', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/bg_title.png');
    
    // 버튼 이미지 로드 - 경로 수정 (/ui/buttons/ 폴더 추가)
    this.load.image('btn-blue', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_blue.png');
    this.load.image('btn-green', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_green.png');
    this.load.image('btn-red', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_red.png');
    
    // 배경 타일 로드
    this.load.image('background-tile', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/background_tile/tile.png');
    
    // 캐릭터 스프라이트 로드
    this.load.atlas('characters', 
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/cha_sprite.png', 
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/cha_sprite_table.json'
    );
    
    // 적 스프라이트 로드
    this.load.image('enemy1', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/enemy/enemy1.png');
    this.load.image('enemy2', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/enemy/enemy2.png');
    this.load.image('enemy3', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/enemy/enemy3.png');
    
    // 무기 스프라이트 로드
    this.load.image('shield', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/projectile/shield.png');
    this.load.image('knife', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/projectile/sword.png');
    this.load.image('arrow', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/projectile/arrow.png');
    this.load.spritesheet('whip', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/effectSheet/whip.png', {
      frameWidth: 65,
      frameHeight: 27
    });
    
    // XP 젬 스프라이트 로드 - 경로 수정
    this.load.image('xp-gem', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ingame_icon/icon_exp.png');
    
    // 무기 데이터 로드
    this.load.json('weapons-data', 'assets/data/weapons.json');
    
    // UI 에셋 로드
    this.load.image('button', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/button.png');
    this.load.image('button-hover', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/button-hover.png');
  }

  create() {
    console.log('BootScene: 모든 리소스 로드 완료');
    
    // 텍스처 로딩 확인
    this.checkTextures();
    
    // 타이틀 씬으로 이동
    this.scene.start(SceneKeys.TITLE);
  }
  
  // 텍스처 로딩 확인
  checkTextures() {
    console.log('BootScene - 텍스처 로딩 확인:');
    console.log('- bg-title:', this.textures.exists('bg-title'));
    console.log('- btn-blue:', this.textures.exists('btn-blue'));
    console.log('- btn-green:', this.textures.exists('btn-green'));
    console.log('- btn-red:', this.textures.exists('btn-red'));
    console.log('- characters:', this.textures.exists('characters'));
    console.log('- background-tile:', this.textures.exists('background-tile'));
    console.log('- knife:', this.textures.exists('knife'));
    console.log('- shield:', this.textures.exists('shield'));
    console.log('- whip:', this.textures.exists('whip'));
    console.log('- arrow:', this.textures.exists('arrow'));
    console.log('- xp-gem:', this.textures.exists('xp-gem'));
    
    if (this.textures.exists('characters')) {
      const frames = this.textures.get('characters').getFrameNames();
      console.log('Characters frames count:', frames.length);
    }
  }
}
