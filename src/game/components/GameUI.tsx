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
    
    // Clean up event listeners on component unmount
    return () => {
      healthListener.destroy();
      levelListener.destroy();
      xpListener.destroy();
      killsListener.destroy();
      timeListener.destroy();
      gameOverListener.destroy();
    };
  }, []);
  
  // Restart game
  const handleRestart = () => {
    setGameOver(false);
    setHealth(100);
    setLevel(1);
    setXP({ current: 0, max: 100 });
    setKills(0);
    setGameTime(0);
    
    // Emit restart game event
    gameEvents.emit('restart-game');
    
    // Refresh page (simple method)
    window.location.reload();
  };
  
  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="game-ui">
      {/* Stats display UI */}
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
              style={{ width: `${(xp.current / xp.max) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-label">Kills: {kills}</div>
        </div>
        
        <div className="stat">
          <div className="stat-label">Time: {formatTime(gameTime)}</div>
        </div>
      </div>
      
      {/* Game over screen */}
      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-panel">
            <h2>Game Over</h2>
            <p>Survival Time: {formatTime(gameTime)}</p>
            <p>Kills: {kills}</p>
            <p>Final Level: {level}</p>
            <button onClick={handleRestart}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};
