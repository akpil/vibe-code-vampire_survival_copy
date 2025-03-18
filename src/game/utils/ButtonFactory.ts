import Phaser from 'phaser';

/**
 * ê²ì ì ì²´ìì ì¬ì¬ì© ê°ë¥í ë²í¼ ìì± ì í¸ë¦¬í°
 */
export class ButtonFactory {
  /**
   * ì¼ê´ë ì¤íì¼ì ë²í¼ì ìì±í©ëë¤
   * @param scene ë²í¼ì ìì±í  ì¬
   * @param x ë²í¼ì x ì¢í
   * @param y ë²í¼ì y ì¢í
   * @param imageKey ë²í¼ ë°°ê²½ ì´ë¯¸ì§ í¤
   * @param text ë²í¼ì íìí  íì¤í¸
   * @param onClick ë²í¼ í´ë¦­ ì ì¤íí  ì½ë°± í¨ì
   * @param width ë²í¼ ëë¹ (í½ì)
   * @param height ë²í¼ ëì´ (í½ì)
   * @param fontSize ë²í¼ íì¤í¸ í¬ê¸°
   * @param depth ë²í¼ì z-index (depth)
   * @returns ìì±ë ë²í¼ ì´ë¯¸ì§ ê°ì²´
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
    // ì´ë¯¸ì§ í¤ê° ì¡´ì¬íëì§ íì¸
    if (!scene.textures.exists(imageKey)) {
      // í´ë°± ë²í¼ ìì±
      ButtonFactory.createFallbackButton(scene, imageKey);
    }
    
    // ë²í¼ ì´ë¯¸ì§ ìì±
    const button = scene.add.image(x, y, imageKey);
    button.setDisplaySize(width, height);
    button.setInteractive({ useHandCursor: true });
    button.setDepth(depth);
    
    // ë²í¼ íì¤í¸ ìì±
    const buttonText = scene.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: fontSize,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(depth + 1); // íì¤í¸ê° ë²í¼ ìì íìëëë¡ depth ì¤ì 
    
    // í´ë¦­ ì´ë²¤í¸ ì¤ì 
    button.on('pointerdown', onClick);
    
    // í¸ë² í¨ê³¼
    button.on('pointerover', () => {
      button.setTint(0xdddddd);
    });
    
    button.on('pointerout', () => {
      button.clearTint();
    });
    
    return button;
  }
  
  /**
   * ì¤í¬ë¡¤ í©í°ê° 0ì¼ë¡ ì¤ì ë UIì© ë²í¼ì ìì±í©ëë¤ (ì¹´ë©ë¼ ì´ëì ìí¥ë°ì§ ìì)
   * @param scene ë²í¼ì ìì±í  ì¬
   * @param x ë²í¼ì x ì¢í
   * @param y ë²í¼ì y ì¢í
   * @param imageKey ë²í¼ ë°°ê²½ ì´ë¯¸ì§ í¤
   * @param text ë²í¼ì íìí  íì¤í¸
   * @param onClick ë²í¼ í´ë¦­ ì ì¤íí  ì½ë°± í¨ì
   * @param width ë²í¼ ëë¹ (í½ì)
   * @param height ë²í¼ ëì´ (í½ì)
   * @param fontSize ë²í¼ íì¤í¸ í¬ê¸°
   * @param depth ë²í¼ì z-index (depth)
   * @returns ìì±ë ë²í¼ ì´ë¯¸ì§ì íì¤í¸ ê°ì²´ë¥¼ í¬í¨íë ê°ì²´
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
    // ì´ë¯¸ì§ í¤ê° ì¡´ì¬íëì§ íì¸
    if (!scene.textures.exists(imageKey)) {
      // í´ë°± ë²í¼ ìì±
      ButtonFactory.createFallbackButton(scene, imageKey);
    }
    
    // ë²í¼ ì´ë¯¸ì§ ìì±
    const button = scene.add.image(x, y, imageKey);
    button.setDisplaySize(width, height);
    button.setInteractive({ useHandCursor: true });
    button.setScrollFactor(0); // ì¹´ë©ë¼ ì´ëì ìí¥ë°ì§ ìëë¡ ì¤ì 
    button.setDepth(depth);
    
    // ë²í¼ íì¤í¸ ìì±
    const buttonText = scene.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: fontSize,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    buttonText.setOrigin(0.5);
    buttonText.setScrollFactor(0); // ì¹´ë©ë¼ ì´ëì ìí¥ë°ì§ ìëë¡ ì¤ì 
    buttonText.setDepth(depth + 1); // íì¤í¸ê° ë²í¼ ìì íìëëë¡ depth ì¤ì 
    
    // í´ë¦­ ì´ë²¤í¸ ì¤ì 
    button.on('pointerdown', onClick);
    
    // í¸ë² í¨ê³¼
    button.on('pointerover', () => {
      button.setTint(0xdddddd);
    });
    
    button.on('pointerout', () => {
      button.clearTint();
    });
    
    return { button, text: buttonText };
  }
  
  /**
   * í´ë°± ë²í¼ íì¤ì² ìì± (ì´ë¯¸ì§ ë¡ë ì¤í¨ ì)
   * @param scene íì¤ì²ë¥¼ ìì±í  ì¬
   * @param key ìì±í  íì¤ì² í¤
   */
  static createFallbackButton(scene: Phaser.Scene, key: string) {
    console.log(`Creating fallback button texture: ${key}`);
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    
    // ë²í¼ ìì ê²°ì 
    let color = 0x3498db; // ê¸°ë³¸ íëì
    
    if (key.includes('blue')) {
      color = 0x3498db; // íëì
    } else if (key.includes('red')) {
      color = 0xe74c3c; // ë¹¨ê°ì
    } else if (key.includes('green')) {
      color = 0x2ecc71; // ì´ë¡ì
    }
    
    // ë²í¼ ë°°ê²½
    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, 180, 60, 10);
    
    // ë²í¼ íëë¦¬
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRoundedRect(0, 0, 180, 60, 10);
    
    // íì¤ì² ìì±
    graphics.generateTexture(key, 180, 60);
    graphics.destroy();
  }
}
