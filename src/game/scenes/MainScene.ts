import Phaser from 'phaser';
import { gameEvents } from '../events';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Weapon } from '../entities/Weapon';
import { XPGem } from '../entities/XPGem';

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
  
  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    console.log('MainScene create method started');
    
    // 텍스처 로딩 확인
    this.checkTextures();
    
    // Create background with tile sprite
    this.createBackground();
    
    // Initialize groups
    this.enemies = this.add.group({ classType: Enemy });
    this.weapons = this.add.group({ classType: Weapon });
    this.xpGems = this.add.group({ classType: XPGem });
    
    // Create player
    this.player = new Player(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // 디버깅: 플레이어 위치에 빨간색 점 표시
    const debugMarker = this.add.circle(
      this.cameras.main.width / 2, 
      this.cameras.main.height / 2, 
      10, 
      0xff0000
    );
    debugMarker.setDepth(100);
    
    console.log('Player created at:', {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height,
      visible: this.player.visible
    });
    
    // Set up camera to follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    
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
    
    console.log('MainScene create method completed');
  }

  // 텍스처 로딩 확인
  checkTextures() {
    console.log('Checking textures:');
    console.log('- characters:', this.textures.exists('characters'));
    console.log('- player:', this.textures.exists('player'));
    console.log('- background-tile:', this.textures.exists('background-tile'));
    
    if (this.textures.exists('characters')) {
      const frames = this.textures.get('characters').getFrameNames();
      console.log('Characters frames:', frames);
    }
  }

  createBackground() {
    // Create a tiled background using the loaded tile image
    if (this.textures.exists('background-tile')) {
      const bgTile = this.add.tileSprite(
        0, 0,
        this.cameras.main.width * 2, 
        this.cameras.main.height * 2,
        'background-tile'
      );
      bgTile.setOrigin(0, 0);
      bgTile.setScrollFactor(0.2); // Parallax effect
    } else {
      console.error('Background tile texture not found');
      // 대체 배경 생성
      const bg = this.add.rectangle(
        0, 0,
        this.cameras.main.width * 2,
        this.cameras.main.height * 2,
        0x0a0a20
      );
      bg.setOrigin(0, 0);
      bg.setScrollFactor(0.2);
    }
  }

  update(time: number, delta: number) {
    // Update player
    if (this.player) {
      this.player.update();
    }
    
    // Update all enemies
    this.enemies.getChildren().forEach((enemy: any) => {
      enemy.update(this.player);
    });
    
    // Update all weapons
    this.weapons.getChildren().forEach((weapon: any) => {
      weapon.update();
    });
    
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
      // Spawn enemies outside the camera view
      const angle = Math.random() * Math.PI * 2;
      const distance = 600; // Distance from player to spawn
      
      const x = this.player.x + Math.cos(angle) * distance;
      const y = this.player.y + Math.sin(angle) * distance;
      
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
    enemy.takeDamage(weapon.damage);
    
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
    this.gameTime

    this.gameTime++;
    gameEvents.emit('time-changed', this.gameTime);
  }

  gameOver() {
    gameEvents.emit('game-over');
    this.scene.pause();
  }
}
