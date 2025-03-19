import Phaser from 'phaser';
import { Weapon } from '../entities/Weapon';

export interface WeaponConfig {
  type: string;
  name: string;
  texture: string;
  damage: number;
  damagePerLevel: number;
  cooldown: number;
  cooldownReductionPerLevel: number;
  speed: number;
  destroyOnHit: boolean;
  scale?: number;
  rotation?: number;
  tint?: string;
  body?: {
    width: number;
    height: number;
  };
  lifespan?: number;
  targeting?: string;
  orbitDistance?: number;
  orbitSpeed?: number;
  orbitSpeedPerLevel?: number;
  countPerLevel?: number;
  baseCount?: number;
  animation?: {
    frameRate: number;
    repeat: number;
  };
}

export class WeaponManager {
  private scene: Phaser.Scene;
  private weaponsGroup: Phaser.GameObjects.Group;
  private player: Phaser.Physics.Arcade.Sprite;
  private activeShields: Weapon[] = [];
  private shieldBaseAngle: number = 0;
  private lastDirectionX: number = 0;
  private lastDirectionY: number = -1; // ê¸°ë³¸ê°ì ììª½
  private movementDirectionX: number = 0;
  private movementDirectionY: number = -1; // ê¸°ë³¸ê°ì ììª½
  private facingDirection: 'left' | 'right' = 'right'; // ê¸°ë³¸ê°ì ì¤ë¥¸ìª½
  private weaponsData: Record<string, WeaponConfig> = {};

  constructor(scene: Phaser.Scene, weaponsGroup: Phaser.GameObjects.Group, player: Phaser.Physics.Arcade.Sprite) {
    this.scene = scene;
    this.weaponsGroup = weaponsGroup;
    this.player = player;
    
    // ë¬´ê¸° ë°ì´í° ë¡ë
    this.loadWeaponsData();
  }
  
  // ë¬´ê¸° ë°ì´í° ë¡ë ë©ìë
  private loadWeaponsData() {
    // ì¬ìì ë¡ëë JSON ë°ì´í° ê°ì ¸ì¤ê¸°
    const weaponsData = this.scene.cache.json.get('weapons-data');
    
    if (weaponsData) {
      this.weaponsData = weaponsData;
      console.log('Weapons data loaded successfully:', Object.keys(this.weaponsData));
    } else {
      console.error('Failed to load weapons data from cache');
      // ê¸°ë³¸ ë¬´ê¸° ë°ì´í° ì¤ì  (í´ë°±)
      this.setupDefaultWeaponsData();
    }
  }
  
  // ê¸°ë³¸ ë¬´ê¸° ë°ì´í° ì¤ì  (ë°ì´í° ë¡ë ì¤í¨ ì)
  private setupDefaultWeaponsData() {
    this.weaponsData = {
      "knife": {
        "type": "projectile",
        "name": "ì¹¼",
        "texture": "knife",
        "damage": 20,
        "damagePerLevel": 5,
        "cooldown": 500,
        "cooldownReductionPerLevel": 0.1,
        "speed": 300,
        "destroyOnHit": true,
        "scale": 1.0,
        "rotation": 45,
        "body": {
          "width": 16,
          "height": 8
        },
        "lifespan": 2000,
        "targeting": "movement"
      },
      "shield": {
        "type": "orbit",
        "name": "ë°©í¨",
        "texture": "shield",
        "damage": 30,
        "damagePerLevel": 8,
        "cooldown": 1000,
        "cooldownReductionPerLevel": 0.1,
        "speed": 0,
        "destroyOnHit": false,
        "scale": 1.5,
        "orbitDistance": 80,
        "orbitSpeed": 0.05,
        "orbitSpeedPerLevel": 0.02,
        "countPerLevel": 0.5,
        "baseCount": 1
      },
      "whip": {
        "type": "projectile",
        "name": "ì±ì°",
        "texture": "whip",
        "damage": 25,
        "damagePerLevel": 7,
        "cooldown": 1000,
        "cooldownReductionPerLevel": 0.1,
        "speed": 200,
        "destroyOnHit": true,
        "scale": 0.8,
        "tint": "0x00ffff",
        "animation": {
          "frameRate": 10,
          "repeat": -1
        },
        "targeting": "facing"
      },
      "arrow": {
        "type": "projectile",
        "name": "íì´",
        "texture": "arrow",
        "damage": 15,
        "damagePerLevel": 5,
        "cooldown": 1000,
        "cooldownReductionPerLevel": 0.1,
        "speed": 350,
        "destroyOnHit": true,
        "scale": 0.7,
        "rotation": 0,
        "body": {
          "width": 8,
          "height": 24
        },
        "lifespan": 2000,
        "targeting": "nearest"
      }
    };
    
    console.log('Using default weapons data');
  }

  public updatePlayerDirection(directionX: number, directionY: number): void {
    // ì´ë ë°©í¥ ì ì¥ (0ì´ ìë ê²½ì°ìë§ ìë°ì´í¸)
    if (directionX !== 0 || directionY !== 0) {
      this.movementDirectionX = directionX;
      this.movementDirectionY = directionY;
      this.lastDirectionX = directionX;
      this.lastDirectionY = directionY;
    }
    
    // ìºë¦­í°ê° ë°ë¼ë³´ë ë°©í¥ ìë°ì´í¸ (ì¢ì° ë°©í¥ë§)
    if (directionX < 0) {
      this.facingDirection = 'left';
    } else if (directionX > 0) {
      this.facingDirection = 'right';
    }
    // directionXê° 0ì¸ ê²½ì° facingDirectionì ë³ê²½íì§ ìì (ì´ì  ë°©í¥ ì ì§)
  }

  public updateShields(delta: number): void {
    // íì±íë ë°©í¨ ë¬´ê¸° íì¸ ë° ì ë¦¬ - ë¹íì± ë°©í¨ë§ ì ê±°
    this.activeShields = this.activeShields.filter(shield => shield.active);
    
    // ë°©í¨ ê°ë ìë°ì´í¸ - ê¸°ì¤ ê°ëë§ íì ìí¤ê³  ê° ë°©í¨ì ìëì  ìì¹ë ì ì§
    if (this.activeShields.length > 0) {
      // ê¸°ì¤ ê°ë ìë°ì´í¸ (íì  ìë ì¦ê°)
      this.shieldBaseAngle += 0.03;
      
      // ê° ë°©í¨ì ê°ë ìë°ì´í¸
      const angleStep = (Math.PI * 2) / this.activeShields.length;
      
      this.activeShields.forEach((shield, index) => {
        // ê° ë°©í¨ì ìëì  ìì¹ ê³ì° (ê¸°ì¤ ê°ë + ì¸ë±ì¤ë³ ì¤íì)
        const shieldAngle = this.shieldBaseAngle + (index * angleStep);
        shield.orbitAngle = shieldAngle;
      });
    }
  }

  public createWeapon(type: string, level: number): Weapon | null {
    const config = this.weaponsData[type];
    if (!config) {
      console.error(`Weapon type not found: ${type}`);
      return null;
    }

    // ë¬´ê¸° ë°ì´í° ê³ì°
    const damage = config.damage + (level - 1) * config.damagePerLevel;
    
    // íê²í ë°©ìì ë°ë¥¸ ê°ë ê³ì°
    let angle = 0;
    let target = null;
    
    switch (config.targeting) {
      case 'nearest':
        // ê°ì¥ ê°ê¹ì´ ì  ì°¾ê¸°
        const enemies = this.scene.children.getChildren()
          .filter(child => child.constructor.name === 'Enemy')
          .sort((a: any, b: any) => {
            const distA = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
            const distB = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
            return distA - distB;
          });
        
        if (enemies.length > 0) {
          target = enemies[0] as Phaser.GameObjects.GameObject;
          angle = Phaser.Math.Angle.Between(
            this.player.x, 
            this.player.y, 
            (target as any).x, 
            (target as any).y
          );
        } else {
          // ì ì´ ìì¼ë©´ ë§ì§ë§ ë°©í¥ ëë ììª½ì¼ë¡
          angle = Math.atan2(this.lastDirectionY, this.lastDirectionX);
        }
        break;
        
      case 'facing':
        // ìºë¦­í°ê° ë°ë¼ë³´ë ë°©í¥ (ì¢/ì°)
        if (this.facingDirection === 'left') {
          angle = Math.PI; // ì¼ìª½ (180ë)
        } else {
          angle = 0; // ì¤ë¥¸ìª½ (0ë)
        }
        break;
        
      case 'movement':
        // ìºë¦­í°ì ì´ë ë²¡í° ë°©í¥
        angle = Math.atan2(this.movementDirectionY, this.movementDirectionX);
        break;
        
      case 'forward':
        // ìºë¦­í°ê° ë°ë¼ë³´ë ë°©í¥ (ìíì¢ì°)
        angle = Math.atan2(this.lastDirectionY, this.lastDirectionX);
        break;
        
      default:
        // ê¸°ë³¸ê°ì ë¬´ìì ë°©í¥
        angle = Math.random() * Math.PI * 2;
    }

    // ë¬´ê¸° íìì ë°ë¥¸ ìì±
    if (config.type === 'orbit') {
      return this.createOrbitWeapon(config, level, damage, angle);
    } else {
      return this.createProjectileWeapon(config, level, damage, angle, target);
    }
  }

  private createProjectileWeapon(
    config: WeaponConfig, 
    level: number, 
    damage: number, 
    angle: number,
    target: Phaser.GameObjects.GameObject | null
  ): Weapon {
    const weapon = new Weapon(
      this.scene,
      this.player.x,
      this.player.y,
      config.texture,
      damage,
      angle,
      config.speed,
      config.destroyOnHit,
      false,
      null
    );
    
    // ì¶ê° ì¤ì 
    if (config.scale) weapon.setScale(config.scale);
    // íì  ì¤ì ì ì´ì  Weapon í´ëì¤ìì ì²ë¦¬ (knifeë ë°ì¬ ë°©í¥ì 45ë ì¶ê°)
    if (config.tint) weapon.setTint(parseInt(config.tint));
    if (config.body) weapon.body.setSize(config.body.width, config.body.height);
    
    // ì ëë©ì´ì ì¤ì 
    if (config.animation && weapon.texture.frameTotal > 1) {
      weapon.anims.create({
        key: `${config.texture}-anim`,
        frames: weapon.anims.generateFrameNumbers(config.texture, { 
          start: 0, 
          end: weapon.texture.frameTotal - 1 
        }),
        frameRate: config.animation.frameRate,
        repeat: config.animation.repeat
      });
      
      weapon.play(`${config.texture}-anim`);
    }
    
    // ìëª ì¤ì 
    if (config.lifespan) {
      this.scene.time.delayedCall(config.lifespan, () => {
        if (weapon.active) {
          weapon.destroy();
        }
      });
    }
    
    return weapon;
  }

  private createOrbitWeapon(
    config: WeaponConfig, 
    level: number, 
    damage: number, 
    angle: number
  ): Weapon | null {
    // ë°©í¨ ê°ì ê³ì° (ë ë²¨ì ë°ë¼ ì¦ê°)
    const count = Math.floor(config.baseCount! + Math.floor(level / 2) * config.countPerLevel!);
    
    // íì¬ íì±íë ë°©í¨ ê°ì íì¸
    if (this.activeShields.length >= count) {
      // ì´ë¯¸ ì¶©ë¶í ë°©í¨ê° ìì¼ë©´ ìë¡ ìì±íì§ ìì
      return null;
    }
    
    // íìí ë°©í¨ë§ ì¶ê° ìì±
    const newShieldsCount = count - this.activeShields.length;
    
    // ë°©í¨ ê° ê· ë±í ê°ë ë¶ë°°ë¥¼ ìí ê³ì°
    const totalShields = this.activeShields.length + newShieldsCount;
    const angleStep = (Math.PI * 2) / totalShields;
    
    // ë§ì§ë§ì¼ë¡ ìì±ë ë°©í¨ ë°í
    let lastShield: Weapon | null = null;
    
    for (let i = 0; i < newShieldsCount; i++) {
      // ì ë°©í¨ì ì¸ë±ì¤ ê³ì°
      const shieldIndex = this.activeShields.length + i;
      
      // ë°©í¨ì ì´ê¸° ê°ë ì¤ì  (ê¸°ì¤ ê°ë + ì¸ë±ì¤ë³ ì¤íì)
      const shieldAngle = this.shieldBaseAngle + (shieldIndex * angleStep);
      
      const shield = new Weapon(
        this.scene,
        this.player.x,
        this.player.y,
        config.texture,
        damage,
        shieldAngle,
        0,
        false,
        true,
        this.player
      );
      
      // ë°©í¨ íì  ìë ì¤ì  - ë ë²¨ì ë°ë¼ ì¦ê°
      shield.orbitSpeed = config.orbitSpeed! + (level * config.orbitSpeedPerLevel!);
      
      // í¬ê¸° ì¤ì 
      if (config.scale) shield.setScale(config.scale);
      
      // íì± ë°©í¨ ë°°ì´ì ì¶ê°
      this.activeShields.push(shield);
      lastShield = shield;
    }
    
    return lastShield;
  }
}
