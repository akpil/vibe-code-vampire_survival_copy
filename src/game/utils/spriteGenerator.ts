import Phaser from 'phaser';

// Generate player sprite
export function generatePlayerSprite(scene: Phaser.Scene) {
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  
  // Draw player character - ìí ìºë¦­í° ì¤íë¼ì´í¸ ìì±
  graphics.fillStyle(0x3498db);
  graphics.fillCircle(16, 16, 14);
  
  // Add details
  graphics.fillStyle(0x2980b9);
  graphics.fillCircle(16, 16, 8);
  
  // íëë¦¬ ì¶ê°
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeCircle(16, 16, 14);
  
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

// Generate enemy sprite
export function generateEnemySprite(scene: Phaser.Scene, key: string, color: string) {
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  
  // Convert color string to hex
  const colorHex = parseInt(color.replace('#', '0x'));
  
  // Draw enemy base
  graphics.fillStyle(colorHex);
  
  // Different shapes for different enemies
  if (key === 'enemy1') {
    // Square enemy
    graphics.fillRect(4, 4, 24, 24);
    // íëë¦¬ ì¶ê°
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(4, 4, 24, 24);
  } else if (key === 'enemy2') {
    // Triangle enemy
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(28, 28);
    graphics.lineTo(4, 28);
    graphics.closePath();
    graphics.fillPath();
    // íëë¦¬ ì¶ê°
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(28, 28);
    graphics.lineTo(4, 28);
    graphics.closePath();
    graphics.strokePath();
  } else {
    // Star-like enemy
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(22, 14);
    graphics.lineTo(32, 16);
    graphics.lineTo(22, 18);
    graphics.lineTo(16, 28);
    graphics.lineTo(10, 18);
    graphics.lineTo(0, 16);
    graphics.lineTo(10, 14);
    graphics.closePath();
    graphics.fillPath();
    // íëë¦¬ ì¶ê°
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(22, 14);
    graphics.lineTo(32, 16);
    graphics.lineTo(22, 18);
    graphics.lineTo(16, 28);
    graphics.lineTo(10, 18);
    graphics.lineTo(0, 16);
    graphics.lineTo(10, 14);
    graphics.closePath();
    graphics.strokePath();
  }
  
  graphics.generateTexture(key, 32, 32);
  graphics.destroy();
}

// Generate weapon sprite
export function generateWeaponSprite(scene: Phaser.Scene, key: string, color: string) {
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  
  // Convert color string to hex
  const colorHex = parseInt(color.replace('#', '0x'));
  
  // Draw weapon based on type
  graphics.fillStyle(colorHex);
  
  if (key === 'knife') {
    // Knife shape
    graphics.fillRect(12, 4, 8, 24);
    graphics.fillTriangle(12, 4, 20, 4, 16, 0);
    // íëë¦¬ ì¶ê°
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(12, 4, 8, 24);
    graphics.beginPath();
    graphics.moveTo(12, 4);
    graphics.lineTo(20, 4);
    graphics.lineTo(16, 0);
    graphics.closePath();
    graphics.strokePath();
  } else if (key === 'shield') {  // 'axe'ìì 'shield'ë¡ ë³ê²½
    // Shield shape
    graphics.fillStyle(0x3498db); // Blue shield
    graphics.fillCircle(16, 16, 12);
    
    // Shield details
    graphics.fillStyle(0x2980b9);
    graphics.fillCircle(16, 16, 8);
    
    // Shield border
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 12);
    
    // Shield emblem
    graphics.fillStyle(0xffffff);
    graphics.fillRect(14, 10, 4, 12);
    graphics.fillRect(10, 14, 12, 4);
  } else if (key === 'whip') {  // 'magic'ìì 'whip'ì¼ë¡ ë³ê²½
    // Whip shape (ì±ì° ëª¨ì)
    graphics.fillStyle(0x9b59b6); // ë³´ë¼ì ì±ì°
    
    // ì±ì° ìì¡ì´
    graphics.fillRect(14, 4, 4, 8);
    
    // ì±ì° ì¤
    graphics.lineStyle(3, 0x9b59b6, 1);
    graphics.beginPath();
    graphics.moveTo(16, 12);
    graphics.lineTo(16, 28);
    graphics.strokePath();
    
    // íëë¦¬ ì¶ê°
    graphics.lineStyle(1, 0xffffff, 1);
    graphics.strokeRect(14, 4, 4, 8);
    
    // ì±ì° ë ë¶ë¶
    graphics.fillStyle(0x8e44ad);
    graphics.fillCircle(16, 28, 3);
    graphics.lineStyle(1, 0xffffff, 1);
    graphics.strokeCircle(16, 28, 3);
  }
  
  graphics.generateTexture(key, 32, 32);
  graphics.destroy();
}

// Generate XP gem sprite
export function generateGemSprite(scene: Phaser.Scene) {
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  
  // Draw gem
  graphics.fillStyle(0x9b59b6);
  graphics.beginPath();
  graphics.moveTo(8, 4);
  graphics.lineTo(24, 4);
  graphics.lineTo(28, 16);
  graphics.lineTo(16, 28);
  graphics.lineTo(4, 16);
  graphics.closePath();
  graphics.fillPath();
  
  // Add shine
  graphics.fillStyle(0xffffff, 0.7);
  graphics.fillTriangle(12, 8, 16, 4, 20, 8);
  
  // íëë¦¬ ì¶ê°
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(8, 4);
  graphics.lineTo(24, 4);
  graphics.lineTo(28, 16);
  graphics.lineTo(16, 28);
  graphics.lineTo(4, 16);
  graphics.closePath();
  graphics.strokePath();
  
  graphics.generateTexture('gem', 32, 32);
  graphics.destroy();
}
