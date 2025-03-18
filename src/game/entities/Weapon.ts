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
    
    // 무기 타입에 따른 설정
    switch (type) {
      case 'knife':
        this.setScale(1.0);
        this.setRotation(angle);
        this.body.setSize(16, 8);
        break;
      case 'axe':
        this.setScale(1.0);
        this.orbitTarget = orbitTarget;
        this.orbitDistance = 100;
        this.orbitAngle = angle;
        this.orbitSpeed = 0.05;
        break;
      case 'magic':
        this.setScale(0.8);
        this.setTint(0x00ffff);
        // 프레임 인덱스 설정 (whip 스프라이트시트의 경우)
        if (this.texture.frameTotal > 1) {
          this.anims.create({
            key: 'magic-anim',
            frames: this.anims.generateFrameNumbers(type, { start: 0, end: this.texture.frameTotal - 1 }),
            frameRate: 10,
            repeat: -1
          });
          this.play('magic-anim');
        }
        break;
    }
    
    // 무기가 궤도를 돌지 않는 경우 속도 설정
    if (!orbit) {
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.setVelocity(vx, vy);
    }
    
    // 무기가 일정 시간 후 자동 파괴되도록 설정
    if (destroyOnHit) {
      scene.time.delayedCall(2000, () => {
        if (this.active) {
          this.destroy();
        }
      });
    }
    
    // 무기 회전 효과 (칼과 도끼에만 적용)
    if (type === 'knife' || type === 'axe') {
      scene.tweens.add({
        targets: this,
        angle: '+=360',
        duration: 1000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }
  
  update() {
    // 궤도를 도는 무기 업데이트
    if (this.orbitTarget && this.orbitTarget.active) {
      const target = this.orbitTarget as Phaser.GameObjects.Sprite;
      
      // 궤도 각도 업데이트
      this.orbitAngle += this.orbitSpeed;
      
      // 새 위치 계산
      const x = target.x + Math.cos(this.orbitAngle) * this.orbitDistance;
      const y = target.y + Math.sin(this.orbitAngle) * this.orbitDistance;
      
      // 위치 설정
      this.setPosition(x, y);
    }
    
    // 맵 밖으로 나가면 파괴
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
