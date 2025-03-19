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

      // 창 크기 변경 시 게임 크기 조정
      const resizeGame = () => {
        if (gameRef.current) {
          gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener("resize", resizeGame);

      // 컴포넌트 언마운트 시 정리
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
