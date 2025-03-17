import Phaser from 'phaser';

export class Weapon extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  angle: number;
  speed: number;
  destroyOnHit: boolean;
  isOrbiting: boolean;
  orbitTarget?: Phaser.GameObjects.GameObject;
  orbitDistance: number = 100;
  orbitSpeed: number = 0.05;
  orbitAngle: number = 0;
  lifespan: number = 5000; // 5 seconds
  creationTime: number;
  
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    type: string,
    damage: number,
    angle: number,
    speed: number,
    destroyOnHit: boolean = true,
    isOrbiting: boolean = false,
    orbitTarget?: Phaser.GameObjects.GameObject
  ) {
    super(scene, x, y, type);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.damage = damage;
    this.angle = angle;
    this.speed = speed;
    this.destroyOnHit = destroyOnHit;
    this.isOrbiting = isOrbiting;
    this.orbitTarget = orbitTarget;
    this.orbitAngle = angle;
    this.creationTime = scene.time.now;
    
    // Set velocity if not orbiting
    if (!isOrbiting) {
      this.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    }
    
    // Rotate sprite to match direction
    this.setRotation(angle);
    
    // Set depth
    this.setDepth(8);
    
    // Set up automatic destruction after lifespan
    if (!isOrbiting) {
      scene.time.delayedCall(this.lifespan, () => {
        this.destroy();
      });
    }
  }

  update() {
    if (this.isOrbiting && this.orbitTarget && this.orbitTarget.active) {
      const target = this.orbitTarget as Phaser.Physics.Arcade.Sprite;
      
      // Update orbit angle
      this.orbitAngle += this.orbitSpeed;
      
      // Calculate new position
      const x = target.x + Math.cos(this.orbitAngle) * this.orbitDistance;
      const y = target.y + Math.sin(this.orbitAngle) * this.orbitDistance;
      
      this.setPosition(x, y);
      this.setRotation(this.orbitAngle + Math.PI / 2);
    } else if (this.isOrbiting && (!this.orbitTarget || !this.orbitTarget.active)) {
      // If orbit target is destroyed, destroy the weapon
      this.destroy();
    }
  }
}
