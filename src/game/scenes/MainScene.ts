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
  
  // ë°°ê²½ íì¼ ì¤íë¼ì´í¸
  backgroundTile: Phaser.GameObjects.TileSprite;
  
  // ë§µ í¬ê¸° ì¤ì 
  readonly MAP_WIDTH: number = 4000;
  readonly MAP_HEIGHT: number = 4000;
  
  // ê²ì ì¤ì 
  private chapterNumber: number = 1;
  private characterType: CharacterType = CharacterType.WARRIOR;
  
  constructor() {
    super({ key: SceneKeys.MAIN });
  }
  
  init(data: any) {
    // ì´ì  ì¬ìì ì ë¬ë°ì ì±í°ì ìºë¦­í° ì ë³´
    this.chapterNumber = data.chapter || 1;
    this.characterType = data.character || CharacterType.WARRIOR;
    
    console.log(`Starting game with Chapter ${this.chapterNumber} and Character ${this.characterType}`);
  }

  preload() {
    // ë¬´ê¸° ë°ì´í° ë¡ë - ê²½ë¡ ìì 
    this.load.json('weapons-data', 'assets/data/weapons.json');
  }

  create() {
    // ì¬ ë³ê²½ ì´ë²¤í¸ ë°ì - UI íìë¥¼ ìí´ ì¶ê°
    gameEvents.emit('scene-changed', SceneKeys.MAIN);
    
    console.log('MainScene create method started');
    
    // ìë ê²½ê³ì¤ì  - ë§µ í¬ê¸° íì¥
    this.physics.world.setBounds(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);
    
    // íì¤ì² ë¡ë© íì¸
    this.checkTextures();
    
    // Create background with tile sprite
    this.createBackground();
    
    // Initialize groups
    this.enemies = this.add.group({ classType: Enemy });
    this.weapons = this.add.group({ classType: Weapon });
    this.xpGems = this.add.group({ classType: XPGem });
    
    // Create player at the center of the map with selected character type
    this.player = new Player(this, this.MAP_WIDTH / 2, this.MAP_HEIGHT / 2, this.weapons, this.characterType);
    
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
    
    // ì±í°ì ë°ë¥¸ ëì´ë ì¡°ì 
    this.adjustDifficultyByChapter();
    
    // ì¼ìì ì§ ë©ë´ ì¤ì  - ESC í¤ ì¤ì 
    this.setupPauseMenu();
    
    console.log('MainScene create method completed');
  }
  
  // ì±í°ì ë°ë¥¸ ëì´ë ì¡°ì 
  adjustDifficultyByChapter() {
    switch (this.chapterNumber) {
      case 1:
        // ì±í° 1: ê¸°ë³¸ ëì´ë
        this.difficulty = 1;
        break;
      case 2:
        // ì±í° 2: ì¤ê° ëì´ë
        this.difficulty = 3;
        break;
      case 3:
        // ì±í° 3: ëì ëì´ë
        this.difficulty = 5;
        break;
    }
  }
  
  // ì¼ìì ì§ ë©ë´ ì¤ì  - ìì í ìë¡ì´ ë°©ìì¼ë¡ êµ¬í
  setupPauseMenu() {
    // ESC í¤ ì¤ì 
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    escKey.on('down', () => {
      console.log('ESC key pressed');
      this.pauseGame();
    });
  }
  
  // ê²ì ì¼ìì ì§ ë©ìë - ë³ëì ì¼ìì ì§ ì¬ ì¬ì©
  pauseGame() {
    console.log('Pausing game');
    // íì¬ ì¬ ì¼ìì ì§
    this.scene.pause();
    // ì¼ìì ì§ ì¬ ìì (ì¤ë²ë ì´ ëª¨ë)
    this.scene.launch(SceneKeys.PAUSE);
  }

  // íì¤ì² ë¡ë© íì¸
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
    
    // ë°°ê²½ íì¼ íì¤ì²ê° ìì ê²½ì° í´ë°± ìì±
    if (!this.textures.exists('background-tile')) {
      this.createFallbackBackgroundTile();
    }
  }
  
  // í´ë°± ë°°ê²½ íì¼ ìì±
  createFallbackBackgroundTile() {
    console.log('Creating fallback background tile');
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // ë°°ê²½ íì¼ í¨í´ ìì±
    graphics.fillStyle(0x0a0a20);
    graphics.fillRect(0, 0, 64, 64);
    
    // ê²©ì í¨í´ ì¶ê°
    graphics.lineStyle(1, 0x1a1a40);
    graphics.strokeRect(0, 0, 64, 64);
    graphics.lineBetween(0, 32, 64, 32);
    graphics.lineBetween(32, 0, 32, 64);
    
    // íì¤ì² ìì±
    graphics.generateTexture('background-tile', 64, 64);
    graphics.destroy();
  }

  createBackground() {
    // ë°°ê²½ íì¼ ì¤íë¼ì´í¸ ìì± - ì ì²´ ë§µ í¬ê¸°ë¥¼ ì»¤ë²íëë¡ ì¤ì 
    if (this.textures.exists('background-tile')) {
      console.log('Creating background tile sprite');
      
      // ë°°ê²½ íì¼ ì¤íë¼ì´í¸ë¥¼ ì¹´ë©ë¼ ë·°í¬í¸ ì¤ì¬ì ìì¹ìí¤ê³  ë§µ ì ì²´ë¥¼ ì»¤ë²íëë¡ ì¤ì 
      this.backgroundTile = this.add.tileSprite(
        0, 
        0,
        this.cameras.main.width, 
        this.cameras.main.height,
        'background-tile'
      );
      
      // ìì ì ì¢ìë¨ì¼ë¡ ì¤ì 
      this.backgroundTile.setOrigin(0, 0);
      
      // ì¤í¬ë¡¤ í©í°ë¥¼ 0ì¼ë¡ ì¤ì íì¬ ì¹´ë©ë¼ì í¨ê» ìì§ì´ì§ ìëë¡ í¨
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
      // ëì²´ ë°°ê²½ ìì±
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
    
    // ë§µ ê²½ê³íì (ëë²ê¹ ë° ìê°ì  í¼ëë°±ì©)
    this.createMapBoundaryIndicators();
  }
  
  // ë§µ ê²½ê³íì ë©ìë
  createMapBoundaryIndicators() {
    // ë§µ ê²½ê³ì  ê·¸ë¦¬ê¸°
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(4, 0xff0000, 0.8);
    borderGraphics.strokeRect(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);
    
    // ë§µ ëª¨ìë¦¬ì íì ì¶ê°
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
      enemy.update(this.player);
    });
    
    // Update all weapons
    this.weapons.getChildren().forEach((weapon: any) => {
      weapon.update();
    });
    
    // ë°°ê²½ íì¼ ì¤íë¼ì´í¸ ìë°ì´í¸ - ì¹´ë©ë¼ ìì¹ì ë°ë¼ íì¼ ì¤íì ì¡°ì 
    if (this.backgroundTile) {
      // ì¹´ë©ë¼ ìì¹ì ë°ë¼ íì¼ ì¤íì ì¡°ì 
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
      
      // ë§µ ê²½ê³ ë´ì ìì±ëëë¡ ì¢í ì¡°ì 
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
    this.gameTime++;
    gameEvents.emit('time-changed', this.gameTime);
  }

  gameOver() {
    gameEvents.emit('game-over');
    this.scene.pause();
  }
}
