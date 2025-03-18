import Phaser from 'phaser';

/**
 * 게임 전체에서 재사용 가능한 버튼 생성 유틸리티
 */
export class ButtonFactory {
  /**
   * 일관된 스타일의 버튼을 생성합니다
   * @param scene 버튼을 생성할 씬
   * @param x 버튼의 x 좌표
   * @param y 버튼의 y 좌표
   * @param imageKey 버튼 배경 이미지 키
   * @param text 버튼에 표시할 텍스트
   * @param onClick 버튼 클릭 시 실행할 콜백 함수
   * @param width 버튼 너비 (픽셀)
   * @param height 버튼 높이 (픽셀)
   * @param fontSize 버튼 텍스트 크기
   * @param depth 버튼의 z-index (depth)
   * @returns 생성된 버튼 이미지 객체
   */
  static createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    imageKey: string,
    text: string,
    onClick: () => void,
    width: number = 180,
    height: number = 60,
    fontSize: string = '20px',
    depth: number = 100
  ): Phaser.GameObjects.Image {
    // 버튼 이미지 생성
    const button = scene.add.image(x, y, imageKey);
    button.setDisplaySize(width, height);
    button.setInteractive({ useHandCursor: true });
    button.setDepth(depth);
    
    // 버튼 텍스트 생성
    const buttonText = scene.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: fontSize,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(depth + 1); // 텍스트가 버튼 위에 표시되도록 depth 설정
    
    // 클릭 이벤트 설정
    button.on('pointerdown', onClick);
    
    // 호버 효과
    button.on('pointerover', () => {
      button.setTint(0xdddddd);
    });
    
    button.on('pointerout', () => {
      button.clearTint();
    });
    
    return button;
  }
  
  /**
   * 스크롤 팩터가 0으로 설정된 UI용 버튼을 생성합니다 (카메라 이동에 영향받지 않음)
   * @param scene 버튼을 생성할 씬
   * @param x 버튼의 x 좌표
   * @param y 버튼의 y 좌표
   * @param imageKey 버튼 배경 이미지 키
   * @param text 버튼에 표시할 텍스트
   * @param onClick 버튼 클릭 시 실행할 콜백 함수
   * @param width 버튼 너비 (픽셀)
   * @param height 버튼 높이 (픽셀)
   * @param fontSize 버튼 텍스트 크기
   * @param depth 버튼의 z-index (depth)
   * @returns 생성된 버튼 이미지와 텍스트 객체를 포함하는 객체
   */
  static createUIButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    imageKey: string,
    text: string,
    onClick: () => void,
    width: number = 180,
    height: number = 60,
    fontSize: string = '20px',
    depth: number = 1000
  ): { button: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text } {
    // 버튼 이미지 생성
    const button = scene.add.image(x, y, imageKey);
    button.setDisplaySize(width, height);
    button.setInteractive({ useHandCursor: true });
    button.setScrollFactor(0); // 카메라 이동에 영향받지 않도록 설정
    button.setDepth(depth);
    
    // 버튼 텍스트 생성
    const buttonText = scene.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: fontSize,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    buttonText.setOrigin(0.5);
    buttonText.setScrollFactor(0); // 카메라 이동에 영향받지 않도록 설정
    buttonText.setDepth(depth + 1); // 텍스트가 버튼 위에 표시되도록 depth 설정
    
    // 클릭 이벤트 설정
    button.on('pointerdown', onClick);
    
    // 호버 효과
    button.on('pointerover', () => {
      button.setTint(0xdddddd);
    });
    
    button.on('pointerout', () => {
      button.clearTint();
    });
    
    return { button, text: buttonText };
  }
}
