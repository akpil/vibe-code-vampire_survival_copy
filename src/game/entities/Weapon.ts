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
        // 칼은 회전시 발사 방향에서 135도 꺾기 (45도에서 90도 더 추가)
        this.setRotation(angle + (135 * (Math.PI / 180)));
        this.body.setSize(16, 8);
        break;
      case 'shield':
        this.setScale(1.5); // 방패 크기 증가
        this.orbitTarget = orbitTarget;
        this.orbitDistance = 80; // 거리 조정
        this.orbitAngle = angle;
        this.orbitSpeed = 0.05;
        // 방패는 물리 바디 크기 조정 (충돌 영역 최적화)
        this.body.setSize(16, 16);
        this.body.setOffset(4, 4);
        break;
      case 'whip':
        this.setScale(1.2);
        
        // Fix whip orientation - make it appear in front of the character
        // Set the anchor point to the handle end of the whip
        this.setOrigin(0, 0.5);
        
        // Adjust rotation to match the direction angle
        this.setRotation(angle);
        
        // Set appropriate body size for collision
        this.body.setSize(60, 20);
        this.body.setOffset(5, 4);
        
        // Create whip animation if spritesheet is available
        if (this.texture.frameTotal > 1) {
          this.anims.create({
            key: 'whip-anim',
            frames: this.anims.generateFrameNumbers(type, { start: 0, end: this.texture.frameTotal - 1 }),
            frameRate: 15,
            repeat: 0
          });
          
          this.play('whip-anim');
          
          // Auto-destroy after animation completes
          this.on('animationcomplete', () => {
            this.destroy();
          });
        } else {
          // If no animation frames, set a timer to destroy
          scene.time.delayedCall(300, () => {
            if (this.active) {
              this.destroy();
            }
          });
        }
        break;
      case 'arrow':
        this.setScale(0.8);
        // 화살은 방향에서 135도 회전 (칼과 동일하게)
        this.setRotation(angle + (135 * (Math.PI / 180)));
        this.body.setSize(16, 8);
        break;
    }
    
    // 무기가 궤도를 돌지 않는 경우 속도 설정
    if (!orbit) {
      // 이동 방향 설정 - 모든 무기 타입에 대해 동일하게 적용
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.setVelocity(vx, vy);
      
      // 무기가 일정 시간 후 자동 파괴되도록 설정 (궤도 무기 제외)
      if (destroyOnHit && type !== 'whip') { // Skip for whip as it has its own destruction logic
        scene.time.delayedCall(2000, () => {
          if (this.active) {
            this.destroy();
          }
        });
      }
    } else {
      // 궤도를 도는 무기는 물리 효과 비활성화
      this.body.setVelocity(0, 0);
      this.body.setImmovable(true);
      
      // 초기 위치 설정 (궤도 시작점)
      if (this.orbitTarget) {
        const target = this.orbitTarget as Phaser.GameObjects.Sprite;
        const x = target.x + Math.cos(this.orbitAngle) * this.orbitDistance;
        const y = target.y + Math.sin(this.orbitAngle) * this.orbitDistance;
        this.setPosition(x, y);
      }
    }
  }
  
  update() {
    // 궤도를 도는 무기 업데이트
    if (this.orbitTarget && this.orbitTarget.active) {
      const target = this.orbitTarget as Phaser.GameObjects.Sprite;
      
      // 새 위치 계산 - orbitAngle은 Player 클래스에서 관리됨
      const x = target.x + Math.cos(this.orbitAngle) * this.orbitDistance;
      const y = target.y + Math.sin(this.orbitAngle) * this.orbitDistance;
      
      // 위치 설정
      this.setPosition(x, y);
      
      // 방패의 경우 회전 방식 변경 (axe 방식으로)
      if (this.texture.key === 'shield') {
        // 방패가 플레이어를 향하도록 회전 (axe 방식)
        // 방패의 윗부분이 항상 이동 방향을 가리키도록 설정
        const rotationAngle = this.orbitAngle + Math.PI / 2; // 90도 추가 회전
        this.setRotation(rotationAngle);
      }
    } else if (this.orbitTarget && !this.orbitTarget.active) {
      // 타겟이 비활성화되면 무기도 제거
      this.destroy();
    }
    
    // 맵 밖으로 나가면 파괴 (궤도 무기 제외)
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
