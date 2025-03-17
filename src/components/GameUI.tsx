import { useState, useEffect } from "react";
import { gameEvents } from "../game/events";

export const GameUI = () => {
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState(0);
  const [xpToNextLevel, setXPToNextLevel] = useState(100);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  useEffect(() => {
    // 게임 이벤트 구독
    const healthListener = gameEvents.on('health-changed', (newHealth: number) => {
      setHealth(newHealth);
      if (newHealth <= 0) {
        setGameOver(true);
      }
    });
    
    const levelListener = gameEvents.on('level-changed', (newLevel: number) => {
      setLevel(newLevel);
    });
    
    const xpListener = gameEvents.on('xp-changed', (newXP: number, newXPToNextLevel: number) => {
      setXP(newXP);
      setXPToNextLevel(newXPToNextLevel);
    });
    
    const scoreListener = gameEvents.on('score-changed', (newScore: number) => {
      setScore(newScore);
    });
    
    const gameOverListener = gameEvents.on('game-over', () => {
      setGameOver(true);
    });
    
    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      healthListener.destroy();
      levelListener.destroy();
      xpListener.destroy();
      scoreListener.destroy();
      gameOverListener.destroy();
    };
  }, []);
  
  // 게임 재시작
  const handleRestart = () => {
    setGameOver(false);
    setHealth(100);
    setLevel(1);
    setXP(0);
    setXPToNextLevel(100);
    setScore(0);
    
    // 게임 재시작 이벤트 발생
    gameEvents.emit('restart-game');
    
    // 페이지 새로고침 (간단한 방법)
    window.location.reload();
  };
  
  return (
    <div className="game-ui">
      {/* 상태 표시 UI */}
      <div className="stats-container">
        <div className="stat">
          <div className="stat-label">체력</div>
          <div className="health-bar">
            <div 
              className="health-fill" 
              style={{ width: `${Math.max(0, health)}%` }}
            />
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-label">레벨 {level}</div>
          <div className="xp-bar">
            <div 
              className="xp-fill" 
              style={{ width: `${(xp / xpToNextLevel) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-label">점수: {score}</div>
        </div>
      </div>
      
      {/* 게임 오버 화면 */}
      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-panel">
            <h2>게임 오버</h2>
            <p>최종 점수: {score}</p>
            <p>최종 레벨: {level}</p>
            <button onClick={handleRestart}>다시 시작</button>
          </div>
        </div>
      )}
    </div>
  );
};
