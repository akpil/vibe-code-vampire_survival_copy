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
  private lastDirectionY: number = -1; // 기본값은 위쪽
  private movementDirectionX: number = 0;
  private movementDirectionY: number = -1; // 기본값은 위쪽
  private facingDirection: 'left' | 'right' = 'right'; // 기본값은 오른쪽
  private weaponsData: Record<string, WeaponConfig> = {};

  constructor(scene: Phaser.Scene, weaponsGroup: Phaser.GameObjects.Group, player: Phaser.Physics.Arcade.Sprite) {
    this.scene = scene;
    this.weaponsGroup = weaponsGroup;
    this.player = player;
    
    // 무기 데이터 로드
    this.loadWeaponsData();
  }
  
  // 무기 데이터 로드 메서드
  private loadWeaponsData() {
    // 씬에서 로드된 JSON 데이터 가져오기
    const weaponsData = this.scene.cache.json.get('weapons-data');
    
    if (weaponsData) {
      this.weaponsData = weaponsData;
      console.log('Weapons data loaded successfully:', Object.keys(this.weaponsData));
    } else {
      console.error('Failed to load weapons data from cache');
      // 기본 무기 데이터 설정 (폴백)
      this.setupDefaultWeaponsData();
    }
  }
  
  // 기본 무기 데이터 설정 (데이터 로드 실패 시)
  private setupDefaultWeaponsData() {
    this.weaponsData = {
      "knife": {
        "type": "projectile",
        "name": "칼",
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
        "name": "방패",
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
        "name": "채찍",
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
        "name": "화살",
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
    // 이동 방향 저장 (0이 아닌 경우에만 업데이트)
    if (directionX !== 0 || directionY !== 0) {
      this.movementDirectionX = directionX;
      this.movementDirectionY = directionY;
      this.lastDirectionX = directionX;
      this.lastDirectionY = directionY;
    }
    
    // 캐릭터가 바라보는 방향 업데이트 (좌우 방향만)
    if (directionX < 0) {
      this.facingDirection = 'left';
    } else if (directionX > 0) {
      this.facingDirection = 'right';
    }
    // directionX가 0인 경우 facingDirection은 변경하지 않음 (이전 방향 유지)
  }

  public updateShields(delta: number): void {
    // 활성화된 방패 무기 확인 및 정리 - 비활성 방패만 제거
    this.activeShields = this.activeShields.filter(shield => shield.active);
    
    // 방패 각도 업데이트 - 기준 각도만 회전시키고 각 방패의 상대적 위치는 유지
    if (this.activeShields.length > 0) {
      // 기준 각도 업데이트 (회전 속도 증가)
      this.shieldBaseAngle += 0.03;
      
      // 각 방패의 각도 업데이트
      const angleStep = (Math.PI * 2) / this.activeShields.length;
      
      this.activeShields.forEach((shield, index) => {
        // 각 방패의 상대적 위치 계산 (기준 각도 + 인덱스별 오프셋)
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

    // 무기 데이터 계산
    const damage = config.damage + (level - 1) * config.damagePerLevel;
    
    // 타겟팅 방식에 따른 각도 계산
    let angle = 0;
    let target = null;
    
    switch (config.targeting) {
      case 'nearest':
        // 가장 가까운 적 찾기
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
          // 적이 없으면 마지막 방향 또는 위쪽으로
          angle = Math.atan2(this.lastDirectionY, this.lastDirectionX);
        }
        break;
        
      case 'facing':
        // 캐릭터가 바라보는 방향 (좌/우)
        if (this.facingDirection === 'left') {
          angle = Math.PI; // 왼쪽 (180도)
        } else {
          angle = 0; // 오른쪽 (0도)
        }
        break;
        
      case 'movement':
        // 캐릭터의 이동 벡터 방향
        angle = Math.atan2(this.movementDirectionY, this.movementDirectionX);
        break;
        
      case 'forward':
        // 캐릭터가 바라보는 방향 (상하좌우)
        angle = Math.atan2(this.lastDirectionY, this.lastDirectionX);
        break;
        
      default:
        // 기본값은 무작위 방향
        angle = Math.random() * Math.PI * 2;
    }

    // 무기 타입에 따른 생성
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
    
    // 추가 설정
    if (config.scale) weapon.setScale(config.scale);
    // 회전 설정은 이제 Weapon 클래스에서 처리 (knife는 발사 방향에 45도 추가)
    if (config.tint) weapon.setTint(parseInt(config.tint));
    if (config.body) weapon.body.setSize(config.body.width, config.body.height);
    
    // 애니메이션 설정
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
    
    // 수명 설정
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
    // 방패 개수 계산 (레벨에 따라 증가)
    const count = Math.floor(config.baseCount! + Math.floor(level / 2) * config.countPerLevel!);
    
    // 현재 활성화된 방패 개수 확인
    if (this.activeShields.length >= count) {
      // 이미 충분한 방패가 있으면 새로 생성하지 않음
      return null;
    }
    
    // 필요한 방패만 추가 생성
    const newShieldsCount = count - this.activeShields.length;
    
    // 방패 간 균등한 각도 분배를 위한 계산
    const totalShields = this.activeShields.length + newShieldsCount;
    const angleStep = (Math.PI * 2) / totalShields;
    
    // 마지막으로 생성된 방패 반환
    let lastShield: Weapon | null = null;
    
    for (let i = 0; i < newShieldsCount; i++) {
      // 새 방패의 인덱스 계산
      const shieldIndex = this.activeShields.length + i;
      
      // 방패의 초기 각도 설정 (기준 각도 + 인덱스별 오프셋)
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
      
      // 방패 회전 속도 설정 - 레벨에 따라 증가
      shield.orbitSpeed = config.orbitSpeed! + (level * config.orbitSpeedPerLevel!);
      
      // 크기 설정
      if (config.scale) shield.setScale(config.scale);
      
      // 활성 방패 배열에 추가
      this.activeShields.push(shield);
      lastShield = shield;
    }
    
    return lastShield;
  }
}
