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
  
  // 무적 상태 관련 변수
  private isInvincible: boolean = false;
  private invincibilityDuration: number = 1000; // 1초 동안 무적
  
  // 애니메이션 키 저장 변수 추가
  private walkAnimKey: string;
  private idleAnimKey: string;
  private attackAnimKey: string;
  
  // 무기 관리자
  private weaponManager: WeaponManager;
  
  constructor(scene: Phaser.Scene, x: number, y: number, weaponsGroup: Phaser.GameObjects.Group, characterType: CharacterType = CharacterType.WARRIOR) {
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
    
    // 무기 관리자 초기화
    this.weaponManager = new WeaponManager(scene, weaponsGroup, this);
    
    // 아틀라스 텍스처 설정
    this.setupCharacterSprite();
    
    // 캐릭터 타입에 따른 초기 능력치 설정
    this.setupCharacterStats();
    
    // Set up initial weapon
    this.setupInitialWeapon();
    
    // 애니메이션 설정
    this.setupAnimations();
    
    // 방패 텍스처 로드 확인 및 생성
    this.preloadShieldTexture();
  }
  
  // 방패 텍스처 로드 확인 및 생성
  preloadShieldTexture() {
    if (!this.scene.textures.exists('shield')) {
      // 방패 텍스처 생성
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      
      // 방패 모양 그리기
      graphics.fillStyle(0x3498db); // 파란색
      graphics.fillRect(0, 0, 24, 24);
      
      // 테두리 추가
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeRect(0, 0, 24, 24);
      
      // 방패 디테일 추가
      graphics.fillStyle(0xf39c12); // 노란색
      graphics.fillCircle(12, 12, 6);
      
      // 텍스처 생성
      graphics.generateTexture('shield', 24, 24);
      graphics.destroy();
      
      console.log('Created shield texture');
    }
  }
  
  // 캐릭터 스프라이트 설정
  setupCharacterSprite() {
    if (this.scene.textures.exists('characters')) {
      const frames = this.scene.textures.get('characters').getFrameNames();
      console.log('Available frames for player:', frames);
      
      // 성직자 캐릭터에 대한 대체 스프라이트 설정
      if (this.characterType === CharacterType.PRIEST) {
        // 'monk' 스프라이트를 성직자 캐릭터로 사용
        const monkFrames = frames.filter(frame => frame.includes('cha_monk_'));
        if (monkFrames.length > 0) {
          this.alternativeSprite = 'monk';
          this.usingFallbackSprite = false;
          this.setTexture('characters', monkFrames[0]);
          console.log(`Using monk sprite for priest: ${monkFrames[0]}`);
          return;
        }
        
        // 'monk'가 없으면 'knight' 스프라이트 시도
        const knightFrames = frames.filter(frame => frame.includes('cha_knight_'));
        if (knightFrames.length > 0) {
          this.alternativeSprite = 'knight';
          this.usingFallbackSprite = false;
          this.setTexture('characters', knightFrames[0]);
          console.log(`Using knight sprite for priest: ${knightFrames[0]}`);
          return;
        }
      }
      
      // 일반적인 캐릭터 타입 처리
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
  
  // 애니메이션 설정
  setupAnimations() {
    if (this.usingFallbackSprite) return;
    
    const frames = this.scene.textures.get('characters').getFrameNames();
    
    // 성직자 캐릭터에 대한 대체 애니메이션 설정
    let typePrefix = `cha_${this.characterType}_`;
    let animPrefix = this.characterType;
    
    if (this.characterType === CharacterType.PRIEST && this.alternativeSprite) {
      typePrefix = `cha_${this.alternativeSprite}_`;
      // 애니메이션 키는 여전히 priest로 유지 (update 메서드와 일치시키기 위해)
      animPrefix = this.characterType;
    }
    
    console.log(`Setting up animations with prefix: ${typePrefix}, animPrefix: ${animPrefix}`);
    
    const typeFrames = frames.filter(frame => frame.includes(typePrefix));
    console.log(`Found ${typeFrames.length} frames with prefix ${typePrefix}:`, typeFrames);
    
    if (typeFrames.length < 1) {
      console.warn(`Not enough frames for animations with prefix ${typePrefix}`);
      return;
    }
    
    // 애니메이션 키 설정
    this.walkAnimKey = `${animPrefix}_walk`;
    this.idleAnimKey = `${animPrefix}_idle`;
    this.attackAnimKey = `${animPrefix}_attack`;
    
    // 기존 애니메이션이 있으면 제거
    const animKeys = [this.walkAnimKey, this.idleAnimKey, this.attackAnimKey];
    
    animKeys.forEach(key => {
      if (this.scene.anims.exists(key)) {
        this.scene.anims.remove(key);
      }
    });
    
    // 걷기 애니메이션
    const walkFrames = typeFrames.filter(frame => frame.includes('walk') || frame.includes('move'));
    console.log(`Walk frames:`, walkFrames);
    
    if (walkFrames.length >= 1) {
      // 한 프레임만 있어도 애니메이션 생성 (반복)
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
      // 걷기 프레임이 없으면 모든 프레임을 사용하여 걷기 애니메이션 생성
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
      // 프레임이 하나뿐이면 같은 프레임을 두 번 사용
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
    
    // 대기 애니메이션
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
      // 대기 애니메이션이 없으면 첫 번째 프레임을 사용
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
    
    // 공격 애니메이션
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
    
    // 기본 애니메이션 재생
    if (this.scene.anims.exists(this.idleAnimKey)) {
      this.play(this.idleAnimKey);
      console.log(`Playing idle animation: ${this.idleAnimKey}`);
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
      case CharacterType.KNIGHT:
        // 기사: 높은 체력, 느린 속도, 강한 방어력
        this.health = 150;
        this.maxHealth = 150;
        this.speed = 180;
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
        // 전사: 방패 무기
        this.weapons.push({
          type: 'shield',
          level: 1,
          cooldown: 1000,
          lastFired: 0
        });
        break;
      case CharacterType.MAGE:
        // 마법사: 화살 무기 (채찍에서 변경)
        this.weapons.push({
          type: 'arrow',
          level: 1,
          cooldown: 1000,
          lastFired: 0
        });
        break;
      case CharacterType.PRIEST:
        // 성직자: 채찍 무기 (약한 버전)
        this.weapons.push({
          type: 'whip',
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
      case CharacterType.KNIGHT:
        // 기사: 검 무기
        this.weapons.push({
          type: 'knife',
          level: 1,
          cooldown: 800,
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
    
    // 이동 방향 업데이트 (무기 발사 방향 계산용)
    this.weaponManager.updatePlayerDirection(vx, vy);
    
    // 방패 업데이트
    this.weaponManager.updateShields(delta);
    
    // 폴백 스프라이트를 사용 중이면 애니메이션 업데이트 건너뛰기
    if (this.usingFallbackSprite) return;
    
    // Update animation based on movement
    if (vx !== 0 || vy !== 0) {
      // 이동 중
      if (this.anims.currentAnim?.key !== this.walkAnimKey) {
        if (this.scene.anims.exists(this.walkAnimKey)) {
          console.log(`Playing walk animation: ${this.walkAnimKey}`);
          this.play(this.walkAnimKey, true);
        } else {
          console.warn(`Walk animation ${this.walkAnimKey} does not exist`);
        }
      }
    } else {
      // 정지 상태
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
        // 모든 캐릭터에게 세 번째 무기 추가
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
        
        // 데이터 기반 무기 생성
        const newWeapon = this.weaponManager.createWeapon(weapon.type, weapon.level);
        
        if (newWeapon) {
          weaponsGroup.add(newWeapon);
        }
      }
    });
  }
}
