import Phaser from 'phaser';

export class XPGem extends Phaser.Physics.Arcade.Sprite {
  value: number;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'xp-gem');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // ê²½íì¹ ì ¬ í¬ê¸° ì¤ì 
    this.setDisplaySize(24, 24);
    this.value = 10;
    
    // ë¬¼ë¦¬ ë°ë í¬ê¸°ë ëì¼íê² ì¤ì 
    this.body.setSize(24, 24);
    
    // ë¬¼ë¦¬ ìëë¥¼ 0ì¼ë¡ ì¤ì íì¬ ìì§ì´ì§ ìëë¡ í¨
    this.setVelocity(0, 0);
    
    // ë¬¼ë¦¬ ë°ëë¥¼ ì ì ì¼ë¡ ì¤ì íì¬ ìì§ì´ì§ ìëë¡ í¨
    this.body.setImmovable(true);
    
    // ìíê° ì¡°ì  í¨ê³¼ (íì´ëì¸ë§ ì ì§)
    scene.tweens.add({
      targets: this,
      alpha: { from: 0.6, to: 1 },
      duration: 200,
      ease: 'Sine.easeOut'
    });
  }
}
