import { CARD_TYPES, WILD_CARDS, SPECIAL_CARDS } from './cardDeck';

/**
 * 카드를 낼 수 있는지 검증
 * @param {object} card - 플레이하려는 카드
 * @param {object} lastCard - 버린 카드 더미의 마지막 카드
 * @param {number} attackStack - 현재 누적된 공격 카드 수
 * @returns {boolean} 카드를 낼 수 있으면 true
 */
export const canPlayCard = (card, lastCard, attackStack = 0) => {
  // 와일드 카드는 항상 낼 수 있음
  if (card.type === CARD_TYPES.WILD) {
    return true;
  }

  // 공격 카드가 쌓여있는 경우
  if (attackStack > 0) {
    // 공격 카드로만 방어 가능
    if (card.value === SPECIAL_CARDS.DRAW_TWO || card.value === WILD_CARDS.WILD_DRAW_FOUR) {
      return true;
    }
    // 그 외의 카드는 낼 수 없음
    return false;
  }

  // 마지막 카드가 와일드 카드인 경우, 선택된 색상으로 비교
  const lastColor = lastCard.selectedColor || lastCard.color;

  // 같은 색상이면 가능
  if (card.color === lastColor) {
    return true;
  }

  // 같은 숫자/기호면 가능
  if (card.value === lastCard.value) {
    return true;
  }

  return false;
};

/**
 * 다음 플레이어 인덱스 계산
 * @param {number} currentIndex - 현재 플레이어 인덱스
 * @param {number} totalPlayers - 전체 플레이어 수
 * @param {number} direction - 게임 방향 (1: 정방향, -1: 역방향)
 * @param {boolean} skip - 스킵 여부
 * @returns {number} 다음 플레이어 인덱스
 */
export const getNextPlayerIndex = (currentIndex, totalPlayers, direction = 1, skip = false) => {
  let nextIndex = currentIndex + direction;
  
  if (skip) {
    nextIndex += direction;
  }

  // 순환 처리
  if (nextIndex >= totalPlayers) {
    nextIndex = nextIndex % totalPlayers;
  } else if (nextIndex < 0) {
    nextIndex = totalPlayers + nextIndex;
  }

  return nextIndex;
};

/**
 * 플레이어가 낼 수 있는 카드 찾기
 * @param {Array} hand - 플레이어의 손패
 * @param {object} lastCard - 버린 카드 더미의 마지막 카드
 * @param {number} attackStack - 현재 누적된 공격 카드 수
 * @returns {Array} 낼 수 있는 카드 배열
 */
export const getPlayableCards = (hand, lastCard, attackStack = 0) => {
  return hand.filter(card => canPlayCard(card, lastCard, attackStack));
};

/**
 * 플레이어가 "UNO"를 외쳐야 하는지 확인
 * @param {number} cardsLeft - 남은 카드 수
 * @returns {boolean} UNO를 외쳐야 하면 true
 */
export const shouldCallUno = (cardsLeft) => {
  return cardsLeft === 1;
};

/**
 * 게임 승리 조건 확인
 * @param {number} cardsLeft - 남은 카드 수
 * @returns {boolean} 승리 조건이면 true
 */
export const checkWinCondition = (cardsLeft) => {
  return cardsLeft === 0;
};

/**
 * AI가 낼 카드를 선택하는 로직 (간단한 전략)
 * @param {Array} hand - AI의 손패
 * @param {object} lastCard - 버린 카드 더미의 마지막 카드
 * @param {number} attackStack - 현재 누적된 공격 카드 수
 * @returns {object|null} 선택된 카드 또는 null
 */
export const selectAICard = (hand, lastCard, attackStack = 0) => {
  const playableCards = getPlayableCards(hand, lastCard, attackStack);

  if (playableCards.length === 0) {
    return null;
  }

  // 우선순위 기반 선택
  // 1. 공격 카드가 쌓여있으면 공격 카드로 방어
  if (attackStack > 0) {
    const attackCards = playableCards.filter(
      card => card.value === SPECIAL_CARDS.DRAW_TWO || card.value === WILD_CARDS.WILD_DRAW_FOUR
    );
    if (attackCards.length > 0) {
      return attackCards[0];
    }
  }

  // 2. 특수 카드 우선
  const specialCards = playableCards.filter(card => card.type === CARD_TYPES.SPECIAL);
  if (specialCards.length > 0) {
    // 드로우 2 > 스킵 > 리버스 순으로 선호
    const drawTwo = specialCards.find(card => card.value === SPECIAL_CARDS.DRAW_TWO);
    if (drawTwo) return drawTwo;

    const skip = specialCards.find(card => card.value === SPECIAL_CARDS.SKIP);
    if (skip) return skip;

    return specialCards[0];
  }

  // 3. 숫자 카드 중 가장 큰 숫자
  const numberCards = playableCards.filter(card => card.type === CARD_TYPES.NUMBER);
  if (numberCards.length > 0) {
    numberCards.sort((a, b) => b.value - a.value);
    return numberCards[0];
  }

  // 4. 와일드 카드 (마지막 수단)
  return playableCards[0];
};

/**
 * AI가 와일드 카드로 선택할 색상 결정
 * @param {Array} hand - AI의 손패
 * @returns {string} 선택된 색상
 */
export const selectAIColor = (hand) => {
  // 손패에서 가장 많은 색상 선택
  const colorCount = {
    red: 0,
    yellow: 0,
    green: 0,
    blue: 0,
  };

  hand.forEach(card => {
    if (colorCount[card.color] !== undefined) {
      colorCount[card.color]++;
    }
  });

  // 가장 많은 색상 반환
  const sortedColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
  return sortedColors[0][0];
};

/**
 * 카드 효과 설명 반환
 * @param {string} value - 카드 값
 * @returns {string} 효과 설명
 */
export const getCardEffectDescription = (value) => {
  const effects = {
    'skip': '다음 플레이어의 차례를 건너뜁니다',
    'reverse': '게임 진행 방향을 반대로 바꿉니다',
    'draw-two': '다음 플레이어가 카드 2장을 뽑고 차례를 건너뜁니다',
    'wild': '원하는 색상으로 변경할 수 있습니다',
    'wild-draw': '다음 플레이어가 카드 4장을 뽑고, 원하는 색상으로 변경할 수 있습니다',
  };

  return effects[value] || '일반 카드입니다';
};
