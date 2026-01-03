import { useCallback } from 'react';
import { selectAICard, selectAIColor } from '../utils/gameRules';

/**
 * AI 로직을 처리하는 훅
 * @returns {object} AI 관련 함수들
 */
const useAI = () => {
  /**
   * AI의 턴을 실행
   * @param {Array} aiHand - AI의 손패
   * @param {object} lastCard - 버린 카드 더미의 마지막 카드
   * @param {number} attackStack - 누적된 공격 카드 수
   * @param {Function} onPlayCard - 카드를 낼 때 호출할 콜백
   * @param {Function} onDrawCard - 카드를 뽑을 때 호출할 콜백
   * @param {number} thinkingTime - AI 생각 시간 (ms)
   */
  const executeAITurn = useCallback(
    async (aiHand, lastCard, attackStack, onPlayCard, onDrawCard, thinkingTime = 1000) => {
      // AI가 생각하는 시간 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, thinkingTime));

      // AI가 낼 카드 선택
      const selectedCard = selectAICard(aiHand, lastCard, attackStack);

      if (selectedCard) {
        // 와일드 카드인 경우 색상 선택
        let selectedColor = null;
        if (selectedCard.value === 'wild' || selectedCard.value === 'wild-draw') {
          selectedColor = selectAIColor(aiHand);
        }

        // 카드 플레이
        await onPlayCard(selectedCard, selectedColor);
      } else {
        // 낼 수 있는 카드가 없으면 카드 뽑기
        await onDrawCard();

        // 카드를 뽑은 후 다시 확인 (선택적)
        // 일반적인 UNO 규칙에서는 카드를 뽑으면 턴이 넘어감
      }
    },
    []
  );

  /**
   * AI의 난이도에 따른 전략 선택
   * @param {string} difficulty - 'easy' | 'medium' | 'hard'
   * @param {Array} aiHand - AI의 손패
   * @param {object} lastCard - 버린 카드 더미의 마지막 카드
   * @param {number} attackStack - 누적된 공격 카드 수
   * @returns {object|null} 선택된 카드
   */
  const selectCardByDifficulty = useCallback((difficulty, aiHand, lastCard, attackStack) => {
    switch (difficulty) {
      case 'easy':
        // 쉬움: 랜덤하게 낼 수 있는 카드 선택
        return selectAICardEasy(aiHand, lastCard, attackStack);
      
      case 'medium':
        // 보통: 기본 전략
        return selectAICard(aiHand, lastCard, attackStack);
      
      case 'hard':
        // 어려움: 고급 전략 (추후 확장 가능)
        return selectAICardHard(aiHand, lastCard, attackStack);
      
      default:
        return selectAICard(aiHand, lastCard, attackStack);
    }
  }, []);

  /**
   * 멀티 AI 플레이어 관리
   * @param {Array} aiPlayers - AI 플레이어 목록
   * @param {object} gameState - 현재 게임 상태
   * @param {Function} onAIAction - AI 액션 콜백
   */
  const manageMultipleAIs = useCallback(async (aiPlayers, gameState, onAIAction) => {
    const currentPlayer = aiPlayers.find(ai => ai.uid === gameState.currentTurn);
    
    if (currentPlayer && currentPlayer.isAI) {
      const lastCard = gameState.discardPile[gameState.discardPile.length - 1];
      
      await executeAITurn(
        currentPlayer.cards,
        lastCard,
        gameState.attackStack,
        (card, color) => onAIAction('play', currentPlayer.uid, card, color),
        () => onAIAction('draw', currentPlayer.uid),
        Math.random() * 1000 + 500 // 0.5-1.5초 랜덤
      );
    }
  }, [executeAITurn]);

  return {
    executeAITurn,
    selectCardByDifficulty,
    manageMultipleAIs,
  };
};

/**
 * 쉬운 난이도 AI: 랜덤 선택
 */
const selectAICardEasy = (hand, lastCard, attackStack) => {
  const playableCards = hand.filter(card => {
    // 간단한 검증만 수행
    if (card.type === 'wild') return true;
    
    const lastColor = lastCard.selectedColor || lastCard.color;
    return card.color === lastColor || card.value === lastCard.value;
  });

  if (playableCards.length === 0) return null;

  // 랜덤 선택
  return playableCards[Math.floor(Math.random() * playableCards.length)];
};

/**
 * 어려운 난이도 AI: 고급 전략
 */
const selectAICardHard = (hand, lastCard, attackStack) => {
  // 기본 로직 사용 (추후 확장 가능)
  // - 상대방의 카드 수 고려
  // - 색상 분포 분석
  // - 체인 공격 전략
  return selectAICard(hand, lastCard, attackStack);
};

export default useAI;
