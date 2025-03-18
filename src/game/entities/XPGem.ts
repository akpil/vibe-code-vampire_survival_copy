import Phaser from 'phaser';

export class XPGem extends Phaser.Physics.Arcade.Sprite {
  value: number;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'xp-gem');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // ì ¬ ì¤ì 
    this.setScale(0.8);
    this.value = 10;
    
    // ë¬¼ë¦¬ ë°ë ì¤ì 
    this.body.setSize(16, 16);
    
    // ì ¬ì´ íë ì´ì´ë¥¼ í¥í´ ììí ì´ëíëë¡ ì¤ì 
    scene.time.addEvent({
      delay: 100,
      callback: this.moveTowardsPlayer,
      callbackScope: this,
      loop: true
    });
    
    // ì¼ì  ìê° í ìë íê´´
    scene.time.delayedCall(10000, () => {
      if (this.active) {
        this.destroy();
      }
    });
    
    // ìì± í¨ê³¼
    scene.tweens.add({
      targets: this,
      scale: 0.8,
      duration: 200,
      ease: 'Bounce.easeOut',
      yoyo: false
    });
    
    // íì  í¨ê³¼ ì¶ê°
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });
  }
  
  moveTowardsPlayer() {
    try {
      // íë ì´ì´ ì°¾ê¸° - scene.children.listë¥¼ ì¬ì©íì¬ ëª¨ë  ê²ì ì¤ë¸ì í¸ ì ê·¼
      const gameObjects = this.scene.children.list;
      const player = gameObjects.find(child => 
        child instanceof Phaser.GameObjects.Sprite && 
        child.constructor.name === 'Player'
      );
      
      if (player && player instanceof Phaser.GameObjects.Sprite) {
        // íë ì´ì´ìì ê±°ë¦¬ ê³ì°
        const distance = Phaser.Math.Distance.Between(
          this.x, this.y,
          player.x,
          player.y
        );
        
        // ì¼ì  ê±°ë¦¬ ì´ë´ë©´ íë ì´ì´ë¥¼ í¥í´ ì´ë
        if (distance < 200) {
          const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            player.x,
            player.y
          );
          
          const speed = Math.min(200, 50 + (200 - distance));
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          
          this.setVelocity(vx, vy);
        }
      }
    } catch (error) {
      console.error('Error in XPGem.moveTowardsPlayer:', error);
    }
  }
}
