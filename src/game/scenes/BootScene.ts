import Phaser from 'phaser';
import { generatePlayerSprite, generateEnemySprite, generateWeaponSprite, generateGemSprite } from '../utils/spriteGenerator';
import { gameEvents } from '../events';

export class BootScene extends Phaser.Scene {
  private assetsLoaded: boolean = false;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate fallback sprites first (will be used if atlas loading fails)
    generatePlayerSprite(this);
    generateEnemySprite(this, 'enemy1', '#e74c3c');
    generateEnemySprite(this, 'enemy2', '#f39c12');
    generateEnemySprite(this, 'enemy3', '#c0392b');
    generateWeaponSprite(this, 'knife', '#f1c40f');
    generateWeaponSprite(this, 'axe', '#2ecc71');
    generateWeaponSprite(this, 'magic', '#3498db');
    generateGemSprite(this);
    
    // 로딩 화면 표시 (선택 사항)
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    // 로딩 텍스트
    const loadingText = this.add.text(width / 2, height / 2 - 50, '로딩 중...', {
      font: '20px monospace',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
    
    // 진행률 텍스트
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px monospace',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
    
    // 로딩 진행 상황 표시
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      console.log(`로딩 진행률: ${Math.floor(value * 100)}%`);
    });
    
    // 로딩 완료 시 UI 제거
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      this.assetsLoaded = true;
      console.log('All assets loaded successfully');
      
      // 로드 완료 후 사용 가능한 프레임 확인
      this.checkLoadedAssets();
      
      gameEvents.emit('assets-loaded');
    });
    
    // 로딩 오류 처리
    this.load.on('loaderror', (file: any) => {
      console.error('로딩 오류:', file.src);
      
      // 로딩 오류 발생 시 대체 텍스처 사용 알림
      gameEvents.emit('assets-load-error');
      
      // 오류 메시지 표시
      this.add.text(width / 2, height / 2 + 50, '에셋 로딩 오류 발생!', {
        font: '16px monospace',
        color: '#ff0000'
      }).setOrigin(0.5, 0.5);
    });
    
    // 캐릭터 스프라이트 아틀라스 로드 - 상대 경로 사용
    this.load.atlas(
      'characters', 
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/cha_sprite.png', 
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/cha_sprite_table.json'
    );
    
    // 배경 타일 로드
    this.load.image('background-tile', 
      'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/background_tile/tile.png'
    );
  }

  checkLoadedAssets() {
    // 캐릭터 아틀라스 로드 확인
    if (this.textures.exists('characters')) {
      console.log('Characters atlas loaded successfully');
      const frames = this.textures.get('characters').getFrameNames();
      console.log('Available frames:', frames);
      
      // 프레임 이름 패턴 분석
      const patterns = {};
      frames.forEach(frame => {
        const parts = frame.split('_');
        if (parts.length >= 3) {
          const prefix = parts[0];
          const type = parts[1];
          if (!patterns[type]) {
            patterns[type] = [];
          }
          patterns[type].push(frame);
        }
      });
      
      console.log('Frame patterns by character type:', patterns);
      
      // 첫 번째 프레임의 크기 확인
      if (frames.length > 0) {
        const frame = this.textures.getFrame('characters', frames[0]);
        console.log('First frame dimensions:', frame.width, frame.height);
      }
      
      // 테스트용 스프라이트 표시
      const testSprite = this.add.sprite(400, 300, 'characters', frames[0]);
      testSprite.setScale(2);
      
      // 3초 후 메인 씬으로 전환
      this.time.delayedCall(3000, () => {
        this.scene.start('MainScene');
      });
    } else {
      console.error('Characters atlas failed to load');
      // 로드 실패 시 바로 메인 씬으로 전환
      this.scene.start('MainScene');
    }
    
    // 배경 타일 로드 확인
    if (this.textures.exists('background-tile')) {
      console.log('Background tile loaded successfully');
    } else {
      console.error('Background tile failed to load');
    }
  }

  create() {
    // 이미 로드 완료 이벤트에서 처리했으므로 여기서는 추가 작업 없음
  }
}
