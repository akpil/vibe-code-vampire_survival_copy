import Phaser from 'phaser';

export class XPGem extends Phaser.Physics.Arcade.Sprite {
  value: number;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'xp-gem');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 젬 설정
    this.setScale(0.8);
    this.value = 10;
    
    // 물리 바디 설정
    this.body.setSize(16, 16);
    
    // 젬이 플레이어를 향해 서서히 이동하도록 설정
    scene.time.addEvent({
      delay: 100,
      callback: this.moveTowardsPlayer,
      callbackScope: this,
      loop: true
    });
    
    // 일정 시간 후 자동 파괴
    scene.time.delayedCall(10000, () => {
      if (this.active) {
        this.destroy();
      }
    });
    
    // 생성 효과
    scene.tweens.add({
      targets: this,
      scale: 0.8,
      duration: 200,
      ease: 'Bounce.easeOut',
      yoyo: false
    });
    
    // 회전 효과 추가
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
      // 플레이어 찾기 - scene.children.list를 사용하여 모든 게임 오브젝트 접근
      const gameObjects = this.scene.children.list;
      const player = gameObjects.find(child => 
        child instanceof Phaser.GameObjects.Sprite && 
        child.constructor.name === 'Player'
      );
      
      if (player && player instanceof Phaser.GameObjects.Sprite) {
        // 플레이어와의 거리 계산
        const distance = Phaser.Math.Distance.Between(
          this.x, this.y,
          player.x,
          player.y
        );
        
        // 일정 거리 이내면 플레이어를 향해 이동
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
