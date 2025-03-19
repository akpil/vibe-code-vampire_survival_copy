import Phaser from 'phaser';
import { CharacterType } from '../types/CharacterType';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  health: number;
  maxHealth: number;
  speed: number = 100;
  damage: number = 10;
  private characterType: CharacterType;
  
  constructor(scene: Phaser.Scene, x: number, y: number, type: string, health: number) {
    // Enemy type to character type mapping
    let characterType: CharacterType;
    let initialFrame: string = '';
    
    if (type === 'enemy1') {
      characterType = CharacterType.GHOST;
    } else if (type === 'enemy2') {
      characterType = CharacterType.SKELETON;
    } else {
      // enemy3는 DEMON으로 매핑하지만, 프레임이 없을 경우 대체 타입 사용
      characterType = CharacterType.DEMON;
    }
    
    // 아틀라스에서 프레임 찾기
    if (scene.textures.exists('characters')) {
      const frames = scene.textures.get('characters').getFrameNames();
      
      // 적 타입에 따른 프레임 검색 패턴 정의
      const searchPatterns = [];
      
      // 기본 패턴 (소문자로 변환하여 검색)
      searchPatterns.push(`cha_${characterType.toLowerCase()}`);
      searchPatterns.push(`${characterType.toLowerCase()}`);
      searchPatterns.push(`enemy_${characterType.toLowerCase()}`);
      searchPatterns.push(`monster_${characterType.toLowerCase()}`);
      
      // DEMON 타입인 경우 추가 대체 패턴 (다른 몬스터 타입도 검색)
      if (characterType === CharacterType.DEMON) {
        searchPatterns.push('cha_vampire');
        searchPatterns.push('vampire');
        searchPatterns.push('cha_zombie');
        searchPatterns.push('zombie');
        searchPatterns.push('monster_');
        searchPatterns.push('enemy_');
      }
      
      // 패턴에 맞는 프레임 찾기
      for (const pattern of searchPatterns) {
        const matchingFrames = frames.filter(frame => 
          frame.toLowerCase().includes(pattern)
        );
        
        if (matchingFrames.length > 0) {
          // 첫 번째 매칭 프레임 사용
          initialFrame = matchingFrames[0];
          console.log(`Found frame for ${characterType}: ${initialFrame} using pattern: ${pattern}`);
          break;
        }
      }
      
      // 여전히 프레임을 찾지 못한 경우, 다른 몬스터 프레임 중 하나 사용
      if (!initialFrame) {
        for (const frame of frames) {
          if (frame.toLowerCase().includes('monster_') || 
              frame.toLowerCase().includes('enemy_') || 
              frame.toLowerCase().includes('ghost_') || 
              frame.toLowerCase().includes('skeleton_') || 
              frame.toLowerCase().includes('demon_') ||
              frame.toLowerCase().includes('vampire_') ||
              frame.toLowerCase().includes('zombie_')) {
            initialFrame = frame;
            console.log(`Using fallback monster frame for ${characterType}: ${initialFrame}`);
            break;
          }
        }
      }
    }
    
    // 캐릭터 텍스처와 초기 프레임으로 생성
    super(scene, x, y, 'characters', initialFrame);
    this.characterType = characterType;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.health = health;
    this.maxHealth = health;
    
    // 적 타입에 따른 속성 조정
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
    
    // 스프라이트 속성 설정
    this.setScale(1.2);
    this.setDepth(5);
    
    // 유효한 프레임이 있는 경우 애니메이션 설정
    if (initialFrame) {
      this.setupAnimations();
    } else {
      // 유효한 프레임을 찾지 못한 경우 대체 스프라이트 생성
      this.createFallbackSprite(scene, type);
    }
  }

  // 텍스처가 없는 경우 대체 스프라이트 생성
  createFallbackSprite(scene: Phaser.Scene, type: string) {
    // 대체 텍스처가 이미 존재하는지 확인
    const fallbackKey = `fallback-${type}`;
    
    if (!scene.textures.exists(fallbackKey)) {
      const graphics = scene.make.graphics({ x: 0, y: 0 });
      
      // 적 타입에 따른 색상 선택
      let color = 0xff0000; // 기본 빨간색
      
      if (type === 'enemy1') {
        color = 0xaaaaaa; // Ghost: 회색
      } else if (type === 'enemy2') {
        color = 0xffffff; // Skeleton: 흰색
      } else {
        color = 0xff0000; // Demon: 빨간색
      }
      
      // 적 모양 그리기
      graphics.fillStyle(color, 1);
      
      if (type === 'enemy1') {
        // Ghost 모양
        graphics.fillCircle(16, 16, 12);
        graphics.fillRect(4, 16, 24, 12);
        graphics.fillStyle(0x000000, 0.8);
        graphics.fillCircle(12, 12, 3);
        graphics.fillCircle(20, 12, 3);
      } else if (type === 'enemy2') {
        // Skeleton 모양
        graphics.fillRect(8, 8, 16, 16);
        graphics.fillStyle(0x000000, 0.8);
        graphics.fillRect(10, 12, 4, 4);
        graphics.fillRect(18, 12, 4, 4);
        graphics.fillRect(12, 20, 8, 2);
      } else {
        // Demon 모양
        graphics.fillTriangle(16, 4, 28, 24, 4, 24);
        graphics.fillStyle(0x000000, 0.8);
        graphics.fillCircle(12, 16, 3);
        graphics.fillCircle(20, 16, 3);
      }
      
      // 텍스처 생성
      graphics.generateTexture(fallbackKey, 32, 32);
      graphics.destroy();
    }
    
    // 대체 텍스처 사용
    this.setTexture(fallbackKey);
  }

  // 애니메이션 설정
  setupAnimations() {
    const type = this.characterType.toLowerCase();
    
    // 이 캐릭터 타입에 대한 모든 프레임 가져오기
    const frames = this.scene.textures.get('characters').getFrameNames();
    
    // 타입에 맞는 프레임 필터링 (소문자로 변환하여 검색)
    let typeFrames = frames.filter(frame => 
      frame.toLowerCase().includes(`cha_${type}`) || 
      frame.toLowerCase().includes(`${type}_`) ||
      frame.toLowerCase().includes(`enemy_${type}`) ||
      frame.toLowerCase().includes(`monster_${type}`)
    );
    
    // DEMON 타입인 경우 추가 대체 패턴 검색
    if (type === 'demon' && typeFrames.length === 0) {
      // 다른 몬스터 타입 프레임 검색
      const alternativePatterns = [
        'cha_vampire', 'vampire',
        'cha_zombie', 'zombie',
        'monster_', 'enemy_'
      ];
      
      for (const pattern of alternativePatterns) {
        const altFrames = frames.filter(frame => 
          frame.toLowerCase().includes(pattern)
        );
        
        if (altFrames.length > 0) {
          typeFrames = altFrames;
          console.log(`Using alternative frames for demon: ${pattern}`);
          break;
        }
      }
    }
    
    if (typeFrames.length === 0) {
      console.error(`No frames found for enemy type: ${type}`);
      return;
    }
    
    // 애니메이션이 이미 존재하는지 확인
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
        
        // 애니메이션 재생
        this.play(walkKey);
      } catch (error) {
        console.error(`Error creating enemy animation: ${error}`);
      }
    } else {
      // 기존 애니메이션 재생
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
    
    // 히트 효과
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    // 체력에 따른 색상 업데이트
    const healthPercent = this.health / this.maxHealth;
    this.setTint(Phaser.Display.Color.GetColor(
      255,
      Math.floor(255 * healthPercent),
      Math.floor(255 * healthPercent)
    ));
  }
}
