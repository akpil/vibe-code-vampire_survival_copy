import Phaser from 'phaser';

/**
 * Utility for creating reusable buttons throughout the game
 */
export class ButtonFactory {
  /**
   * Creates a button with consistent styling
   * @param scene The scene to create the button in
   * @param x Button x coordinate
   * @param y Button y coordinate
   * @param imageKey Button background image key
   * @param text Text to display on the button
   * @param onClick Callback function to execute on click
   * @param width Button width (pixels)
   * @param height Button height (pixels)
   * @param fontSize Button text size
   * @param depth Button z-index (depth)
   * @returns Created button image object
   */
  static createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    imageKey: string,
    text: string,
    onClick: () => void,
    width: number = 180,
    height: number = 60,
    fontSize: string = '20px',
    depth: number = 100
  ): Phaser.GameObjects.Image {
    // Check if image key exists
    if (!scene.textures.exists(imageKey)) {
      // Create fallback button
      ButtonFactory.createFallbackButton(scene, imageKey);
    }
    
    // Create button image
    const button = scene.add.image(x, y, imageKey);
    button.setDisplaySize(width, height);
    button.setInteractive({ useHandCursor: true });
    button.setDepth(depth);
    
    // Create button text
    const buttonText = scene.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: fontSize,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(depth + 1); // Set text above button
    
    // Set click event
    button.on('pointerdown', onClick);
    
    // Hover effects
    button.on('pointerover', () => {
      button.setTint(0xdddddd);
    });
    
    button.on('pointerout', () => {
      button.clearTint();
    });
    
    return button;
  }
  
  /**
   * Creates a UI button with scroll factor 0 (not affected by camera movement)
   * @param scene The scene to create the button in
   * @param x Button x coordinate
   * @param y Button y coordinate
   * @param imageKey Button background image key
   * @param text Text to display on the button
   * @param onClick Callback function to execute on click
   * @param width Button width (pixels)
   * @param height Button height (pixels)
   * @param fontSize Button text size
   * @param depth Button z-index (depth)
   * @returns Object containing button image and text objects
   */
  static createUIButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    imageKey: string,
    text: string,
    onClick: () => void,
    width: number = 180,
    height: number = 60,
    fontSize: string = '20px',
    depth: number = 1000
  ): { button: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text } {
    // Check if image key exists
    if (!scene.textures.exists(imageKey)) {
      // Create fallback button
      ButtonFactory.createFallbackButton(scene, imageKey);
    }
    
    // Create button image
    const button = scene.add.image(x, y, imageKey);
    button.setDisplaySize(width, height);
    button.setInteractive({ useHandCursor: true });
    button.setScrollFactor(0); // Not affected by camera movement
    button.setDepth(depth);
    
    // Create button text
    const buttonText = scene.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: fontSize,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    buttonText.setOrigin(0.5);
    buttonText.setScrollFactor(0); // Not affected by camera movement
    buttonText.setDepth(depth + 1); // Set text above button
    
    // Set click event
    button.on('pointerdown', onClick);
    
    // Hover effects
    button.on('pointerover', () => {
      button.setTint(0xdddddd);
    });
    
    button.on('pointerout', () => {
      button.clearTint();
    });
    
    return { button, text: buttonText };
  }
  
  /**
   * Create fallback button texture (if image loading fails)
   * @param scene Scene to create texture in
   * @param key Texture key to create
   */
  static createFallbackButton(scene: Phaser.Scene, key: string) {
    console.log(`Creating fallback button texture: ${key}`);
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    // Determine button color
    let color = 0x3498db; // Default blue
    
    if (key.includes('blue')) {
      color = 0x3498db; // Blue
    } else if (key.includes('red')) {
      color = 0xe74c3c; // Red
    } else if (key.includes('green')) {
      color = 0x2ecc71; // Green
    }
    
    // Button background
    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, 180, 60, 10);
    
    // Button border
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRoundedRect(0, 0, 180, 60, 10);
    
    // Generate texture
    graphics.generateTexture(key, 180, 60);
    graphics.destroy();
  }
}
