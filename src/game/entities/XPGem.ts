import Phaser from 'phaser';

export class XPGem extends Phaser.Physics.Arcade.Sprite {
  value: number;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'xp-gem');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 경험치 젬 크기 설정
    this.setDisplaySize(24, 24);
    this.value = 10;
    
    // 물리 바디 크기도 동일하게 설정
    this.body.setSize(24, 24);
    
    // 물리 속도를 0으로 설정하여 움직이지 않도록 함
    this.setVelocity(0, 0);
    
    // 물리 바디를 정적으로 설정하여 움직이지 않도록 함
    this.body.setImmovable(true);
    
    // 알파값 조정 효과 (페이드인만 유지)
    scene.tweens.add({
      targets: this,
      alpha: { from: 0.6, to: 1 },
      duration: 200,
      ease: 'Sine.easeOut'
    });
  }
}
