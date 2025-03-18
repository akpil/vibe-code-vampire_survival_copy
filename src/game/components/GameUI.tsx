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
    
    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      healthListener.destroy();
      levelListener.destroy();
      xpListener.destroy();
      killsListener.destroy();
      timeListener.destroy();
      gameOverListener.destroy();
    };
  }, []);
  
  // 게임 재시작
  const handleRestart = () => {
    setGameOver(false);
    setHealth(100);
    setLevel(1);
    setXP({ current: 0, max: 100 });
    setKills(0);
    setGameTime(0);
    
    // 게임 재시작 이벤트 발생
    gameEvents.emit('restart-game');
    
    // 페이지 새로고침 (간단한 방법)
    window.location.reload();
  };
  
  // 시간 포맷팅 (mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
              style={{ width: `${(xp.current / xp.max) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-label">처치: {kills}</div>
        </div>
        
        <div className="stat">
          <div className="stat-label">시간: {formatTime(gameTime)}</div>
        </div>
      </div>
      
      {/* 게임 오버 화면 */}
      {gameOver && (
        <div className="game-over-container">
          <div className="game-over-panel">
            <h2>게임 오버</h2>
            <p>생존 시간: {formatTime(gameTime)}</p>
            <p>처치 수: {kills}</p>
            <p>최종 레벨: {level}</p>
            <button onClick={handleRestart}>다시 시작</button>
          </div>
        </div>
      )}
    </div>
  );
};
