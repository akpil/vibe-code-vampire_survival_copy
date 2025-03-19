import Phaser from 'phaser';
import { Weapon } from './Weapon';
import { gameEvents } from '../events';
import { CharacterType } from '../types/CharacterType';
import { WeaponManager } from '../utils/WeaponManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health: number = 100;
  maxHealth: number = 100;
  speed: number = 200;
  
  level: number = 1;
  xp: number = 0;
  xpToNextLevel: number = 100;
  
  weapons: { type: string, level: number, cooldown: number, lastFired: number }[] = [];
  private characterType: CharacterType;
  private usingFallbackSprite: boolean = false;
  private alternativeSprite: string | null = null;
  
  // ë¬´ì  ìí ê´ë ¨ ë³ì
  private isInvincible: boolean = false;
  private invincibilityDuration: number = 1000; // 1ì´ ëì ë¬´ì 
  
  // ì ëë©ì´ì í¤ ì ì¥ ë³ì ì¶ê°
  private walkAnimKey: string;
  private idleAnimKey: string;
  private attackAnimKey: string;
  
  // ë¬´ê¸° ê´ë¦¬ì
  private weaponManager: WeaponManager;
  
  constructor(scene: Phaser.Scene, x: number, y: number, weaponsGroup: Phaser.GameObjects.Group, characterType: CharacterType = CharacterType.WARRIOR) {
    // ìíë¼ì¤ìì ìºë¦­í° íìì ë§ë ì²« ë²ì§¸ íë ìì¼ë¡ ì´ê¸°í
    super(scene, x, y, 'characters');
    this.characterType = characterType;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // ë§µ ê²½ê³ ë´ììë§ ì´ëíëë¡ ì¤ì 
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.setScale(1.5);
    
    // ì¤íë¼ì´í¸ê° ë³´ì´ëì§ íì¸
    this.setAlpha(1);
    this.setVisible(true);
    
    // Set up physics body
    this.body.setSize(20, 20);
    this.body.setOffset(6, 12);
    
    // ë¬´ê¸° ê´ë¦¬ì ì´ê¸°í
    this.weaponManager = new WeaponManager(scene, weaponsGroup, this);
    
    // ìíë¼ì¤ íì¤ì² ì¤ì 
    this.setupCharacterSprite();
    
    // ìºë¦­í° íìì ë°ë¥¸ ì´ê¸° ë¥ë ¥ì¹ ì¤ì 
    this.setupCharacterStats();
    
    // Set up initial weapon
    this.setupInitialWeapon();
    
    // ì ëë©ì´ì ì¤ì 
    this.setupAnimations();
    
    // ë°©í¨ íì¤ì² ë¡ë íì¸ ë° ìì±
    this.preloadShieldTexture();
  }
  
  // ë°©í¨ íì¤ì² ë¡ë íì¸ ë° ìì±
  preloadShieldTexture() {
    if (!this.scene.textures.exists('shield')) {
      // ë°©í¨ íì¤ì² ìì±
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      
      // ë°©í¨ ëª¨ì ê·¸ë¦¬ê¸°
      graphics.fillStyle(0x3498db); // íëì
      graphics.fillRect(0, 0, 24, 24);
      
      // íëë¦¬ ì¶ê°
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeRect(0, 0, 24, 24);
      
      // ë°©í¨ ëíì¼ ì¶ê°
      graphics.fillStyle(0xf39c12); // ë¸ëì
      graphics.fillCircle(12, 12, 6);
      
      // íì¤ì² ìì±
      graphics.generateTexture('shield', 24, 24);
      graphics.destroy();
      
      console.log('Created shield texture');
    }
  }
  
  // ìºë¦­í° ì¤íë¼ì´í¸ ì¤ì 
  setupCharacterSprite() {
    if (this.scene.textures.exists('characters')) {
      const frames = this.scene.textures.get('characters').getFrameNames();
      console.log('Available frames for player:', frames);
      
      // ì±ì§ì ìºë¦­í°ì ëí ëì²´ ì¤íë¼ì´í¸ ì¤ì 
      if (this.characterType === CharacterType.PRIEST) {
        // 'monk' ì¤íë¼ì´í¸ë¥¼ ì±ì§ì ìºë¦­í°ë¡ ì¬ì©
        const monkFrames = frames.filter(frame => frame.includes('cha_monk_'));
        if (monkFrames.length > 0) {
          this.alternativeSprite = 'monk';
          this.usingFallbackSprite = false;
          this.setTexture('characters', monkFrames[0]);
          console.log(`Using monk sprite for priest: ${monkFrames[0]}`);
          return;
        }
        
        // 'monk'ê° ìì¼ë©´ 'knight' ì¤íë¼ì´í¸ ìë
        const knightFrames = frames.filter(frame => frame.includes('cha_knight_'));
        if (knightFrames.length > 0) {
          this.alternativeSprite = 'knight';
          this.usingFallbackSprite = false;
          this.setTexture('characters', knightFrames[0]);
          console.log(`Using knight sprite for priest: ${knightFrames[0]}`);
          return;
        }
      }
      
      // ì¼ë°ì ì¸ ìºë¦­í° íì ì²ë¦¬
      const typePrefix = `cha_${this.characterType}_`;
      const typeFrames = frames.filter(frame => frame.includes(typePrefix));
      
      if (typeFrames.length > 0) {
        this.usingFallbackSprite = false;
        // ì²« ë²ì§¸ íë ìì¼ë¡ íì¤ì² ì¤ì 
        this.setTexture('characters', typeFrames[0]);
        console.log(`Using character sprite: ${typeFrames[0]}`);
      } else {
        console.error(`No frames found for character type: ${this.characterType}, using fallback`);
        this.usingFallbackSprite = true;
        // í´ë°± ì¤íë¼ì´í¸ ìì±
        this.createFallbackSprite();
      }
    } else {
      console.error('Characters texture not loaded, using fallback');
      this.usingFallbackSprite = true;
      // í´ë°± ì¤íë¼ì´í¸ ìì±
      this.createFallbackSprite();
    }
  }
  
  // ì ëë©ì´ì ì¤ì 
  setupAnimations() {
    if (this.usingFallbackSprite) return;
    
    const frames = this.scene.textures.get('characters').getFrameNames();
    
    // ì±ì§ì ìºë¦­í°ì ëí ëì²´ ì ëë©ì´ì ì¤ì 
    let typePrefix = `cha_${this.characterType}_`;
    let animPrefix = this.characterType;
    
    if (this.characterType === CharacterType.PRIEST && this.alternativeSprite) {
      typePrefix = `cha_${this.alternativeSprite}_`;
      // ì ëë©ì´ì í¤ë ì¬ì í priestë¡ ì ì§ (update ë©ìëì ì¼ì¹ìí¤ê¸° ìí´)
      animPrefix = this.characterType;
    }
    
    console.log(`Setting up animations with prefix: ${typePrefix}, animPrefix: ${animPrefix}`);
    
    const typeFrames = frames.filter(frame => frame.includes(typePrefix));
    console.log(`Found ${typeFrames.length} frames with prefix ${typePrefix}:`, typeFrames);
    
    if (typeFrames.length < 1) {
      console.warn(`Not enough frames for animations with prefix ${typePrefix}`);
      return;
    }
    
    // ì ëë©ì´ì í¤ ì¤ì 
    this.walkAnimKey = `${animPrefix}_walk`;
    this.idleAnimKey = `${animPrefix}_idle`;
    this.attackAnimKey = `${animPrefix}_attack`;
    
    // ê¸°ì¡´ ì ëë©ì´ìì´ ìì¼ë©´ ì ê±°
    const animKeys = [this.walkAnimKey, this.idleAnimKey, this.attackAnimKey];
    
    animKeys.forEach(key => {
      if (this.scene.anims.exists(key)) {
        this.scene.anims.remove(key);
      }
    });
    
    // ê±·ê¸° ì ëë©ì´ì
    const walkFrames = typeFrames.filter(frame => frame.includes('walk') || frame.includes('move'));
    console.log(`Walk frames:`, walkFrames);
    
    if (walkFrames.length >= 1) {
      // í íë ìë§ ìì´ë ì ëë©ì´ì ìì± (ë°ë³µ)
      const animFrames = walkFrames.length >= 2 ? walkFrames : [...walkFrames, ...walkFrames];
      
      this.scene.anims.create({
        key: this.walkAnimKey,
        frames: this.scene.anims.generateFrameNames('characters', {
          frames: animFrames
        }),
        frameRate: 8,
        repeat: -1
      });
      
      console.log(`Created walk animation with key: ${this.walkAnimKey}`);
    } else if (typeFrames.length >= 2) {
      // ê±·ê¸° íë ìì´ ìì¼ë©´ ëª¨ë  íë ìì ì¬ì©íì¬ ê±·ê¸° ì ëë©ì´ì ìì±
      this.scene.anims.create({
        key: this.walkAnimKey,
        frames: this.scene.anims.generateFrameNames('characters', {
          frames: typeFrames
        }),
        frameRate: 8,
        repeat: -1
      });
      
      console.log(`Created fallback walk animation with key: ${this.walkAnimKey} using all frames`);
    } else {
      // íë ìì´ íëë¿ì´ë©´ ê°ì íë ìì ë ë² ì¬ì©
      this.scene.anims.create({
        key: this.walkAnimKey,
        frames: this.scene.anims.generateFrameNames('characters', {
          frames: [...typeFrames, ...typeFrames]
        }),
        frameRate: 8,
        repeat: -1
      });
      
      console.log(`Created fallback walk animation with key: ${this.walkAnimKey} using single frame`);
    }
    
    // ëê¸° ì ëë©ì´ì
    const idleFrames = typeFrames.filter(frame => frame.includes('idle') || frame.includes('stand'));
    console.log(`Idle frames:`, idleFrames);
    
    if (idleFrames.length >= 1) {
      this.scene.anims.create({
        key: this.idleAnimKey,
        frames: this.scene.anims.generateFrameNames('characters', {
          frames: idleFrames
        }),
        frameRate: 5,
        repeat: -1
      });
      
      console.log(`Created idle animation with key: ${this.idleAnimKey}`);
    } else if (typeFrames.length > 0) {
      // ëê¸° ì ëë©ì´ìì´ ìì¼ë©´ ì²« ë²ì§¸ íë ìì ì¬ì©
      this.scene.anims.create({
        key: this.idleAnimKey,
        frames: this.scene.anims.generateFrameNames('characters', {
          frames: [typeFrames[0]]
        }),
        frameRate: 5,
        repeat: -1
      });
      
      console.log(`Created fallback idle animation with key: ${this.idleAnimKey}`);
    }
    
    // ê³µê²© ì ëë©ì´ì
    const attackFrames = typeFrames.filter(frame => frame.includes('attack'));
    console.log(`Attack frames:`, attackFrames);
    
    if (attackFrames.length >= 1) {
      this.scene.anims.create({
        key: this.attackAnimKey,
        frames: this.scene.anims.generateFrameNames('characters', {
          frames: attackFrames
        }),
        frameRate: 10,
        repeat: 0
      });
      
      console.log(`Created attack animation with key: ${this.attackAnimKey}`);
    }
    
    // ê¸°ë³¸ ì ëë©ì´ì ì¬ì
    if (this.scene.anims.exists(this.idleAnimKey)) {
      this.play(this.idleAnimKey);
      console.log(`Playing idle animation: ${this.idleAnimKey}`);
    }
  }
  
  // í´ë°± ì¤íë¼ì´í¸ ìì± (íì¤ì² ë¡ë ì¤í¨ ì)
  createFallbackSprite() {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // ìºë¦­í° íìì ë°ë¼ ë¤ë¥¸ ìì ì¬ì©
    let color = 0x3498db; // ê¸°ë³¸ íëì
    
    switch (this.characterType) {
      case CharacterType.WARRIOR:
        color = 0xe74c3c; // ë¹¨ê°ì
        break;
      case CharacterType.MAGE:
        color = 0x9b59b6; // ë³´ë¼ì
        break;
      case CharacterType.PRIEST:
        color = 0xf1c40f; // ë¸ëì
        break;
      case CharacterType.GHOST:
        color = 0x1abc9c; // ì²­ë¡ì
        break;
    }
    
    // ìí ìºë¦­í° ê·¸ë¦¬ê¸°
    graphics.fillStyle(color);
    graphics.fillCircle(16, 16, 14);
    
    // íëë¦¬ ì¶ê°
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 14);
    
    // íì¤ì² ìì±
    const textureName = `player_${this.characterType}_fallback`;
    graphics.generateTexture(textureName, 32, 32);
    graphics.destroy();
    
    // ìì±ë íì¤ì² ì ì©
    this.setTexture(textureName);
  }
  
  // ìºë¦­í° íìì ë°ë¥¸ ì´ê¸° ë¥ë ¥ì¹ ì¤ì 
  setupCharacterStats() {
    switch (this.characterType) {
      case CharacterType.WARRIOR:
        // ì ì¬: ëì ì²´ë ¥, ì¤ê° ìë
        this.health = 120;
        this.maxHealth = 120;
        this.speed = 200;
        break;
      case CharacterType.MAGE:
        // ë§ë²ì¬: ë®ì ì²´ë ¥, ì¤ê° ìë, ê°ë ¥í ë§ë² ê³µê²©
        this.health = 80;
        this.maxHealth = 80;
        this.speed = 200;
        break;
      

      case CharacterType.PRIEST:
        // ì±ì§ì: ì¤ê° ì²´ë ¥, ëë¦° ìë, íë³µ ë¥ë ¥
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 180;
        break;
      case CharacterType.GHOST:
        // ì ë ¹: ë®ì ì²´ë ¥, ë¹ ë¥¸ ìë, íí¼ ë¥ë ¥
        this.health = 70;
        this.maxHealth = 70;
        this.speed = 250;
        break;
      case CharacterType.KNIGHT:
        // ê¸°ì¬: ëì ì²´ë ¥, ëë¦° ìë, ê°í ë°©ì´ë ¥
        this.health = 150;
        this.maxHealth = 150;
        this.speed = 180;
        break;
    }
    
    // ì´ê¸° ì²´ë ¥ UI ìë°ì´í¸
    gameEvents.emit('health-changed', this.health);
  }
  
  // ìºë¦­í° íìì ë°ë¥¸ ì´ê¸° ë¬´ê¸° ì¤ì 
  setupInitialWeapon() {
    this.weapons = [];
    
    switch (this.characterType) {
      case CharacterType.WARRIOR:
        // ì ì¬: ë°©í¨ ë¬´ê¸°
        this.weapons.push({
          type: 'shield',
          level: 1,
          cooldown: 1000,
          lastFired: 0
        });
        break;
      case CharacterType.MAGE:
        // ë§ë²ì¬: íì´ ë¬´ê¸° (ì±ì°ìì ë³ê²½)
        this.weapons.push({
          type: 'arrow',
          level: 1,
          cooldown: 1000,
          lastFired: 0
        });
        break;
      case CharacterType.PRIEST:
        // ì±ì§ì: ì±ì° ë¬´ê¸° (ì½í ë²ì )
        this.weapons.push({
          type: 'whip',
          level: 1,
          cooldown: 1500,
          lastFired: 0
        });
        break;
      case CharacterType.GHOST:
        // ì ë ¹: ì¹¼ ë¬´ê¸° (ë¹ ë¥¸ ë²ì )
        this.weapons.push({
          type: 'knife',
          level: 1,
          cooldown: 400,
          lastFired: 0
        });
        break;
      case CharacterType.KNIGHT:
        // ê¸°ì¬: ê² ë¬´ê¸°
        this.weapons.push({
          type: 'knife',
          level: 1,
          cooldown: 800,
          lastFired: 0
        });
        break;
      default:
        // ê¸°ë³¸: ì¹¼ ë¬´ê¸°
        this.weapons.push({
          type: 'knife',
          level: 1,
          cooldown: 500,
          lastFired: 0
        });
    }
  }

  update(delta: number) {
    // Handle movement
    const cursors = this.scene.input.keyboard.createCursorKeys();
    const keys = this.scene.input.keyboard.addKeys('W,A,S,D') as any;
    
    let vx = 0;
    let vy = 0;
    
    if (cursors.left.isDown || keys.A.isDown) {
      vx = -1;
      this.setFlipX(true);
    } else if (cursors.right.isDown || keys.D.isDown) {
      vx = 1;
      this.setFlipX(false);
    }
    
    if (cursors.up.isDown || keys.W.isDown) {
      vy = -1;
    } else if (cursors.down.isDown || keys.S.isDown) {
      vy = 1;
    }
    
    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }
    
    this.setVelocity(vx * this.speed, vy * this.speed);
    
    // ì´ë ë°©í¥ ìë°ì´í¸ (ë¬´ê¸° ë°ì¬ ë°©í¥ ê³ì°ì©)
    this.weaponManager.updatePlayerDirection(vx, vy);
    
    // ë°©í¨ ìë°ì´í¸
    this.weaponManager.updateShields(delta);
    
    // í´ë°± ì¤íë¼ì´í¸ë¥¼ ì¬ì© ì¤ì´ë©´ ì ëë©ì´ì ìë°ì´í¸ ê±´ëë°ê¸°
    if (this.usingFallbackSprite) return;
    
    // Update animation based on movement
    if (vx !== 0 || vy !== 0) {
      // ì´ë ì¤
      if (this.anims.currentAnim?.key !== this.walkAnimKey) {
        if (this.scene.anims.exists(this.walkAnimKey)) {
          console.log(`Playing walk animation: ${this.walkAnimKey}`);
          this.play(this.walkAnimKey, true);
        } else {
          console.warn(`Walk animation ${this.walkAnimKey} does not exist`);
        }
      }
    } else {
      // ì ì§ ìí
      if (this.anims.currentAnim?.key !== this.idleAnimKey) {
        if (this.scene.anims.exists(this.idleAnimKey)) {
          console.log(`Playing idle animation: ${this.idleAnimKey}`);
          this.play(this.idleAnimKey, true);
        } else {
          console.warn(`Idle animation ${this.idleAnimKey} does not exist`);
        }
      }
    }
  }

  takeDamage(amount: number) {
    // ë¬´ì  ìíë©´ ë°ë¯¸ì§ë¥¼ ë°ì§ ìì
    if (this.isInvincible) return;
    
    this.health = Math.max(0, this.health - amount);
    gameEvents.emit('health-changed', this.health);
    
    // ë°ë¯¸ì§ë¥¼ ë°ì¼ë©´ ë¬´ì  ìíë¡ ì í
    this.setInvincible();
    
    // Flash effect when taking damage
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
  }

  // ë¬´ì  ìí ì¤ì  ë©ìë
  setInvincible() {
    this.isInvincible = true;
    
    // ë¬´ì  ìí ìê°ì  íì (ê¹ë¹¡ì í¨ê³¼)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.6,
      duration: 100,
      yoyo: true,
      repeat: 5
    });
    
    // ë¬´ì  ìê° í ìí í´ì 
    this.scene.time.delayedCall(this.invincibilityDuration, () => {
      this.isInvincible = false;
      this.setAlpha(1); // ìíê° ë³µì
    });
  }

  addXP(amount: number) {
    this.xp += amount;
  }

  checkLevelUp() {
    if (this.xp >= this.xpToNextLevel) {
      this.level++;
      this.xp -= this.xpToNextLevel;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
      
      // Increase stats on level up
      this.maxHealth += 10;
      this.health = this.maxHealth;
      this.speed += 5;
      
      // Upgrade weapons or add new ones based on level
      this.upgradeWeapons();
      
      gameEvents.emit('health-changed', this.health);
      return true;
    }
    return false;
  }

  upgradeWeapons() {
    // Every 3 levels, add a new weapon type
    if (this.level % 3 === 0) {
      if (this.level === 3) {
        // ìºë¦­í° íìì ë°ë¼ ë¤ë¥¸ ë ë²ì§¸ ë¬´ê¸° ì¶ê°
        switch (this.characterType) {
          case CharacterType.WARRIOR:
            this.weapons.push({
              type: 'knife',
              level: 1,
              cooldown: 500,
              lastFired: 0
            });
            break;
          case CharacterType.MAGE:
            this.weapons.push({
              type: 'shield',
              level: 1,
              cooldown: 1200,
              lastFired: 0
            });
            break;
          case CharacterType.PRIEST:
            this.weapons.push({
              type: 'knife',
              level: 1,
              cooldown: 600,
              lastFired: 0
            });
            break;
          case CharacterType.GHOST:
            this.weapons.push({
              type: 'whip',
              level: 1,
              cooldown: 1500,
              lastFired: 0
            });
            break;
          case CharacterType.KNIGHT:
            this.weapons.push({
              type: 'shield',
              level: 1,
              cooldown: 1000,
              lastFired: 0
            });
            break;
          default:
            this.weapons.push({
              type: 'shield',
              level: 1,
              cooldown: 1000,
              lastFired: 0
            });
        }
      } else if (this.level === 6) {
        // ëª¨ë  ìºë¦­í°ìê² ì¸ ë²ì§¸ ë¬´ê¸° ì¶ê°
        const missingWeaponTypes = ['knife', 'shield', 'whip', 'arrow'].filter(
          type => !this.weapons.some(weapon => weapon.type === type)
        );
        
        if (missingWeaponTypes.length > 0) {
          const newWeaponType = missingWeaponTypes[0];
          this.weapons.push({
            type: newWeaponType,
            level: 1,
            cooldown: newWeaponType === 'knife' ? 500 : (newWeaponType === 'shield' ? 1000 : 1500),
            lastFired: 0
          });
        }
      }
    } else {
      // Otherwise upgrade a random existing weapon
      const weaponIndex = Math.floor(Math.random() * this.weapons.length);
      this.weapons[weaponIndex].level++;
      
      // Reduce cooldown slightly with each upgrade
      this.weapons[weaponIndex].cooldown = Math.max(
        100, 
        this.weapons[weaponIndex].cooldown * 0.9
      );
    }
  }

  canAttack() {
    const time = this.scene.time.now;
    return this.weapons.some(weapon => time - weapon.lastFired >= weapon.cooldown);
  }

  attack(weaponsGroup: Phaser.GameObjects.Group) {
    const time = this.scene.time.now;
    
    this.weapons.forEach(weapon => {
      if (time - weapon.lastFired >= weapon.cooldown) {
        weapon.lastFired = time;
        
        // ë°ì´í° ê¸°ë° ë¬´ê¸° ìì±
        const newWeapon = this.weaponManager.createWeapon(weapon.type, weapon.level);
        
        if (newWeapon) {
          weaponsGroup.add(newWeapon);
        }
      }
    });
  }
}
