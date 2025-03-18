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
    // ì  ì íì ë°ë¼ ìºë¦­í° íì ì¤ì 
    let characterType: CharacterType;
    
    if (type === 'enemy1') {
      characterType = CharacterType.GHOST;
    } else if (type === 'enemy2') {
      characterType = CharacterType.SKELETON;
    } else {
      characterType = CharacterType.DEMON;
    }
    
    // ê¸°ë³¸ íì¤ì²ë¡ ìì±
    super(scene, x, y, type);
    this.characterType = characterType;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.health = health;
    this.maxHealth = health;
    
    // ì  ì íì ë°ë¼ ìì± ì¡°ì 
    if (type === 'enemy2') {
      this.speed = 80;
      this.damage = 15;
    } else if (type === 'enemy3') {
      this.speed = 60;
      this.damage = 20;
    }
    
    // ë¬¼ë¦¬ ë°ë ì¤ì 
    this.body.setSize(20, 20);
    this.body.setOffset(6, 12);
    
    // ì¤íë¼ì´í¸ ì¤ì 
    this.setScale(1.2);
    this.setDepth(5);
    
    // íì¤ì²ê° ë¡ëëìëì§ íì¸ í ì ëë©ì´ì ì¤ì 
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

  // ì ëë©ì´ì ì¤ì 
  setupAnimations(typeFrames: string[]) {
    const type = this.characterType;
    
    if (typeFrames.length === 0) {
      console.error(`No frames found for enemy type: ${type}`);
      return;
    }
    
    // ì´ë¯¸ ì ëë©ì´ìì´ ì¡´ì¬íëì§ íì¸
    const walkKey = `${type}_walk`;
    
    if (!this.scene.anims.exists(walkKey)) {
      try {
        // ê±·ê¸° ì ëë©ì´ì ìì±
        this.scene.anims.create({
          key: walkKey,
          frames: this.scene.anims.generateFrameNames('characters', {
            frames: typeFrames.slice(0, Math.min(4, typeFrames.length))
          }),
          frameRate: 8,
          repeat: -1
        });
        console.log(`Created enemy walk animation: ${walkKey} with frames:`, typeFrames.slice(0, Math.min(4, typeFrames.length)));
        
        // ì ëë©ì´ì ì¬ì
        this.play(walkKey);
      } catch (error) {
        console.error(`Error creating enemy animation: ${error}`);
      }
    } else {
      // ì´ë¯¸ ì¡´ì¬íë ì ëë©ì´ì ì¬ì
      this.play(walkKey);
    }
  }

  update(player: Phaser.GameObjects.GameObject) {
    if (!player || !this.active) return;
    
    // íë ì´ì´ ë°©í¥ì¼ë¡ ì´ë
    const playerSprite = player as Phaser.Physics.Arcade.Sprite;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, playerSprite.x, playerSprite.y);
    
    // ìë ê³ì°
    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;
    
    // ìë ì¤ì 
    this.setVelocity(velocityX, velocityY);
    
    // ë°©í¥ì ë°ë¼ ì¤íë¼ì´í¸ ë¤ì§ê¸°
    if (velocityX < 0) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    
    // í¼ê²© í¨ê³¼
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    // ì²´ë ¥ íì (ì í ì¬í­)
    const healthPercent = this.health / this.maxHealth;
    this.setTint(Phaser.Display.Color.GetColor(
      255,
      Math.floor(255 * healthPercent),
      Math.floor(255 * healthPercent)
    ));
  }
}
