import { useEffect, useRef } from "react";
import "./App.css";
import { GameUI } from "./components/GameUI";
import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene";
import { TitleScene } from "./game/scenes/TitleScene";
import { MainScene } from "./game/scenes/MainScene";
import { CharacterSelectScene } from "./game/scenes/CharacterSelectScene";
import { ChapterSelectScene } from "./game/scenes/ChapterSelectScene";
import { PauseScene } from "./game/scenes/PauseScene";

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scene: [
          BootScene,
          TitleScene,
          CharacterSelectScene,
          ChapterSelectScene,
          MainScene,
          PauseScene,
        ],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        pixelArt: true,
      };

      gameRef.current = new Phaser.Game(config);

      // ì°½ í¬ê¸° ë³ê²½ ì ê²ì í¬ê¸° ì¡°ì 
      const resizeGame = () => {
        if (gameRef.current) {
          gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener("resize", resizeGame);

      // ì»´í¬ëí¸ ì¸ë§ì´í¸ ì ì ë¦¬
      return () => {
        window.removeEventListener("resize", resizeGame);
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }
  }, []);

  return (
    <div className="game-container">
      <div ref={containerRef} className="phaser-container" />
      <GameUI />
    </div>
  );
}

export default App;
