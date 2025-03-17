import Phaser from 'phaser';
import { Weapon } from './Weapon';
import { gameEvents } from '../events';
import { CharacterType } from '../types/CharacterType';

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
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // 캐릭터 타입 설정 (기본값: 전사)
    const characterType = CharacterType.WARRIOR;
    
    // 스프라이트 생성 - 기본 텍스처로 생성하고 나중에 프레임 설정
    super(scene, x, y, 'player');
    this.characterType = characterType;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.setScale(1.5);
    
    // 스프라이트가 보이는지 확인
    this.setAlpha(1);
    this.setVisible(true);
    
    // Set up physics body
    this.body.setSize(20, 20);
    this.body.setOffset(6, 12);
    
    // 텍스처가 로드되었는지 확인 후 애니메이션 설정
    if (scene.textures.exists('characters')) {
      const frames = scene.textures.get('characters').getFrameNames();
      console.log('Available frames for player:', frames);
      
      // 프레임이 존재하는지 확인
      const typeFrames = frames.filter(frame => frame.includes(`cha_${characterType}_`));
      
      if (typeFrames.length > 0) {
        this.usingFallbackSprite = false;
        this.setTexture('characters', typeFrames[0]);
        console.log(`Using character sprite: ${typeFrames[0]}`);
        this.setupAnimations(typeFrames);
      } else {
        console.error(`No frames found for character type: ${characterType}, using fallback`);
        this.usingFallbackSprite = true;
      }
    } else {
      console.error('Characters texture not loaded, using fallback');
      this.usingFallbackSprite = true;
    }
    
    // Set up initial weapon
    this.weapons.push({
      type: 'knife',
      level: 1,
      cooldown: 500,
      lastFired: 0
    });
  }

  // 애니메이션 설정
  setupAnimations(typeFrames: string[]) {
    const type = this.characterType;
    
    if (typeFrames.length === 0) {
      console.error(`No frames found for character type: ${type}`);
      return;
    }
    
    // 이미 애니메이션이 존재하는지 확인
    const walkKey = `${type}_walk`;
    const idleKey = `${type}_idle`;
    
    if (!this.scene.anims.exists(walkKey)) {
      // 걷기 애니메이션 생성
      try {
        this.scene.anims.create({
          key: walkKey,
          frames: this.scene.anims.generateFrameNames('characters', {
            frames: typeFrames.slice(0, Math.min(4, typeFrames.length))
          }),
          frameRate: 8,
          repeat: -1
        });
        console.log(`Created walk animation: ${walkKey} with frames:`, typeFrames.slice(0, Math.min(4, typeFrames.length)));
      } catch (error) {
        console.error(`Error creating walk animation: ${error}`);
      }
    }
    
    if (!this.scene.anims.exists(idleKey)) {
      // 대기 애니메이션 생성
      try {
        this.scene.anims.create({
          key: idleKey,
          frames: this.scene.anims.generateFrameNames('characters', {
            frames: [typeFrames[0]]
          }),
          frameRate: 1,
          repeat: 0
        });
        console.log(`Created idle animation: ${idleKey} with frame: ${typeFrames[0]}`);
      } catch (error) {
        console.error(`Error creating idle animation: ${error}`);
      }
    }
    
    // 초기 애니메이션 재생 시도
    try {
      if (this.scene.anims.exists(idleKey)) {
        this.play(idleKey);
        console.log(`Playing animation: ${idleKey}`);
      } else {
        console.error(`Animation ${idleKey} does not exist`);
      }
    } catch (error) {
      console.error(`Error playing animation: ${error}`);
    }
  }

  update() {
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
    
    // 폴백 스프라이트를 사용 중이면 애니메이션 업데이트 건너뛰기
    if (this.usingFallbackSprite) return;
    
    // Update animation based on movement
    const type = this.characterType;
    const walkKey = `${type}_walk`;
    const idleKey = `${type}_idle`;
    
    if (vx === 0 && vy === 0) {
      if (this.anims.currentAnim?.key !== idleKey && this.scene.anims.exists(idleKey)) {
        this.play(idleKey);
      }
    } else {
      if (this.anims.currentAnim?.key !== walkKey && this.scene.anims.exists(walkKey)) {
        this.play(walkKey);
      }
    }
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    gameEvents.emit('health-changed', this.health);
    
    // Flash effect when taking damage
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
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
        this.weapons.push({
          type: 'axe',
          level: 1,
          cooldown: 1000,
          lastFired: 0
        });
      } else if (this.level === 6) {
        this.weapons.push({
          type: 'magic',
          level: 1,
          cooldown: 1500,
          lastFired: 0
        });
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
        
        switch (weapon.type) {
          case 'knife':
            this.fireKnife(weaponsGroup, weapon.level);
            break;
          case 'axe':
            this.fireAxe(weaponsGroup, weapon.level);
            break;
          case 'magic':
            this.fireMagic(weaponsGroup, weapon.level);
            break;
        }
      }
    });
  }

  fireKnife(weaponsGroup: Phaser.GameObjects.Group, level: number) {
    // Fire in the direction the player is facing or moving
    const angle = Math.random() * Math.PI * 2;
    const speed = 300;
    const damage = 20 + (level - 1) * 5;
    
    const knife = new Weapon(
      this.scene,
      this.x,
      this.y,
      'knife',
      damage,
      angle,
      speed,
      true
    );
    
    weaponsGroup.add(knife);
  }

  fireAxe(weaponsGroup: Phaser.GameObjects.Group, level: number) {
    // Axes orbit around the player
    const count = 1 + Math.floor(level / 2);
    const damage = 30 + (level - 1) * 8;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const axe = new Weapon(
        this.scene,
        this.x,
        this.y,
        'axe',
        damage,
        angle,
        0,
        false,
        true,
        this
      );
      
      weaponsGroup.add(axe);
    }
  }

  fireMagic(weaponsGroup: Phaser.GameObjects.Group, level: number) {
    // Magic targets nearest enemies
    const count = level;
    const damage = 25 + (level - 1) * 7;
    const speed = 200;
    
    // Find nearest enemies
    const enemies = this.scene.children.getChildren()
      .filter(child => child.constructor.name === 'Enemy')
      .sort((a: any, b: any) => {
        const distA = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
        const distB = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y);
        return distA - distB;
      })
      .slice(0, count);
    
    enemies.forEach((enemy: any) => {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
      
      const magic = new Weapon(
        this.scene,
        this.x,
        this.y,
        'magic',
        damage,
        angle,
        speed,
        true,
        false
      );
      
      weaponsGroup.add(magic);
    });
  }
}
