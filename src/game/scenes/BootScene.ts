import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { generatePlayerSprite, generateEnemySprite, generateWeaponSprite, generateGemSprite } from '../utils/spriteGenerator';
import { checkAtlasFrames } from '../utils/checkAtlasFrames';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  preload() {
    // Show loading screen
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
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
    
    // Loading event listeners
    this.load.on('progress', (value: number) => {
      percentText.setText(parseInt((value * 100).toString()) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });
    
    this.load.on('fileprogress', (file: any) => {
      assetText.setText('Loading: ' + file.key);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
    
    // Load game assets
    this.loadGameAssets();
  }
  
  loadGameAssets() {
    // Title screen background
    this.load.image('bg-title', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/bg_title.png');
    
    // Button images - path modified (/ui/buttons/ folder added)
    this.load.image('btn-blue', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_blue.png');
    this.load.image('btn-green', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_green.png');
    this.load.image('btn-red', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_red.png');
    
    // Background tile
    this.load.image('background-tile', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/background_tile/tile.png');
    
    // Character sprites
    this.load.atlas('characters', 
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/cha_sprite.png', 
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/cha_sprite_table.json'
    );
    
    // Note: We're no longer loading separate enemy sprites as we're using the characters atlas
    // But we'll keep these for fallback if needed
    this.load.image('enemy1', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/enemy/enemy1.png');
    this.load.image('enemy2', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/enemy/enemy2.png');
    this.load.image('enemy3', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/enemy/enemy3.png');
    
    // Weapon sprites
    this.load.image('shield', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/projectile/shield.png');
    this.load.image('knife', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/projectile/sword.png');
    this.load.image('arrow', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/projectile/arrow.png');
    this.load.spritesheet('whip', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/effectSheet/whip.png', {
      frameWidth: 65,
      frameHeight: 27
    });
    
    // XP gem sprite - path modified
    this.load.image('xp-gem', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ingame_icon/icon_exp.png');
    
    // Weapon data
    this.load.json('weapons-data', 'assets/data/weapons.json');
    
    // UI assets
    this.load.image('button', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/button.png');
    this.load.image('button-hover', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/button-hover.png');
  }

  create() {
    console.log('BootScene: All resources loaded');
    
    // Check texture loading
    this.checkTextures();
    
    // Generate fallback sprites if needed
    this.generateFallbackSprites();
    
    // Go to title scene
    this.scene.start(SceneKeys.TITLE);
  }
  
  // Check texture loading
  checkTextures() {
    console.log('BootScene - Checking textures:');
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
      // 캐릭터 아틀라스 프레임 분석
      const frameAnalysis = checkAtlasFrames(this);
      
      // 프레임 분석 결과 로깅
      console.log('=== 캐릭터 아틀라스 프레임 분석 결과 ===');
      console.log('Ghost 프레임 수:', frameAnalysis.enemyFrames.ghost.length);
      console.log('Skeleton 프레임 수:', frameAnalysis.enemyFrames.skeleton.length);
      console.log('Demon 프레임 수:', frameAnalysis.enemyFrames.demon.length);
      console.log('기타 몬스터 프레임 수:', frameAnalysis.enemyFrames.other.length);
      
      // 첫 10개 프레임 로깅
      console.log('First 10 character frames:', frameAnalysis.allFrames.slice(0, 10));
    }
  }
  
  // Generate fallback sprites
  generateFallbackSprites() {
    // Generate fallback sprites for weapons if needed
    if (!this.textures.exists('knife')) {
      generateWeaponSprite(this, 'knife', '#ff0000');
    }
    
    if (!this.textures.exists('shield')) {
      generateWeaponSprite(this, 'shield', '#3498db');
    }
    
    if (!this.textures.exists('whip')) {
      generateWeaponSprite(this, 'whip', '#9b59b6');
    }
    
    if (!this.textures.exists('arrow')) {
      generateWeaponSprite(this, 'arrow', '#f1c40f');
    }
    
    // Generate fallback sprite for XP gem if needed
    if (!this.textures.exists('xp-gem')) {
      generateGemSprite(this);
    }
  }
}
