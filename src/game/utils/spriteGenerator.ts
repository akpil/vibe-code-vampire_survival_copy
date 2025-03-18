import Phaser from 'phaser';

// Generate player sprite
export function generatePlayerSprite(scene: Phaser.Scene) {
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  
  // Draw player character - Ã«ÂÂ Ã«Â°ÂÃ¬ÂÂ Ã¬ÂÂÃ¬ÂÂÃ¬ÂÂ¼Ã«Â¡Â Ã«Â³ÂÃªÂ²Â½
  graphics.fillStyle(0x3498db);
  graphics.fillCircle(16, 16, 14);
  
  // Add details
  graphics.fillStyle(0x2980b9);
  graphics.fillCircle(16, 16, 8);
  
  // Ã­ÂÂÃ«ÂÂÃ«Â¦Â¬ Ã¬Â¶ÂÃªÂ°Â
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
    // Ã­ÂÂÃ«ÂÂÃ«Â¦Â¬ Ã¬Â¶ÂÃªÂ°Â
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
    // Ã­ÂÂÃ«ÂÂÃ«Â¦Â¬ Ã¬Â¶ÂÃªÂ°Â
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
    // Ã­ÂÂÃ«ÂÂÃ«Â¦Â¬ Ã¬Â¶ÂÃªÂ°Â
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
    // Ã­ÂÂÃ«ÂÂÃ«Â¦Â¬ Ã¬Â¶ÂÃªÂ°Â
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(12, 4, 8, 24);
    graphics.beginPath();
    graphics.moveTo(12, 4);
    graphics.lineTo(20, 4);
    graphics.lineTo(16, 0);
    graphics.closePath();
    graphics.strokePath();
  } else if (key === 'axe') {
    // Axe shape
    graphics.fillRect(14, 8, 4, 16);
    graphics.fillTriangle(6, 8, 14, 8, 14, 16);
    graphics.fillTriangle(18, 8, 26, 8, 18, 16);
    // Ã­ÂÂÃ«ÂÂÃ«Â¦Â¬ Ã¬Â¶ÂÃªÂ°Â
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(14, 8, 4, 16);
    graphics.beginPath();
    graphics.moveTo(6, 8);
    graphics.lineTo(14, 8);
    graphics.lineTo(14, 16);
    graphics.closePath();
    graphics.strokePath();
    graphics.beginPath();
    graphics.moveTo(18, 8);
    graphics.lineTo(26, 8);
    graphics.lineTo(18, 16);
    graphics.closePath();
    graphics.strokePath();
  } else if (key === 'magic') {
    // Magic orb
    graphics.fillCircle(16, 16, 8);
    
    // Add glow effect
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(16, 16, 12);
    
    // Ã­ÂÂÃ«ÂÂÃ«Â¦Â¬ Ã¬Â¶ÂÃªÂ°Â
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 8);
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
  
  // Ã­ÂÂÃ«ÂÂÃ«Â¦Â¬ Ã¬Â¶ÂÃªÂ°Â
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
