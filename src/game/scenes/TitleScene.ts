import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { gameEvents } from '../events';
import { ButtonFactory } from '../utils/ButtonFactory';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.TITLE });
  }

  preload() {
    // 타이틀 배경 이미지 로드
    this.load.image('bg-title', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/bg_title.png');
    
    // 버튼 이미지 로드
    this.load.image('btn-blue', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_blue.png');
    this.load.image('btn-green', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_green.png');
    this.load.image('btn-red', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_red.png');
    this.load.image('btn-black', 'https://agent8-games.verse8.io/assets/2D/vampire_survival_riped_asset/ui/buttons/btn_black.png');
  }

  create() {
    // 씬 변경 이벤트 발생
    gameEvents.emit('scene-changed', SceneKeys.TITLE);
    
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
        fontFamily: 'Arial',
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
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff'
      }
    );
  }
}
