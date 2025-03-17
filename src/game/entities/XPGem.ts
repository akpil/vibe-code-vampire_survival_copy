import Phaser from 'phaser';

export class XPGem extends Phaser.Physics.Arcade.Image {
  value: number = 10;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'gem');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics properties
    this.setScale(0.8);
    this.setDepth(3);
    
    // Add a glow effect
    this.setBlendMode(Phaser.BlendModes.ADD);
    
    // Add a pulsing animation
    scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Add a slight movement to make it more noticeable
    const angle = Math.random() * Math.PI * 2;
    const speed = 20;
    this.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    
    // Add drag to slow it down
    this.setDamping(true);
    this.setDrag(0.95);
    
    // Auto destroy after 10 seconds if not collected
    scene.time.delayedCall(10000, () => {
      if (this.active) {
        scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.destroy();
          }
        });
      }
    });
  }
}
