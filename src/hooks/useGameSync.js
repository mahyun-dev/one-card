import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../api/firebase';
import useGameStore from '../store/useGameStore';

/**
 * Firebase RTDB와 실시간 동기화하는 훅
 * @param {string} roomCode - 동기화할 방 코드
 * @returns {object} 게임 상태 및 동기화 상태
 */
const useGameSync = (roomCode) => {
  const [isConnected, setIsConnected] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const { setCurrentRoom, player } = useGameStore();

  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(database, `rooms/${roomCode}`);

    // 실시간 데이터 구독
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.val();
          setCurrentRoom(roomData);
          setIsConnected(true);
          setSyncError(null);
        } else {
          setSyncError('방을 찾을 수 없습니다.');
          setIsConnected(false);
        }
      },
      (error) => {
        console.error('Firebase sync error:', error);
        setSyncError(error.message);
        setIsConnected(false);
      }
    );

    // 연결 상태 모니터링
    const connectedRef = ref(database, '.info/connected');
    const connectedListener = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true;
      setIsConnected(connected);
    });

    // Cleanup
    return () => {
      off(roomRef);
      off(connectedRef);
    };
  }, [roomCode, setCurrentRoom]);

  return {
    isConnected,
    syncError,
  };
};

export default useGameSync;
