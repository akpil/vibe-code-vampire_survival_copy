import Phaser from 'phaser';

// Create a global event emitter for game events
export const gameEvents = new Phaser.Events.EventEmitter();

// Event types
export const GameEvents = {
  HEALTH_CHANGED: 'health-changed',
  LEVEL_CHANGED: 'level-changed',
  XP_CHANGED: 'xp-changed',
  KILLS_CHANGED: 'kills-changed',
  TIME_CHANGED: 'time-changed',
  GAME_OVER: 'game-over',
  ENEMY_KILLED: 'enemy-killed',
  ASSETS_LOADED: 'assets-loaded',
  SCENE_CHANGED: 'scene-changed' // 새로 추가: 씬 변경 이벤트
};
