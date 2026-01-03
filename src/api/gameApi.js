import { ref, get, update, push, serverTimestamp } from 'firebase/database';
import { database } from './firebase';
import { createDeck, shuffleDeck } from '../utils/cardDeck';
import { canPlayCard } from '../utils/gameRules';

/**
 * 게임 시작
 * @param {string} roomCode - 방 코드
 */
export const startGame = async (roomCode) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('방을 찾을 수 없습니다.');
  }

  const roomData = snapshot.val();
  const players = Object.values(roomData.players);

  // 모든 플레이어가 준비되었는지 확인
  const allReady = players.every(p => p.ready || p.uid === roomData.metadata.hostId);
  if (!allReady) {
    throw new Error('모든 플레이어가 준비되지 않았습니다.');
  }

  // 덱 생성 및 셔플
  let deck = createDeck();
  deck = shuffleDeck(deck);

  // 각 플레이어에게 7장씩 카드 분배
  const playerCards = {};
  let deckIndex = 0;

  players.forEach(player => {
    playerCards[player.uid] = deck.slice(deckIndex, deckIndex + 7);
    deckIndex += 7;
  });

  // 첫 카드를 버린 카드 더미에 배치 (특수 카드가 아닌 것으로)
  let firstCard = deck[deckIndex];
  while (firstCard.type === 'special') {
    deckIndex++;
    firstCard = deck[deckIndex];
  }
  deckIndex++;

  const remainingDeck = deck.slice(deckIndex);

  // 게임 상태 업데이트
  const updates = {
    'metadata/status': 'playing',
    'gameState/deck': remainingDeck,
    'gameState/discardPile': [firstCard],
    'gameState/currentTurn': players[0].uid,
    'gameState/direction': 1,
    'gameState/attackStack': 0,
    'gameState/startedAt': serverTimestamp(),
  };

  // 각 플레이어의 카드 업데이트
  players.forEach(player => {
    updates[`players/${player.uid}/cards`] = playerCards[player.uid];
  });

  await update(roomRef, updates);
};

/**
 * 카드 드로우
 * @param {string} roomCode - 방 코드
 * @param {string} playerId - 플레이어 UID
 * @param {number} count - 뽑을 카드 수
 */
export const drawCards = async (roomCode, playerId, count = 1) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('방을 찾을 수 없습니다.');
  }

  const roomData = snapshot.val();
  const deck = roomData.gameState.deck || [];
  const playerCards = roomData.players[playerId].cards || [];

  // 덱에 카드가 부족하면 버린 카드 더미를 섞어서 덱으로 사용
  let newDeck = [...deck];
  if (newDeck.length < count) {
    const discardPile = roomData.gameState.discardPile || [];
    const lastCard = discardPile[discardPile.length - 1];
    const cardsToShuffle = discardPile.slice(0, -1);
    newDeck = [...newDeck, ...shuffleDeck(cardsToShuffle)];
  }

  // 카드 뽑기
  const drawnCards = newDeck.splice(0, count);
  const newPlayerCards = [...playerCards, ...drawnCards];

  const updates = {
    'gameState/deck': newDeck,
    [`players/${playerId}/cards`]: newPlayerCards,
  };

  await update(roomRef, updates);

  return drawnCards;
};

/**
 * 카드 플레이
 * @param {string} roomCode - 방 코드
 * @param {string} playerId - 플레이어 UID
 * @param {object} card - 플레이할 카드
 * @param {string} selectedColor - 선택한 색상 (색상 변경 카드의 경우)
 */
export const playCard = async (roomCode, playerId, card, selectedColor = null) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('방을 찾을 수 없습니다.');
  }

  const roomData = snapshot.val();
  const discardPile = roomData.gameState.discardPile || [];
  const lastCard = discardPile[discardPile.length - 1];
  const playerCards = roomData.players[playerId].cards || [];

  // 카드를 낼 수 있는지 검증
  if (!canPlayCard(card, lastCard, roomData.gameState.attackStack)) {
    throw new Error('이 카드를 낼 수 없습니다.');
  }

  // 플레이어 손에서 카드 제거
  const cardIndex = playerCards.findIndex(c => c.id === card.id);
  if (cardIndex === -1) {
    throw new Error('보유하지 않은 카드입니다.');
  }

  const newPlayerCards = [...playerCards];
  newPlayerCards.splice(cardIndex, 1);

  // 버린 카드 더미에 추가
  const cardToDiscard = { ...card };
  if (selectedColor && (card.value === 'wild' || card.value === 'wild-draw')) {
    cardToDiscard.selectedColor = selectedColor;
  }

  const newDiscardPile = [...discardPile, cardToDiscard];

  const updates = {
    'gameState/discardPile': newDiscardPile,
    [`players/${playerId}/cards`]: newPlayerCards,
    'gameState/lastPlayedAt': serverTimestamp(),
  };

  // 특수 카드 효과 처리
  if (card.value === 'skip') {
    // 스킵: 다음 플레이어를 건너뜀
    updates['gameState/skipNext'] = true;
  } else if (card.value === 'reverse') {
    // 리버스: 방향 전환
    updates['gameState/direction'] = roomData.gameState.direction * -1;
  } else if (card.value === 'draw-two') {
    // 드로우 2: 공격 스택 추가
    updates['gameState/attackStack'] = (roomData.gameState.attackStack || 0) + 2;
  } else if (card.value === 'wild-draw') {
    // 와일드 드로우 4: 공격 스택 추가
    updates['gameState/attackStack'] = (roomData.gameState.attackStack || 0) + 4;
  } else {
    // 일반 카드: 공격 스택 초기화
    updates['gameState/attackStack'] = 0;
  }

  await update(roomRef, updates);

  // 승리 조건 확인
  if (newPlayerCards.length === 0) {
    await endGame(roomCode, playerId);
  }

  return newPlayerCards.length;
};

/**
 * 턴 넘기기
 * @param {string} roomCode - 방 코드
 */
export const nextTurn = async (roomCode) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('방을 찾을 수 없습니다.');
  }

  const roomData = snapshot.val();
  const players = Object.values(roomData.players).filter(p => p.online);
  const currentTurn = roomData.gameState.currentTurn;
  const direction = roomData.gameState.direction;
  const skipNext = roomData.gameState.skipNext || false;

  // 현재 플레이어 인덱스 찾기
  const currentIndex = players.findIndex(p => p.uid === currentTurn);
  
  // 다음 플레이어 결정
  let nextIndex = currentIndex + direction;
  if (skipNext) {
    nextIndex += direction; // 스킵 효과
  }

  // 인덱스 순환 처리
  if (nextIndex >= players.length) {
    nextIndex = nextIndex % players.length;
  } else if (nextIndex < 0) {
    nextIndex = players.length + nextIndex;
  }

  const updates = {
    'gameState/currentTurn': players[nextIndex].uid,
    'gameState/skipNext': false,
    'gameState/turnChangedAt': serverTimestamp(),
  };

  await update(roomRef, updates);
};

/**
 * 게임 종료
 * @param {string} roomCode - 방 코드
 * @param {string} winnerId - 승리자 UID
 */
export const endGame = async (roomCode, winnerId) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  const updates = {
    'metadata/status': 'result',
    'metadata/winnerId': winnerId,
    'metadata/endedAt': serverTimestamp(),
  };

  await update(roomRef, updates);
};

/**
 * 공격 받기 (카드 드로우 후 턴 넘김)
 * @param {string} roomCode - 방 코드
 * @param {string} playerId - 플레이어 UID
 */
export const takeAttack = async (roomCode, playerId) => {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('방을 찾을 수 없습니다.');
  }

  const roomData = snapshot.val();
  const attackStack = roomData.gameState.attackStack || 0;

  if (attackStack > 0) {
    // 공격 카드 수만큼 드로우
    await drawCards(roomCode, playerId, attackStack);
    
    // 공격 스택 초기화
    await update(roomRef, {
      'gameState/attackStack': 0,
    });
  }

  // 턴 넘기기
  await nextTurn(roomCode);
};
