import Phaser from 'phaser';
import { Weapon } from '../entities/Weapon';
import { Enemy } from '../entities/Enemy';

export class WeaponManager {
  private scene: Phaser.Scene;
  private weaponsGroup: Phaser.GameObjects.Group;
  private player: Phaser.GameObjects.GameObject;
  private shields: Weapon[] = [];
  private playerDirection: { x: number, y: number } = { x: 1, y: 0 };
  private shieldAngles: number[] = [];
  private playerFacingLeft: boolean = false;
  
  constructor(scene: Phaser.Scene, weaponsGroup: Phaser.GameObjects.Group, player: Phaser.GameObjects.GameObject) {
    this.scene = scene;
    this.weaponsGroup = weaponsGroup;
    this.player = player;
  }
  
  // 플레이어 방향 업데이트
  updatePlayerDirection(x: number, y: number) {
    if (x !== 0 || y !== 0) {
      this.playerDirection = { x, y };
      // Update player facing direction
      if (x < 0) {
        this.playerFacingLeft = true;
      } else if (x > 0) {
        this.playerFacingLeft = false;
      }
    }
  }
  
  // 방패 업데이트
  updateShields(delta: number) {
    // 방패 회전 속도 (라디안/밀리초)
    const rotationSpeed = 0.003;
    
    // 각 방패의 각도 업데이트
    for (let i = 0; i < this.shieldAngles.length; i++) {
      this.shieldAngles[i] += rotationSpeed * delta;
      
      // 각도가 2π를 넘어가면 리셋
      if (this.shieldAngles[i] > Math.PI * 2) {
        this.shieldAngles[i] -= Math.PI * 2;
      }
    }
    
    // 방패 위치 업데이트
    for (let i = 0; i < this.shields.length; i++) {
      const shield = this.shields[i];
      if (shield && shield.active) {
        shield.orbitAngle = this.shieldAngles[i];
      } else {
        // 비활성화된 방패 제거
        this.shields.splice(i, 1);
        this.shieldAngles.splice(i, 1);
        i--;
      }
    }
  }
  
  // 무기 생성
  createWeapon(type: string, level: number): Weapon | null {
    const playerSprite = this.player as Phaser.Physics.Arcade.Sprite;
    
    // 무기 데이터 가져오기
    let weaponData = this.getWeaponData(type, level);
    
    if (!weaponData) {
      console.error(`Weapon data not found for type: ${type}, level: ${level}`);
      return null;
    }
    
    // 무기 타입에 따른 처리
    switch (type) {
      case 'knife':
        return this.createKnife(playerSprite, weaponData);
      case 'shield':
        return this.createShield(playerSprite, weaponData);
      case 'whip':
        return this.createWhip(playerSprite, weaponData);
      case 'arrow':
        return this.createArrow(playerSprite, weaponData);
      default:
        console.error(`Unknown weapon type: ${type}`);
        return null;
    }
  }
  
  // 무기 데이터 가져오기
  private getWeaponData(type: string, level: number) {
    // 무기 데이터 로드
    let weaponsData;
    try {
      weaponsData = this.scene.cache.json.get('weapons-data');
    } catch (error) {
      console.error('Failed to load weapons data:', error);
      return null;
    }
    
    if (!weaponsData || !weaponsData[type]) {
      // 기본 무기 데이터 사용
      return this.getDefaultWeaponData(type, level);
    }
    
    const weaponTypeData = weaponsData[type];
    const levelKey = `level${level}`;
    
    if (!weaponTypeData[levelKey]) {
      // 해당 레벨 데이터가 없으면 기본 데이터 사용
      return this.getDefaultWeaponData(type, level);
    }
    
    return weaponTypeData[levelKey];
  }
  
  // 기본 무기 데이터
  private getDefaultWeaponData(type: string, level: number) {
    const baseDamage = type === 'knife' ? 10 : (type === 'shield' ? 5 : (type === 'whip' ? 15 : 20));
    const baseSpeed = type === 'knife' ? 300 : (type === 'shield' ? 0 : (type === 'whip' ? 0 : 400));
    const baseCount = type === 'shield' ? Math.min(level, 5) : 1;
    
    return {
      damage: baseDamage + (level - 1) * 5,
      speed: baseSpeed,
      count: baseCount,
      angle: 0,
      destroyOnHit: type !== 'shield' && type !== 'whip'
    };
  }
  
  // 칼 생성
  private createKnife(playerSprite: Phaser.Physics.Arcade.Sprite, weaponData: any): Weapon {
    // 플레이어 방향 또는 마우스 방향으로 발사
    const angle = this.getDirectionAngle();
    
    return new Weapon(
      this.scene,
      playerSprite.x,
      playerSprite.y,
      'knife',
      weaponData.damage,
      angle,
      weaponData.speed,
      weaponData.destroyOnHit
    );
  }
  
  // 방패 생성
  private createShield(playerSprite: Phaser.Physics.Arcade.Sprite, weaponData: any): Weapon | null {
    // 이미 최대 개수의 방패가 있는지 확인
    if (this.shields.length >= weaponData.count) {
      return null;
    }
    
    // 방패 간 각도 간격 계산
    const angleStep = (Math.PI * 2) / weaponData.count;
    
    // 새 방패의 시작 각도 계산
    let startAngle = 0;
    if (this.shieldAngles.length > 0) {
      // 기존 방패들 사이에 균등하게 배치
      const gaps = this.findLargestAngleGap();
      startAngle = gaps.start + (gaps.size / 2);
    }
    
    // 방패 생성
    const shield = new Weapon(
      this.scene,
      playerSprite.x,
      playerSprite.y,
      'shield',
      weaponData.damage,
      startAngle,
      0,
      false,
      true,
      playerSprite
    );
    
    // 방패 및 각도 추가
    this.shields.push(shield);
    this.shieldAngles.push(startAngle);
    
    return shield;
  }
  
  // 가장 큰 각도 간격 찾기
  private findLargestAngleGap(): { start: number, size: number } {
    if (this.shieldAngles.length === 0) {
      return { start: 0, size: Math.PI * 2 };
    }
    
    // 각도 정렬
    const sortedAngles = [...this.shieldAngles].sort((a, b) => a - b);
    
    // 각도 간격 계산
    let maxGap = { start: 0, size: 0 };
    
    for (let i = 0; i < sortedAngles.length; i++) {
      const current = sortedAngles[i];
      const next = sortedAngles[(i + 1) % sortedAngles.length];
      
      // 다음 각도가 더 작으면 2π 더하기
      let gap = next > current ? next - current : next + Math.PI * 2 - current;
      
      if (gap > maxGap.size) {
        maxGap = { start: current, size: gap };
      }
    }
    
    return maxGap;
  }
  
  // 채찍 생성
  private createWhip(playerSprite: Phaser.Physics.Arcade.Sprite, weaponData: any): Weapon {
    // Get the player's facing direction
    const angle = this.getDirectionAngle();
    
    // Calculate position offset based on player's direction
    // This ensures the whip appears in front of the character
    const offsetDistance = 30; // Distance from player center
    const offsetX = Math.cos(angle) * offsetDistance;
    const offsetY = Math.sin(angle) * offsetDistance;
    
    // Create the whip at the offset position
    const whip = new Weapon(
      this.scene,
      playerSprite.x + offsetX,
      playerSprite.y + offsetY,
      'whip',
      weaponData.damage,
      angle,
      0, // Whip doesn't move
      true
    );
    
    // Flip the whip if player is facing left
    if (this.playerFacingLeft) {
      whip.setFlipX(true);
    }
    
    return whip;
  }
  
  // 화살 생성
  private createArrow(playerSprite: Phaser.Physics.Arcade.Sprite, weaponData: any): Weapon {
    // 가장 가까운 적을 찾아 타겟팅
    const angle = this.getNearestEnemyAngle(playerSprite);
    
    // 디버깅 로그 추가
    console.log(`Arrow created with angle: ${angle * (180 / Math.PI)}°`);
    
    return new Weapon(
      this.scene,
      playerSprite.x,
      playerSprite.y,
      'arrow',
      weaponData.damage,
      angle,
      weaponData.speed,
      weaponData.destroyOnHit
    );
  }
  
  // 가장 가까운 적의 방향 각도 계산
  private getNearestEnemyAngle(playerSprite: Phaser.Physics.Arcade.Sprite): number {
    // 적 그룹 가져오기 - Enemy 클래스 인스턴스만 필터링
    const enemies = this.scene.children.getChildren()
      .filter(child => child instanceof Enemy && child.active);
    
    // 디버깅 로그 추가
    console.log(`Found ${enemies.length} active enemies`);
    
    if (enemies.length === 0) {
      // 적이 없으면 플레이어 방향 또는 랜덤 방향 사용
      const randomAngle = this.getRandomAngle();
      console.log(`No enemies found, using random angle: ${randomAngle * (180 / Math.PI)}°`);
      return randomAngle;
    }
    
    // 가장 가까운 적 찾기
    let nearestEnemy = null;
    let minDistance = Number.MAX_VALUE;
    
    for (const enemy of enemies) {
      const enemySprite = enemy as Enemy;
      const distance = Phaser.Math.Distance.Between(
        playerSprite.x, playerSprite.y,
        enemySprite.x, enemySprite.y
      );
      
      // 디버깅 로그 추가
      console.log(`Enemy at (${enemySprite.x}, ${enemySprite.y}), distance: ${distance}`);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestEnemy = enemySprite;
      }
    }
    
    if (nearestEnemy) {
      // 가장 가까운 적 방향으로 각도 계산
      const targetAngle = Phaser.Math.Angle.Between(
        playerSprite.x, playerSprite.y,
        nearestEnemy.x, nearestEnemy.y
      );
      
      console.log(`Targeting nearest enemy at (${nearestEnemy.x}, ${nearestEnemy.y}), angle: ${targetAngle * (180 / Math.PI)}°`);
      return targetAngle;
    }
    
    // 적을 찾지 못한 경우 플레이어 방향 사용
    const directionAngle = this.getDirectionAngle();
    console.log(`Fallback to player direction angle: ${directionAngle * (180 / Math.PI)}°`);
    return directionAngle;
  }
  
  // 방향 각도 계산
  private getDirectionAngle(): number {
    // 플레이어 방향이 있으면 사용
    if (this.playerDirection.x !== 0 || this.playerDirection.y !== 0) {
      return Math.atan2(this.playerDirection.y, this.playerDirection.x);
    }
    
    // 기본 방향 (오른쪽)
    return 0;
  }
  
  // 랜덤 각도 생성 (적이 없을 때 사용)
  private getRandomAngle(): number {
    // 8방향 중 하나를 랜덤하게 선택
    const directions = [
      0,              // 오른쪽
      Math.PI / 4,    // 오른쪽 아래
      Math.PI / 2,    // 아래
      3 * Math.PI / 4, // 왼쪽 아래
      Math.PI,        // 왼쪽
      5 * Math.PI / 4, // 왼쪽 위
      3 * Math.PI / 2, // 위
      7 * Math.PI / 4  // 오른쪽 위
    ];
    
    return directions[Math.floor(Math.random() * directions.length)];
  }
}
