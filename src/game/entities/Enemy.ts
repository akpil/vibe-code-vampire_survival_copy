import Phaser from 'phaser';
import { CharacterType } from '../types/CharacterType';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  health: number;
  maxHealth: number;
  speed: number = 100;
  damage: number = 10;
  private characterType: CharacterType;
  private usingFallbackSprite: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, type: string, health: number) {
    // 적의 종류에 따라 캐릭터 타입 설정
    let characterType: CharacterType;
    
    if (type === 'enemy1') {
      characterType = CharacterType.GHOST;
    } else if (type === 'enemy2') {
      characterType = CharacterType.SKELETON;
    } else {
      characterType = CharacterType.DEMON;
    }
    
    // 기본 텍스처로 생성
    super(scene, x, y, type);
    this.characterType = characterType;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.health = health;
    this.maxHealth = health;
    
    // 적의 종류에 따라 속성 조정
    if (type === 'enemy2') {
      this.speed = 80;
      this.damage = 15;
    } else if (type === 'enemy3') {
      this.speed = 60;
      this.damage = 20;
    }
    
    // 물리 바디 설정
    this.body.setSize(20, 20);
    this.body.setOffset(6, 12);
    
    // 스프라이트 설정
    this.setScale(1.2);
    this.setDepth(5);
    
    // 텍스처가 로드되었는지 확인 후 애니메이션 설정
    if (scene.textures.exists('characters')) {
      const frames = scene.textures.get('characters').getFrameNames();
      const typeFrames = frames.filter(frame => frame.includes(`cha_${characterType}_`));
      
      if (typeFrames.length > 0) {
        this.usingFallbackSprite = false;
        this.setTexture('characters', typeFrames[0]);
        console.log(`Using enemy sprite: ${typeFrames[0]}`);
        this.setupAnimations(typeFrames);
      } else {
        console.error(`No frames found for enemy type: ${characterType}, using fallback`);
        this.usingFallbackSprite = true;
      }
    } else {
      console.error('Characters texture not loaded, using fallback for enemy');
      this.usingFallbackSprite = true;
    }
  }

  // 애니메이션 설정
  setupAnimations(typeFrames: string[]) {
    const type = this.characterType;
    
    if (typeFrames.length === 0) {
      console.error(`No frames found for enemy type: ${type}`);
      return;
    }
    
    // 이미 애니메이션이 존재하는지 확인
    const walkKey = `${type}_walk`;
    
    if (!this.scene.anims.exists(walkKey)) {
      try {
        // 걷기 애니메이션 생성
        this.scene.anims.create({
          key: walkKey,
          frames: this.scene.anims.generateFrameNames('characters', {
            frames: typeFrames.slice(0, Math.min(4, typeFrames.length))
          }),
          frameRate: 8,
          repeat: -1
        });
        console.log(`Created enemy walk animation: ${walkKey} with frames:`, typeFrames.slice(0, Math.min(4, typeFrames.length)));
        
        // 애니메이션 재생
        this.play(walkKey);
      } catch (error) {
        console.error(`Error creating enemy animation: ${error}`);
      }
    } else {
      // 이미 존재하는 애니메이션 재생
      this.play(walkKey);
    }
  }

  update(player: Phaser.GameObjects.GameObject) {
    if (!player || !this.active) return;
    
    // 플레이어 방향으로 이동
    const playerSprite = player as Phaser.Physics.Arcade.Sprite;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, playerSprite.x, playerSprite.y);
    
    // 속도 계산
    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;
    
    // 속도 설정
    this.setVelocity(velocityX, velocityY);
    
    // 방향에 따라 스프라이트 뒤집기
    if (velocityX < 0) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    
    // 타격 효과
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    // 체력 표시 (색상 변화)
    const healthPercent = this.health / this.maxHealth;
    this.setTint(Phaser.Display.Color.GetColor(
      255,
      Math.floor(255 * healthPercent),
      Math.floor(255 * healthPercent)
    ));
  }
}
