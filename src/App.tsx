import { useEffect, useRef } from "react";
import "./App.css";
import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene";
import { TitleScene } from "./game/scenes/TitleScene";
import { ChapterSelectScene } from "./game/scenes/ChapterSelectScene";
import { CharacterSelectScene } from "./game/scenes/CharacterSelectScene";
import { MainScene } from "./game/scenes/MainScene";
import { GameUI } from "./components/GameUI";

function App() {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  
  useEffect(() => {
    if (!gameRef.current) return;
    
    // 이미 게임 인스턴스가 있으면 제거
    if (gameInstance.current) {
      gameInstance.current.destroy(true);
      gameInstance.current = null;
    }
    
    // 게임 컨테이너 초기화
    while (gameRef.current.firstChild) {
      gameRef.current.removeChild(gameRef.current.firstChild);
    }
    
    // 게임 설정
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
      scene: [BootScene, TitleScene, ChapterSelectScene, CharacterSelectScene, MainScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };
    
    // 게임 인스턴스 생성
    try {
      gameInstance.current = new Phaser.Game(config);
      console.log("Phaser game initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Phaser game:", error);
    }
    
    // 컴포넌트 언마운트 시 정리
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
