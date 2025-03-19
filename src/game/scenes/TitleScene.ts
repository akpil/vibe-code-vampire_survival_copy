import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.TITLE });
  }

  create() {
    // 씬 변경 이벤트 발생
    gameEvents.emit('scene-changed', SceneKeys.TITLE);
    
    console.log('TitleScene: create started');
    
    // 텍스처 로드 확인
    this.checkTextures();
    
    // 배경 이미지 추가
    const bg = this.add.image(0, 0, 'bg-title');
    bg.setOrigin(0, 0);
    
    // 화면 크기에 맞게 배경 이미지 스케일 조정
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    
    // 게임 타이틀 텍스트 추가
    const titleText = this.add.text(
      this.cameras.main.centerX, 
      this.cameras.main.height * 0.3, 
      'Vampire Survival', 
      {
        fontFamily: 'Arial, Malgun Gothic, 맑은 고딕, Dotum, 돋움, sans-serif',
        fontSize: '64px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 8 }
      }
    );
    titleText.setOrigin(0.5);
    
    // 시작 버튼 추가 - ButtonFactory 사용
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.6,
      'btn-blue',
      '게임 시작',
      () => {
        this.scene.start(SceneKeys.CHAPTER_SELECT);
      }
    );
    
    // 설정 버튼 추가 - ButtonFactory 사용
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.7,
      'btn-green',
      '설정',
      () => {
        // 설정 기능 (미구현)
        console.log('Settings button clicked');
      }
    );
    
    // 종료 버튼 추가 - ButtonFactory 사용
    ButtonFactory.createButton(
      this,
      this.cameras.main.centerX,
      this.cameras.main.height * 0.8,
      'btn-red',
      '종료',
      () => {
        // 브라우저에서는 실제로 게임을 종료할 수 없으므로 경고 표시
        alert('브라우저 게임에서는 종료 기능이 제한됩니다.');
      }
    );
    
    // 버전 정보 표시
    const versionText = this.add.text(
      10, 
      this.cameras.main.height - 30, 
      'Version 1.0.0', 
      {
        fontFamily: 'Arial, Malgun Gothic, 맑은 고딕, sans-serif',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
    
    console.log('TitleScene: create completed');
  }
  
  // 텍스처 로드 확인
  checkTextures() {
    console.log('TitleScene - Checking textures:');
    console.log('- bg-title:', this.textures.exists('bg-title'));
    console.log('- btn-blue:', this.textures.exists('btn-blue'));
    console.log('- btn-green:', this.textures.exists('btn-green'));
    console.log('- btn-red:', this.textures.exists('btn-red'));
    
    // 텍스처가 없는 경우 폴백 생성
    if (!this.textures.exists('bg-title')) {
      this.createFallbackBackground();
    }
    
    if (!this.textures.exists('btn-blue')) {
      this.createFallbackButton('btn-blue', 0x3498db);
    }
    
    if (!this.textures.exists('btn-green')) {
      this.createFallbackButton('btn-green', 0x2ecc71);
    }
    
    if (!this.textures.exists('btn-red')) {
      this.createFallbackButton('btn-red', 0xe74c3c);
    }
  }
  
  // 폴백 배경 생성
  createFallbackBackground() {
    console.log('Creating fallback background');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // 그라데이션 배경
    const width = 800;
    const height = 600;
    
    graphics.fillGradientStyle(0x000033, 0x000033, 0x000066, 0x000066, 1);
    graphics.fillRect(0, 0, width, height);
    
    // 별 추가
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      
      graphics.fillStyle(0xffffff, Math.random() * 0.5 + 0.5);
      graphics.fillCircle(x, y, size);
    }
    
    // 텍스처 생성
    graphics.generateTexture('bg-title', width, height);
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
}
