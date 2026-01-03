import { create } from 'zustand';
import { nanoid } from 'nanoid';

/**
 * 게임 전역 상태 관리
 */
const useGameStore = create((set, get) => ({
  // 플레이어 정보
  player: {
    uid: null,
    name: null,
  },

  // 현재 방 정보
  currentRoom: null,
  roomCode: null,

  // 게임 모드
  gameMode: null, // 'multiplayer' | 'ai'

  // 로컬 게임 상태 (AI 모드용)
  localGame: null,

  // UI 상태
  isLoading: false,
  error: null,

  // Actions
  setPlayer: (uid, name) => set({ 
    player: { uid, name } 
  }),

  initializePlayer: () => {
    const state = get();
    if (!state.player.uid) {
      // 로컬 스토리지에서 플레이어 정보 복원 또는 생성
      const savedPlayer = localStorage.getItem('uno-player');
      if (savedPlayer) {
        const player = JSON.parse(savedPlayer);
        set({ player });
      } else {
        const newPlayer = {
          uid: nanoid(),
          name: `Player_${Math.floor(Math.random() * 10000)}`,
        };
        localStorage.setItem('uno-player', JSON.stringify(newPlayer));
        set({ player: newPlayer });
      }
    }
  },

  setPlayerName: (name) => {
    const state = get();
    const updatedPlayer = { ...state.player, name };
    localStorage.setItem('uno-player', JSON.stringify(updatedPlayer));
    set({ player: updatedPlayer });
  },

  setCurrentRoom: (roomData) => set({ currentRoom: roomData }),

  setRoomCode: (code) => set({ roomCode: code }),

  setGameMode: (mode) => set({ gameMode: mode }),

  setLocalGame: (gameData) => set({ localGame: gameData }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  resetGame: () => set({
    currentRoom: null,
    roomCode: null,
    gameMode: null,
    localGame: null,
    error: null,
  }),
}));

export default useGameStore;
