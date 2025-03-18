import { useEffect, useRef } from "react";
import "./App.css";
import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene";
import { TitleScene } from "./game/scenes/TitleScene";
import { ChapterSelectScene } from "./game/scenes/ChapterSelectScene";
import { CharacterSelectScene } from "./game/scenes/CharacterSelectScene";
import { MainScene } from "./game/scenes/MainScene";
import { PauseScene } from "./game/scenes/PauseScene";
import { GameUI } from "./components/GameUI";

function App() {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  
  useEffect(() => {
    if (!gameRef.current) return;
    
    // ì´ë¯¸ ê²ì ì¸ì¤í´ì¤ê° ìì¼ë©´ ì ê±°
    if (gameInstance.current) {
      gameInstance.current.destroy(true);
      gameInstance.current = null;
    }
    
    // ê²ì ì»¨íì´ë ì´ê¸°í
    while (gameRef.current.firstChild) {
      gameRef.current.removeChild(gameRef.current.firstChild);
    }
    
    // ê²ì ì¤ì 
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#000',
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { x: 0, y: 0 }
        }
      },
      scene: [BootScene, TitleScene, ChapterSelectScene, CharacterSelectScene, MainScene, PauseScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };
    
    // ê²ì ì¸ì¤í´ì¤ ìì±
    try {
      gameInstance.current = new Phaser.Game(config);
      console.log("Phaser game initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Phaser game:", error);
    }
    
    // ì»´í¬ëí¸ ì¸ë§ì´í¸ ì ì ë¦¬
    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, []);
  
  return (
    <div className="game-container">
      <div ref={gameRef} className="phaser-container" />
      <GameUI />
    </div>
  );
}

export default App;
