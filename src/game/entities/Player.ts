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
  
  // 무적 상태 관련 변수
  private isInvincible: boolean = false;
  private invincibilityDuration: number = 1000; // 1초 동안 무적
  
  constructor(scene: Phaser.Scene, x: number, y: number, characterType: CharacterType = CharacterType.WARRIOR) {
    // 아틀라스에서 캐릭터 타입에 맞는 첫 번째 프레임으로 초기화
    super(scene, x, y, 'characters');
    this.characterType = characterType;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 맵 경계 내에서만 이동하도록 설정
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.setScale(1.5);
    
    // 스프라이트가 보이는지 확인
    this.setAlpha(1);
    this.setVisible(true);
    
    // Set up physics body
    this.body.setSize(20, 20);
    this.body.setOffset(6, 12);
    
    // 아틀라스 텍스처 설정
    this.setupCharacterSprite();
    
    // 캐릭터 타입에 따른 초기 능력치 설정
    this.setupCharacterStats();
    
    // Set up initial weapon
    this.setupInitialWeapon();
  }
  
  // 캐릭터 스프라이트 설정
  setupCharacterSprite() {
    if (this.scene.textures.exists('characters')) {
      const frames = this.scene.textures.get('characters').getFrameNames();
      console.log('Available frames for player:', frames);
      
      // 캐릭터 타입에 맞는 프레임 찾기
      const typePrefix = `cha_${this.characterType}_`;
      const typeFrames = frames.filter(frame => frame.includes(typePrefix));
      
      if (typeFrames.length > 0) {
        this.usingFallbackSprite = false;
        // 첫 번째 프레임으로 텍스처 설정
        this.setTexture('characters', typeFrames[0]);
        console.log(`Using character sprite: ${typeFrames[0]}`);
      } else {
        console.error(`No frames found for character type: ${this.characterType}, using fallback`);
        this.usingFallbackSprite = true;
        // 폴백 스프라이트 생성
        this.createFallbackSprite();
      }
    } else {
      console.error('Characters texture not loaded, using fallback');
      this.usingFallbackSprite = true;
      // 폴백 스프라이트 생성
      this.createFallbackSprite();
    }
  }
  
  // 폴백 스프라이트 생성 (텍스처 로드 실패 시)
  createFallbackSprite() {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    
    // 캐릭터 타입에 따라 다른 색상 사용
    let color = 0x3498db; // 기본 파란색
    
    switch (this.characterType) {
      case CharacterType.WARRIOR:
        color = 0xe74c3c; // 빨간색
        break;
      case CharacterType.MAGE:
        color = 0x9b59b6; // 보라색
        break;
      case CharacterType.PRIEST:
        color = 0xf1c40f; // 노란색
        break;
      case CharacterType.GHOST:
        color = 0x1abc9c; // 청록색
        break;
    }
    
    // 원형 캐릭터 그리기
    graphics.fillStyle(color);
    graphics.fillCircle(16, 16, 14);
    
    // 테두리 추가
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 14);
    
    // 텍스처 생성
    const textureName = `player_${this.characterType}_fallback`;
    graphics.generateTexture(textureName, 32, 32);
    graphics.destroy();
    
    // 생성된 텍스처 적용
    this.setTexture(textureName);
  }
  
  // 캐릭터 타입에 따른 초기 능력치 설정
  setupCharacterStats() {
    switch (this.characterType) {
      case CharacterType.WARRIOR:
        // 전사: 높은 체력, 중간 속도
        this.health = 120;
        this.maxHealth = 120;
        this.speed = 200;
        break;
      case CharacterType.MAGE:
        // 마법사: 낮은 체력, 중간 속도, 강력한 마법 공격
        this.health = 80;
        this.maxHealth = 80;
        this.speed = 200;
        break;
      case CharacterType.PRIEST:
        // 성직자: 중간 체력, 느린 속도, 회복 능력
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 180;
        break;
      case CharacterType.GHOST:
        // 유령: 낮은 체력, 빠른 속도, 회피 능력
        this.health = 70;
        this.maxHealth = 70;
        this.speed = 250;
        break;
    }
    
    // 초기 체력 UI 업데이트
    gameEvents.emit('health-changed', this.health);
  }
  
  // 캐릭터 타입에 따른 초기 무기 설정
  setupInitialWeapon() {
    this.weapons = [];
    
    switch (this.characterType) {
      case CharacterType.WARRIOR:
        // 전사: 도끼 무기
        this.weapons.push({
          type: 'axe',
          level: 1,
          cooldown: 1000,
          lastFired: 0
        });
        break;
      case CharacterType.MAGE:
        // 마법사: 마법 무기
        this.weapons.push({
          type: 'magic',
          level: 1,
          cooldown: 1200,
          lastFired: 0
        });
        break;
      case CharacterType.PRIEST:
        // 성직자: 마법 무기 (약한 버전)
        this.weapons.push({
          type: 'magic',
          level: 1,
          cooldown: 1500,
          lastFired: 0
        });
        break;
      case CharacterType.GHOST:
        // 유령: 칼 무기 (빠른 버전)
        this.weapons.push({
          type: 'knife',
          level: 1,
          cooldown: 400,
          lastFired: 0
        });
        break;
      default:
        // 기본: 칼 무기
        this.weapons.push({
          type: 'knife',
          level: 1,
          cooldown: 500,
          lastFired: 0
        });
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
    // 무적 상태면 데미지를 받지 않음
    if (this.isInvincible) return;
    
    this.health = Math.max(0, this.health - amount);
    gameEvents.emit('health-changed', this.health);
    
    // 데미지를 받으면 무적 상태로 전환
    this.setInvincible();
    
    // Flash effect when taking damage
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
  }

  // 무적 상태 설정 메서드
  setInvincible() {
    this.isInvincible = true;
    
    // 무적 상태 시각적 표시 (깜빡임 효과)
    this.scene.tweens.add({
      targets: this,
      alpha: 0.6,
      duration: 100,
      yoyo: true,
      repeat: 5
    });
    
    // 무적 시간 후 상태 해제
    this.scene.time.delayedCall(this.invincibilityDuration, () => {
      this.isInvincible = false;
      this.setAlpha(1); // 알파값 복원
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
        // 캐릭터 타입에 따라 다른 두 번째 무기 추가
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
              type: 'axe',
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
              type: 'magic',
              level: 1,
              cooldown: 1500,
              lastFired: 0
            });
            break;
          default:
            this.weapons.push({
              type: 'axe',
              level: 1,
              cooldown: 1000,
              lastFired: 0
            });
        }
      } else if (this.level === 6) {
        // 모든 캐릭터에게 세 번째 무기 추가
        const missingWeaponTypes = ['knife', 'axe', 'magic'].filter(
          type => !this.weapons.some(weapon => weapon.type === type)
        );
        
        if (missingWeaponTypes.length > 0) {
          const newWeaponType = missingWeaponTypes[0];
          this.weapons.push({
            type: newWeaponType,
            level: 1,
            cooldown: newWeaponType === 'knife' ? 500 : newWeaponType === 'axe' ? 1000 : 1500,
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
