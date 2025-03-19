import Phaser from 'phaser';
import { gameEvents } from '../events';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Weapon } from '../entities/Weapon';
import { XPGem } from '../entities/XPGem';
import { CharacterType } from '../types/CharacterType';
import { SceneKeys } from '../types/SceneKeys';
import { ButtonFactory } from '../utils/ButtonFactory';

export class MainScene extends Phaser.Scene {
  player: Player;
  enemies: Phaser.GameObjects.Group;
  weapons: Phaser.GameObjects.Group;
  xpGems: Phaser.GameObjects.Group;
  
  gameTime: number = 0;
  spawnTimer: number = 0;
  difficultyTimer: number = 0;
  difficulty: number = 1;
  
  kills: number = 0;
  
  // 배경 타일 스프라이트
  backgroundTile: Phaser.GameObjects.TileSprite;
  
  // 맵 크기 설정
  readonly MAP_WIDTH: number = 4000;
  readonly MAP_HEIGHT: number = 4000;
  
  // 게임 설정
  private chapterNumber: number = 1;
  private characterType: CharacterType = CharacterType.WARRIOR;
  
  constructor() {
    super({ key: SceneKeys.MAIN });
  }
  
  init(data: any) {
    // 이전 씬에서 전달받은 챕터와 캐릭터 정보
    this.chapterNumber = data.chapter || 1;
    this.characterType = data.character || CharacterType.WARRIOR;
    
    console.log(`Starting game with Chapter ${this.chapterNumber} and Character ${this.characterType}`);
  }

  preload() {
    // 무기 데이터 로드 - 경로 수정
    this.load.json('weapons-data', 'assets/data/weapons.json');
  }

  create() {
    // 씬 변경 이벤트 발생 - UI 표시를 위해 추가
    gameEvents.emit('scene-changed', SceneKeys.MAIN);
    
    console.log('MainScene create method started');
    
    // 월드 경계설정 - 맵 크기 확장
    this.physics.world.setBounds(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);
    
    // 텍스처 로딩 확인
    this.checkTextures();
    
    // Create background with tile sprite
    this.createBackground();
    
    // Initialize groups
    this.enemies = this.add.group({ classType: Enemy });
    this.weapons = this.add.group({ classType: Weapon });
    this.xpGems = this.add.group({ classType: XPGem });
    
    // Create player at the center of the map with selected character type
    this.player = new Player(this, this.MAP_WIDTH / 2, this.MAP_HEIGHT / 2, this.weapons, this.characterType);
    this.player.name = 'player'; // 플레이어 이름 설정 - 검색을 위해 필요
    
    console.log('Player created at:', {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height,
      visible: this.player.visible,
      characterType: this.characterType
    });
    
    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);
    
    // Set up collisions
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);
    this.physics.add.overlap(this.weapons, this.enemies, this.handleWeaponEnemyCollision, undefined, this);
    this.physics.add.overlap(this.player, this.xpGems, this.handlePlayerXPCollision, undefined, this);
    
    // Initial enemy spawn
    this.spawnEnemies(5);
    
    // Set up game timer
    this.time.addEvent({
      delay: 1000,
      callback: this.updateGameTime,
      callbackScope: this,
      loop: true
    });
    
    // Initialize UI values
    gameEvents.emit('health-changed', this.player.health);
    gameEvents.emit('level-changed', this.player.level);
    gameEvents.emit('xp-changed', { current: this.player.xp, max: this.player.xpToNextLevel });
    gameEvents.emit('kills-changed', this.kills);
    gameEvents.emit('time-changed', this.gameTime);
    
    // 챕터에 따른 난이도 조정
    this.adjustDifficultyByChapter();
    
    // 일시정지 메뉴 설정 - ESC 키 설정
    this.setupPauseMenu();
    
    console.log('MainScene create method completed');
  }
  
  // 챕터에 따른 난이도 조정
  adjustDifficultyByChapter() {
    switch (this.chapterNumber) {
      case 1:
        // 챕터 1: 기본 난이도
        this.difficulty = 1;
        break;
      case 2:
        // 챕터 2: 중간 난이도
        this.difficulty = 3;
        break;
      case 3:
        // 챕터 3: 높은 난이도
        this.difficulty = 5;
        break;
    }
  }
  
  // 일시정지 메뉴 설정 - 완전히 새로운 방식으로 구현
  setupPauseMenu() {
    // ESC 키 설정
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    escKey.on('down', () => {
      console.log('ESC key pressed');
      this.pauseGame();
    });
  }
  
  // 게임 일시정지 메서드 - 별도의 일시정지 씬 사용
  pauseGame() {
    console.log('Pausing game');
    // 현재 씬 일시정지
    this.scene.pause();
    // 일시정지 씬 시작 (오버레이 모드)
    this.scene.launch(SceneKeys.PAUSE);
  }

  // 텍스처 로딩 확인
  checkTextures() {
    console.log('MainScene - Checking textures:');
    console.log('- characters:', this.textures.exists('characters'));
    console.log('- background-tile:', this.textures.exists('background-tile'));
    console.log('- knife:', this.textures.exists('knife'));
    console.log('- shield:', this.textures.exists('shield'));
    console.log('- whip:', this.textures.exists('whip'));
    console.log('- arrow:', this.textures.exists('arrow'));
    console.log('- xp-gem:', this.textures.exists('xp-gem'));
    
    if (this.textures.exists('characters')) {
      const frames = this.textures.get('characters').getFrameNames();
      console.log('Characters frames count:', frames.length);
    }
    
    // 배경 타일 텍스처가 없을 경우 폴백 생성
    if (!this.textures.exists('background-tile')) {
      this.createFallbackBackgroundTile();
    }
    
    // 화살 텍스처가 없을 경우 폴백 생성
    if (!this.textures.exists('arrow')) {
      this.createFallbackArrowTexture();
    }
  }
  
  // 폴백 배경 타일 생성
  createFallbackBackgroundTile() {
    console.log('Creating fallback background tile');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // 배경 타일 패턴 생성
    graphics.fillStyle(0x0a0a20);
    graphics.fillRect(0, 0, 64, 64);
    
    // 격자 패턴 추가
    graphics.lineStyle(1, 0x1a1a40);
    graphics.strokeRect(0, 0, 64, 64);
    graphics.lineBetween(0, 32, 64, 32);
    graphics.lineBetween(32, 0, 32, 64);
    
    // 텍스처 생성
    graphics.generateTexture('background-tile', 64, 64);
    graphics.destroy();
  }
  
  // 폴백 화살 텍스처 생성
  createFallbackArrowTexture() {
    console.log('Creating fallback arrow texture');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // 화살 모양 그리기
    graphics.fillStyle(0xffff00); // 노란색
    
    // 화살 몸체
    graphics.fillRect(4, 8, 16, 4);
    
    // 화살촉
    graphics.fillTriangle(20, 2, 20, 18, 28, 10);
    
    // 화살 깃
    graphics.fillTriangle(0, 4, 4, 10, 0, 16);
    
    // 텍스처 생성
    graphics.generateTexture('arrow', 32, 20);
    graphics.destroy();
  }

  createBackground() {
    // 배경 타일 스프라이트 생성 - 전체 맵 크기를 커버하도록 설정
    if (this.textures.exists('background-tile')) {
      console.log('Creating background tile sprite');
      
      // 배경 타일 스프라이트를 카메라 뷰포트 중심에 위치시키고 맵 전체를 커버하도록 설정
      this.backgroundTile = this.add.tileSprite(
        0, 
        0,
        this.cameras.main.width, 
        this.cameras.main.height,
        'background-tile'
      );
      
      // 원점을 좌상단으로 설정
      this.backgroundTile.setOrigin(0, 0);
      
      // 스크롤 팩터를 0으로 설정하여 카메라와 함께 움직이지 않도록 함
      this.backgroundTile.setScrollFactor(0);
      
      console.log('Background tile created:', {
        x: this.backgroundTile.x,
        y: this.backgroundTile.y,
        width: this.backgroundTile.width,
        height: this.backgroundTile.height,
        visible: this.backgroundTile.visible
      });
    } else {
      console.error('Background tile texture not found');
      // 대체 배경 생성
      const bg = this.add.rectangle(
        0, 
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x0a0a20
      );
      bg.setOrigin(0, 0);
      bg.setScrollFactor(0);
    }
    
    // 맵 경계표시 (디버깅 및 시각적 피드백용)
    this.createMapBoundaryIndicators();
  }
  
  // 맵 경계표시 메서드
  createMapBoundaryIndicators() {
    // 맵 경계선 그리기
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(4, 0xff0000, 0.8);
    borderGraphics.strokeRect(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);
    
    // 맵 모서리에 표시 추가
    const cornerSize = 50;
    const corners = [
      { x: 0, y: 0 },
      { x: this.MAP_WIDTH - cornerSize, y: 0 },
      { x: 0, y: this.MAP_HEIGHT - cornerSize },
      { x: this.MAP_WIDTH - cornerSize, y: this.MAP_HEIGHT - cornerSize }
    ];
    
    corners.forEach(corner => {
      const marker = this.add.rectangle(
        corner.x + cornerSize / 2, 
        corner.y + cornerSize / 2, 
        cornerSize, 
        cornerSize, 
        0xff0000, 
        0.3
      );
      marker.setOrigin(0.5, 0.5);
    });
  }

  update(time: number, delta: number) {
    // Update player
    if (this.player) {
      this.player.update(delta);
    }
    
    // Update all enemies
    this.enemies.getChildren().forEach((enemy: any) => {
      enemy.update(this.player, time);
    });
    
    // Update all weapons
    this.weapons.getChildren().forEach((weapon: any) => {
      weapon.update();
    });
    
    // 배경 타일 스프라이트 업데이트 - 카메라 위치에 따라 타일 오프셋 조정
    if (this.backgroundTile) {
      // 카메라 위치에 따라 타일 오프셋 조정
      this.backgroundTile.tilePositionX = this.cameras.main.scrollX * 0.3;
      this.backgroundTile.tilePositionY = this.cameras.main.scrollY * 0.3;
    }
    
    // Spawn enemies based on timer
    this.spawnTimer += delta;
    if (this.spawnTimer >= 2000) { // Spawn every 2 seconds
      this.spawnTimer = 0;
      this.spawnEnemies(Math.floor(1 + this.difficulty / 2));
    }
    
    // Increase difficulty over time
    this.difficultyTimer += delta;
    if (this.difficultyTimer >= 30000) { // Increase difficulty every 30 seconds
      this.difficultyTimer = 0;
      this.difficulty++;
    }
    
    // Auto attack with weapons
    if (this.player && this.player.canAttack()) {
      this.player.attack(this.weapons);
    }
  }

  spawnEnemies(count: number) {
    for (let i = 0; i < count; i++) {
      // Spawn enemies outside the camera view but within map bounds
      const angle = Math.random() * Math.PI * 2;
      const distance = 600; // Distance from player to spawn
      
      let x = this.player.x + Math.cos(angle) * distance;
      let y = this.player.y + Math.sin(angle) * distance;
      
      // 맵 경계 내에 생성되도록 좌표 조정
      x = Phaser.Math.Clamp(x, 50, this.MAP_WIDTH - 50);
      y = Phaser.Math.Clamp(y, 50, this.MAP_HEIGHT - 50);
      
      // Choose random enemy type based on difficulty
      const enemyTypes = ['enemy1', 'enemy2', 'enemy3'];
      const enemyType = enemyTypes[Math.min(Math.floor(Math.random() * this.difficulty), enemyTypes.length - 1)];
      
      const enemy = new Enemy(this, x, y, enemyType, 50 + this.difficulty * 10);
      this.enemies.add(enemy);
    }
  }

  handlePlayerEnemyCollision(player: any, enemy: any) {
    player.takeDamage(enemy.damage);
    gameEvents.emit('health-changed', player.health);
    
    if (player.health <= 0) {
      this.gameOver();
    }
  }

  handleWeaponEnemyCollision(weapon: any, enemy: any) {
    const weaponType = weapon.texture.key;
    let knockbackForce = 0;
    
    // 무기 타입에 따른 넉백 설정
    if (weaponType === 'shield') {
      knockbackForce = 300;
    } else if (weaponType === 'knife') {
      knockbackForce = 100;
    } else if (weaponType === 'whip') {
      knockbackForce = 150;
    } else if (weaponType === 'arrow') {
      knockbackForce = 120;
    }
    
    // 데미지 먼저 적용
    enemy.takeDamage(weapon.damage, weaponType, knockbackForce, weapon.x, weapon.y);
    
    // 방패의 경우 넉백 상태 확인 후 처리
    if (weaponType === 'shield' && enemy.isInKnockback()) {
      // 이미 넉백 상태인 경우 추가 처리 없음
      // 데미지는 이미 적용되었음
    }
    
    if (enemy.health <= 0) {
      // Spawn XP gem
      const gem = new XPGem(this, enemy.x, enemy.y);
      this.xpGems.add(gem);
      
      // Remove enemy
      enemy.destroy();
      
      // Update kills
      this.kills++;
      gameEvents.emit('kills-changed', this.kills);
    }
    
    // Some weapons are destroyed on hit, others pass through
    if (weapon.destroyOnHit) {
      weapon.destroy();
    }
  }

  handlePlayerXPCollision(player: any, gem: any) {
    player.addXP(gem.value);
    gem.destroy();
    
    gameEvents.emit('xp-changed', { current: player.xp, max: player.xpToNextLevel });
    
    if (player.checkLevelUp()) {
      gameEvents.emit('level-changed', player.level);
      // Could trigger level up UI here
    }
  }

  updateGameTime() {
    this.gameTime++;
    gameEvents.emit('time-changed', this.gameTime);
  }

  gameOver() {
    gameEvents.emit('game-over');
    this.scene.pause();
  }
}
