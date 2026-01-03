import { ref, set, get, update, onDisconnect, serverTimestamp } from 'firebase/database';
import { database } from './firebase';
import { nanoid } from 'nanoid';

/**
 * 6자리 영문+숫자 초대 코드 생성
 */
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 방 생성
 * @param {string} hostId - 방장 UID
 * @param {string} hostName - 방장 닉네임
 * @returns {Promise<string>} - 생성된 방 코드
 */
export const createRoom = async (hostId, hostName) => {
  let roomCode = generateRoomCode();
  let attempts = 0;
  const maxAttempts = 10;

  // 중복 방지: 코드가 이미 존재하면 재생성
  while (attempts < maxAttempts) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      break;
    }
    
    roomCode = generateRoomCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('방 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }

  // 방 데이터 구조 생성
  const roomData = {
    metadata: {
      hostId,
      status: 'waiting', // waiting, playing, result
      createdAt: serverTimestamp(),
    },
    gameState: {
      currentTurn: hostId,
      discardPile: [],
      direction: 1, // 1: 정방향, -1: 역방향
      attackStack: 0,
      deck: [],
    },
    players: {
      [hostId]: {
        uid: hostId,
        name: hostName,
        cards: [],
        online: true,
        ready: false,
        joinedAt: serverTimestamp(),
      },
    },
  };

  const roomRef = ref(database, `rooms/${roomCode}`);
  await set(roomRef, roomData);

  // 연결 끊김 처리
  setupDisconnectHandler(roomCode, hostId);

  return roomCode;
};

/**
 * 방 참여
 * @param {string} roomCode - 참여할 방 코드
 * @param {string} playerId - 플레이어 UID
 * @param {string} playerName - 플레이어 닉네임
 * @returns {Promise<boolean>} - 참여 성공 여부
 */
export const joinRoom = async (roomCode, playerId, playerName) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('존재하지 않는 방입니다.');
  }

  const roomData = snapshot.val();

  // 이미 게임이 시작된 방인지 확인
  if (roomData.metadata.status === 'playing') {
    throw new Error('이미 게임이 진행 중인 방입니다.');
  }

  // 플레이어 수 제한 (최대 4명)
  const playerCount = Object.keys(roomData.players || {}).length;
  if (playerCount >= 4) {
    throw new Error('방이 가득 찼습니다.');
  }

  // 플레이어 추가
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
  await set(playerRef, {
    uid: playerId,
    name: playerName,
    cards: [],
    online: true,
    ready: false,
    joinedAt: serverTimestamp(),
  });

  // 연결 끊김 처리
  setupDisconnectHandler(roomCode, playerId);

  return true;
};

/**
 * 방 코드 검증
 * @param {string} roomCode - 검증할 방 코드
 * @returns {Promise<boolean>} - 유효성 여부
 */
export const validateRoomCode = async (roomCode) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  return snapshot.exists();
};

/**
 * 플레이어 준비 상태 업데이트
 * @param {string} roomCode - 방 코드
 * @param {string} playerId - 플레이어 UID
 * @param {boolean} ready - 준비 상태
 */
export const updatePlayerReady = async (roomCode, playerId, ready) => {
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
  await update(playerRef, { ready });
};

/**
 * 연결 끊김 핸들러 설정
 * @param {string} roomCode - 방 코드
 * @param {string} playerId - 플레이어 UID
 */
const setupDisconnectHandler = (roomCode, playerId) => {
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
  const disconnectRef = onDisconnect(playerRef);
  
  disconnectRef.update({
    online: false,
    disconnectedAt: serverTimestamp(),
  });
};

/**
 * 방 나가기
 * @param {string} roomCode - 방 코드
 * @param {string} playerId - 플레이어 UID
 */
export const leaveRoom = async (roomCode, playerId) => {
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
  await update(playerRef, {
    online: false,
    leftAt: serverTimestamp(),
  });
};
