import { nanoid } from 'nanoid';

// 카드 색상
export const COLORS = ['red', 'yellow', 'green', 'blue'];

// 카드 타입
export const CARD_TYPES = {
  NUMBER: 'number',
  SPECIAL: 'special',
  WILD: 'wild',
};

// 특수 카드
export const SPECIAL_CARDS = {
  SKIP: 'skip',           // 스킵
  REVERSE: 'reverse',     // 리버스
  DRAW_TWO: 'draw-two',   // 드로우 2
};

// 와일드 카드
export const WILD_CARDS = {
  WILD: 'wild',                 // 색상 변경
  WILD_DRAW_FOUR: 'wild-draw',  // 드로우 4 + 색상 변경
};

/**
 * UNO 카드 덱 생성
 * @returns {Array} 카드 배열
 */
export const createDeck = () => {
  const deck = [];

  // 각 색상별 카드 생성
  COLORS.forEach(color => {
    // 숫자 카드: 0은 1장, 1-9는 각 2장
    deck.push({
      id: nanoid(),
      color,
      value: 0,
      type: CARD_TYPES.NUMBER,
    });

    for (let i = 1; i <= 9; i++) {
      for (let j = 0; j < 2; j++) {
        deck.push({
          id: nanoid(),
          color,
          value: i,
          type: CARD_TYPES.NUMBER,
        });
      }
    }

    // 특수 카드: 각 색상당 2장씩
    Object.values(SPECIAL_CARDS).forEach(special => {
      for (let i = 0; i < 2; i++) {
        deck.push({
          id: nanoid(),
          color,
          value: special,
          type: CARD_TYPES.SPECIAL,
        });
      }
    });
  });

  // 와일드 카드: 각 4장씩
  Object.values(WILD_CARDS).forEach(wild => {
    for (let i = 0; i < 4; i++) {
      deck.push({
        id: nanoid(),
        color: 'wild',
        value: wild,
        type: CARD_TYPES.WILD,
      });
    }
  });

  return deck;
};

/**
 * Fisher-Yates 셔플 알고리즘
 * @param {Array} array - 셔플할 배열
 * @returns {Array} 셔플된 배열
 */
export const shuffleDeck = (array) => {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

/**
 * 카드 색상에 따른 Tailwind CSS 클래스 반환
 * @param {string} color - 카드 색상
 * @returns {string} Tailwind CSS 클래스
 */
export const getCardColorClass = (color) => {
  const colorMap = {
    red: 'bg-red-600 border-red-400',
    yellow: 'bg-yellow-500 border-yellow-300',
    green: 'bg-green-600 border-green-400',
    blue: 'bg-blue-600 border-blue-400',
    wild: 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 border-purple-400',
  };

  return colorMap[color] || 'bg-gray-600 border-gray-400';
};

/**
 * 카드 값 표시용 텍스트 반환
 * @param {string|number} value - 카드 값
 * @returns {string} 표시할 텍스트
 */
export const getCardDisplayValue = (value) => {
  const displayMap = {
    'skip': '⊘',
    'reverse': '⇄',
    'draw-two': '+2',
    'wild': '🎨',
    'wild-draw': '+4',
  };

  return displayMap[value] || value.toString();
};

/**
 * 카드를 손에서 부채꼴 모양으로 배치하기 위한 변환 계산
 * @param {number} index - 카드 인덱스
 * @param {number} total - 전체 카드 수
 * @param {boolean} isMobile - 모바일 여부
 * @returns {object} transform 스타일 객체
 */
export const calculateCardFanTransform = (index, total, isMobile = false) => {
  const centerIndex = (total - 1) / 2;
  const offset = index - centerIndex;
  
  // 모바일: 더 넓은 각도, PC: 좁은 각도
  const rotationAngle = isMobile ? offset * 5 : offset * 3;
  const translateY = isMobile ? Math.abs(offset) * 10 : Math.abs(offset) * 5;
  const translateX = offset * (isMobile ? 25 : 15);

  return {
    transform: `translateX(${translateX}px) translateY(-${translateY}px) rotate(${rotationAngle}deg)`,
    zIndex: index,
  };
};
