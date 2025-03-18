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
  
  // ì í¬ ì¬ììë§ UIë¥¼ íìíê¸° ìí ìí
  const [showUI, setShowUI] = useState(false);
  
  useEffect(() => {
    // ì¬ ë³ê²½ ì´ë²¤í¸ êµ¬ë
    const sceneListener = gameEvents.on('scene-changed', (sceneName: string) => {
      setCurrentScene(sceneName);
      
      // MainSceneì¼ ëë§ UI íì
      setShowUI(sceneName === SceneKeys.MAIN);
    });
    
    // ê²ì ì´ë²¤í¸ êµ¬ë
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
    
    // ì»´í¬ëí¸ ì¸ë§ì´í¸ ì ì´ë²¤í¸ ë¦¬ì¤ë ì ë¦¬
    return () => {
      sceneListener.destroy();
      healthListener.destroy();
      levelListener.destroy();
      xpListener.destroy();
      scoreListener.destroy();
      gameOverListener.destroy();
    };
  }, []);
  
  // ê²ì ì¬ìì
  const handleRestart = () => {
    setGameOver(false);
    setHealth(100);
    setLevel(1);
    setXP(0);
    setXPToNextLevel(100);
    setScore(0);
    
    // ê²ì ì¬ìì ì´ë²¤í¸ ë°ì
    gameEvents.emit('restart-game');
    
    // íì´ì§ ìë¡ê³ ì¹¨ (ê°ë¨í ë°©ë²)
    window.location.reload();
  };
  
  // UIê° íìëì§ ììì¼ íë ê²½ì° ë¹ ì»´í¬ëí¸ ë°í
  if (!showUI && !gameOver) {
    return null;
  }
  
  return (
    <div className="game-ui">
      {/* ìí íì UI */}
      {showUI && (
        <div className="stats-container">
          <div className="stat">
            <div className="stat-label">ì²´ë ¥</div>
            <div className="health-bar">
              <div 
                className="health-fill" 
                style={{ width: `${Math.max(0, health)}%` }}
              />
            </div>
          </div>
          
          <div className="stat">
            <div className="stat-label">ë ë²¨ {level}</div>
            <div className="xp-bar">
              <div 
                className="xp-fill" 
                style={{ width: `${(xp / xpToNextLevel) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="stat">
            <div className="stat-label">ì ì: {score}</div>
          </div>
        </div>
      )}
      
      {/* ê²ì ì¤ë² íë©´ */}
      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-panel">
            <h2>ê²ì ì¤ë²</h2>
            <p>ìµì¢ ì ì: {score}</p>
            <p>ìµì¢ ë ë²¨: {level}</p>
            <button onClick={handleRestart}>ë¤ì ìì</button>
          </div>
        </div>
      )}
    </div>
  );
};
