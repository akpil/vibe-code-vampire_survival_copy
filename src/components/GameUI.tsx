import { useState, useEffect } from "react";
import { gameEvents } from "../game/events";
import { SceneKeys } from "../game/types/SceneKeys";

export const GameUI = () => {
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState(0);
  const [xpToNextLevel, setXPToNextLevel] = useState(100);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentScene, setCurrentScene] = useState<string>(SceneKeys.TITLE);
  
  // State to show UI only in combat scene
  const [showUI, setShowUI] = useState(false);
  
  useEffect(() => {
    // Subscribe to scene change event
    const sceneListener = gameEvents.on('scene-changed', (sceneName: string) => {
      setCurrentScene(sceneName);
      
      // Only show UI in MainScene
      setShowUI(sceneName === SceneKeys.MAIN);
    });
    
    // Subscribe to game events
    const healthListener = gameEvents.on('health-changed', (newHealth: number) => {
      setHealth(newHealth);
      if (newHealth <= 0) {
        setGameOver(true);
      }
    });
    
    const levelListener = gameEvents.on('level-changed', (newLevel: number) => {
      setLevel(newLevel);
    });
    
    const xpListener = gameEvents.on('xp-changed', (data: { current: number, max: number }) => {
      setXP(data.current);
      setXPToNextLevel(data.max);
    });
    
    const scoreListener = gameEvents.on('kills-changed', (newScore: number) => {
      setScore(newScore);
    });
    
    const gameOverListener = gameEvents.on('game-over', () => {
      setGameOver(true);
    });
    
    // Clean up event listeners on component unmount
    return () => {
      sceneListener.destroy();
      healthListener.destroy();
      levelListener.destroy();
      xpListener.destroy();
      scoreListener.destroy();
      gameOverListener.destroy();
    };
  }, []);
  
  // Restart game
  const handleRestart = () => {
    setGameOver(false);
    setHealth(100);
    setLevel(1);
    setXP(0);
    setXPToNextLevel(100);
    setScore(0);
    
    // Emit restart game event
    gameEvents.emit('restart-game');
    
    // Refresh page (simple method)
    window.location.reload();
  };
  
  // Return empty component if UI shouldn't be shown
  if (!showUI && !gameOver) {
    return null;
  }
  
  return (
    <div className="game-ui">
      {/* Stats display UI */}
      {showUI && (
        <div className="stats-container">
          <div className="stat">
            <div className="stat-label">Health</div>
            <div className="health-bar">
              <div 
                className="health-fill" 
                style={{ width: `${Math.max(0, health)}%` }}
              />
            </div>
          </div>
          
          <div className="stat">
            <div className="stat-label">Level {level}</div>
            <div className="xp-bar">
              <div 
                className="xp-fill" 
                style={{ width: `${(xp / xpToNextLevel) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="stat">
            <div className="stat-label">Score: {score}</div>
          </div>
        </div>
      )}
      
      {/* Game over screen */}
      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-panel">
            <h2>Game Over</h2>
            <p>Final Score: {score}</p>
            <p>Final Level: {level}</p>
            <button onClick={handleRestart}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};
