import Phaser from 'phaser';
import { SceneKeys } from '../types/SceneKeys';
import { ButtonFactory } from '../utils/ButtonFactory';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.PAUSE });
  }

  create() {
    console.log('PauseScene created');
    
    // 반투명 배경 오버레이
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    
    // 일시정지 타이틀
    const pauseTitle = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      '일시정지',
      {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    pauseTitle.setOrigin(0.5);
    
    // 계속하기 버튼
    ButtonFactory.createButton(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'btn-green',
      '계속하기',
      () => {
        console.log('Resume button clicked');
        this.resumeGame();
      },
      180,
      60,
      '20px',
      100
    );
    
    // 타이틀로 버튼
    ButtonFactory.createButton(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'btn-red',
      '타이틀로',
      () => {
        console.log('Title button clicked');
        this.returnToTitle();
      },
      180,
      60,
      '20px',
      100
    );
    
    // ESC 키 입력 처리
    this.input.keyboard.on('keydown-ESC', () => {
      this.resumeGame();
    });
    
    console.log('PauseScene setup completed');
  }
  
  resumeGame() {
    // 메인 씬 재개
    this.scene.resume(SceneKeys.MAIN);
    // 일시정지 씬 숨기기
    this.scene.stop();
  }
  
  returnToTitle() {
    // 메인 씬 중지
    this.scene.stop(SceneKeys.MAIN);
    // 일시정지 씬 중지
    this.scene.stop();
    // 타이틀 씬으로 이동
    this.scene.start(SceneKeys.TITLE);
  }
}
