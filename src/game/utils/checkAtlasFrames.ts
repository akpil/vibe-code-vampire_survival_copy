import Phaser from 'phaser';

/**
 * 캐릭터 아틀라스의 모든 프레임을 확인하고 분석하는 유틸리티 함수
 * @param scene 현재 씬
 */
export function checkAtlasFrames(scene: Phaser.Scene): { 
  allFrames: string[],
  enemyFrames: {
    ghost: string[],
    skeleton: string[],
    demon: string[],
    other: string[]
  }
} {
  if (!scene.textures.exists('characters')) {
    console.error('Characters atlas not found!');
    return { 
      allFrames: [], 
      enemyFrames: { ghost: [], skeleton: [], demon: [], other: [] } 
    };
  }

  // 모든 프레임 가져오기
  const allFrames = scene.textures.get('characters').getFrameNames();
  
  // 적 타입별 프레임 필터링
  const ghostFrames = allFrames.filter(frame => 
    frame.toLowerCase().includes('ghost') || 
    frame.toLowerCase().includes('cha_ghost')
  );
  
  const skeletonFrames = allFrames.filter(frame => 
    frame.toLowerCase().includes('skeleton') || 
    frame.toLowerCase().includes('cha_skeleton')
  );
  
  const demonFrames = allFrames.filter(frame => 
    frame.toLowerCase().includes('demon') || 
    frame.toLowerCase().includes('cha_demon')
  );
  
  // 다른 몬스터 관련 프레임 찾기 (demon 대체용)
  const monsterFrames = allFrames.filter(frame => 
    frame.toLowerCase().includes('monster') || 
    frame.toLowerCase().includes('enemy') ||
    frame.toLowerCase().includes('zombie') ||
    frame.toLowerCase().includes('vampire')
  );
  
  // 결과 로깅
  console.log('=== 캐릭터 아틀라스 프레임 분석 ===');
  console.log('총 프레임 수:', allFrames.length);
  console.log('Ghost 프레임:', ghostFrames);
  console.log('Skeleton 프레임:', skeletonFrames);
  console.log('Demon 프레임:', demonFrames);
  console.log('기타 몬스터 프레임:', monsterFrames);
  console.log('모든 프레임:', allFrames);
  
  // 적 타입별 프레임이 없는 경우 대체 프레임 찾기
  const otherEnemyFrames = monsterFrames.filter(frame => 
    !ghostFrames.includes(frame) && 
    !skeletonFrames.includes(frame) &&
    !demonFrames.includes(frame)
  );
  
  return {
    allFrames,
    enemyFrames: {
      ghost: ghostFrames,
      skeleton: skeletonFrames,
      demon: demonFrames.length > 0 ? demonFrames : otherEnemyFrames,
      other: otherEnemyFrames
    }
  };
}
