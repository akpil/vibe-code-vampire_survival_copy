import { useState, useEffect } from "react";
import { gameEvents } from "../events";

export const GameUI = () => {
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState({ current: 0, max: 100 });
  const [kills, setKills] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  useEffect(() => {
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
    
    const xpListener = gameEvents.on('xp-changed', (xpData: { current: number, max: number }) => {
      setXP(xpData);
    });
    
    const killsListener = gameEvents.on('kills-changed', (newKills: number) => {
      setKills(newKills);
    });
    
    const timeListener = gameEvents.on('time-changed', (newTime: number) => {
      setGameTime(newTime);
    });
    
    const gameOverListener = gameEvents.on('game-over', () => {
      setGameOver(true);
    });
    
    // ì»´í¬ëí¸ ì¸ë§ì´í¸ ì ì´ë²¤í¸ ë¦¬ì¤ë ì ë¦¬
    return () => {
      healthListener.destroy();
      levelListener.destroy();
      xpListener.destroy();
      killsListener.destroy();
      timeListener.destroy();
      gameOverListener.destroy();
    };
  }, []);
  
  // ê²ì ì¬ìì
  const handleRestart = () => {
    setGameOver(false);
    setHealth(100);
    setLevel(1);
    setXP({ current: 0, max: 100 });
    setKills(0);
    setGameTime(0);
    
    // ê²ì ì¬ìì ì´ë²¤í¸ ë°ì
    gameEvents.emit('restart-game');
    
    // íì´ì§ ìë¡ê³ ì¹¨ (ê°ë¨í ë°©ë²)
    window.location.reload();
  };
  
  // ìê° í¬ë§·í (mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="game-ui">
      {/* ìí íì UI */}
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
        <boltAction type="file" filePath="src/game/components/GameUI.tsx">
        <div className="stat">
          <div className="stat-label">ë ë²¨ {level}</div>
          <div className="xp-bar">
            <div 
              className="xp-fill" 
              style={{ width: `${(xp.current / xp.max) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-label">ì²ì¹: {kills}</div>
        </div>
        
        <div className="stat">
          <div className="stat-label">ìê°: {formatTime(gameTime)}</div>
        </div>
      </div>
      
      {/* ê²ì ì¤ë² íë©´ */}
      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-panel">
            <h2>ê²ì ì¤ë²</h2>
            <p>ìì¡´ ìê°: {formatTime(gameTime)}</p>
            <p>ì²ì¹ ì: {kills}</p>
            <p>ìµì¢ ë ë²¨: {level}</p>
            <button onClick={handleRestart}>ë¤ì ìì</button>
          </div>
        </div>
      )}
    </div>
  );
};
