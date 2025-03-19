import Phaser from 'phaser';

export class Weapon extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  destroyOnHit: boolean;
  orbitTarget: Phaser.GameObjects.GameObject | null = null;
  orbitDistance: number = 100;
  orbitSpeed: number = 0.05;
  orbitAngle: number = 0;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    damage: number,
    angle: number,
    speed: number,
    destroyOnHit: boolean = true,
    orbit: boolean = false,
    orbitTarget: Phaser.GameObjects.GameObject | null = null
  ) {
    super(scene, x, y, type);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.damage = damage;
    this.destroyOnHit = destroyOnHit;
    
    // ë¬´ê¸° íìì ë°ë¥¸ ì¤ì 
    switch (type) {
      case 'knife':
        this.setScale(1.0);
        // ì¹¼ì íì ì ë°ì¬ ë°©í¥ìì 135ë êº¾ê¸° (45ëìì 90ë ë ì¶ê°)
        this.setRotation(angle + (135 * (Math.PI / 180)));
        this.body.setSize(16, 8);
        break;
      case 'shield':
        this.setScale(1.5); // ë°©í¨ í¬ê¸° ì¦ê°
        this.orbitTarget = orbitTarget;
        this.orbitDistance = 80; // ê±°ë¦¬ ì¡°ì 
        this.orbitAngle = angle;
        this.orbitSpeed = 0.05;
        break;
      case 'whip':
        this.setScale(0.8);
        this.setTint(0x00ffff);
        // ë§ë² ë¬´ê¸°ë ë°©í¥ ì¡°ì 
        this.setRotation(angle - Math.PI/2);
        
        // íë ì ì¸ë±ì¤ ì¤ì  (whip ì¤íë¼ì´í¸ìí¸ì ê²½ì°)
        if (this.texture.frameTotal > 1) {
          this.anims.create({
            key: 'whip-anim',
            frames: this.anims.generateFrameNumbers(type, { start: 0, end: this.texture.frameTotal - 1 }),
            frameRate: 10,
            repeat: -1
          });
          
          this.play('whip-anim');
        }
        break;
    }
    
    // ë¬´ê¸°ê° ê¶¤ëë¥¼ ëì§ ìë ê²½ì° ìë ì¤ì 
    if (!orbit) {
      // ì´ë ë°©í¥ ì¤ì  - ëª¨ë  ë¬´ê¸° íìì ëí´ ëì¼íê² ì ì©
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.setVelocity(vx, vy);
      
      // ë¬´ê¸°ê° ì¼ì  ìê° í ìë íê´´ëëë¡ ì¤ì  (ê¶¤ë ë¬´ê¸° ì ì¸)
      if (destroyOnHit) {
        scene.time.delayedCall(2000, () => {
          if (this.active) {
            this.destroy();
          }
        });
      }
    } else {
      // ê¶¤ëë¥¼ ëë ë¬´ê¸°ë ë¬¼ë¦¬ í¨ê³¼ ë¹íì±í
      this.body.setVelocity(0, 0);
      this.body.setImmovable(true);
      
      // ì´ê¸° ìì¹ ì¤ì  (ê¶¤ë ììì )
      if (this.orbitTarget) {
        const target = this.orbitTarget as Phaser.GameObjects.Sprite;
        const x = target.x + Math.cos(this.orbitAngle) * this.orbitDistance;
        const y = target.y + Math.sin(this.orbitAngle) * this.orbitDistance;
        this.setPosition(x, y);
      }
    }
  }
  
  update() {
    // ê¶¤ëë¥¼ ëë ë¬´ê¸° ìë°ì´í¸
    if (this.orbitTarget && this.orbitTarget.active) {
      const target = this.orbitTarget as Phaser.GameObjects.Sprite;
      
      // ì ìì¹ ê³ì° - orbitAngleì Player í´ëì¤ìì ê´ë¦¬ë¨
      const x = target.x + Math.cos(this.orbitAngle) * this.orbitDistance;
      const y = target.y + Math.sin(this.orbitAngle) * this.orbitDistance;
      
      // ìì¹ ì¤ì 
      this.setPosition(x, y);
      
      // ë°©í¨ì ê²½ì° íì  ë°©ì ë³ê²½ (axe ë°©ìì¼ë¡)
      if (this.texture.key === 'shield') {
        // ë°©í¨ê° íë ì´ì´ë¥¼ í¥íëë¡ íì  (axe ë°©ì)
        // ë°©í¨ì ìë¶ë¶ì´ í­ì ì´ë ë°©í¥ì ê°ë¦¬í¤ëë¡ ì¤ì 
        const rotationAngle = this.orbitAngle + Math.PI / 2; // 90ë ì¶ê° íì 
        this.setRotation(rotationAngle);
      }
    } else if (this.orbitTarget && !this.orbitTarget.active) {
      // íê²ì´ ë¹íì±íëë©´ ë¬´ê¸°ë ì ê±°
      this.destroy();
    }
    
    // ë§µ ë°ì¼ë¡ ëê°ë©´ íê´´ (ê¶¤ë ë¬´ê¸° ì ì¸)
    if (!this.orbitTarget) {
      const scene = this.scene as Phaser.Scene;
      if (
        this.x < 0 || 
        this.y < 0 || 
        this.x > scene.physics.world.bounds.width || 
        this.y > scene.physics.world.bounds.height
      ) {
        this.destroy();
      }
    }
  }
}
