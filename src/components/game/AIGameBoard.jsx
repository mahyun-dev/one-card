import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGameStore from '../../store/useGameStore';
import useAI from '../../hooks/useAI';
import Card from './Card';
import PlayerHand from './PlayerHand';
import Modal from '../layout/Modal';
import { createDeck, shuffleDeck, COLORS } from '../../utils/cardDeck';
import { canPlayCard, checkWinCondition } from '../../utils/gameRules';

const AIGameBoard = () => {
  const navigate = useNavigate();
  const { player } = useGameStore();
  const { executeAITurn } = useAI();

  const [gameState, setGameState] = useState(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 게임 초기화
  useEffect(() => {
    initGame();
  }, []);

  // AI 턴 자동 실행
  useEffect(() => {
    if (!gameState || gameState.status === 'result' || isProcessing) return;

    const currentPlayer = gameState.players[gameState.currentTurn];
    if (currentPlayer?.isAI) {
      handleAITurn();
    }
  }, [gameState?.currentTurn, gameState?.status, isProcessing]);

  const initGame = () => {
    let deck = createDeck();
    deck = shuffleDeck(deck);

    // 플레이어와 AI에게 7장씩 카드 분배
    const playerCards = deck.slice(0, 7);
    const aiCards = deck.slice(7, 14);

    // 첫 카드를 버린 카드 더미에 배치 (특수 카드가 아닌 것으로)
    let firstCardIndex = 14;
    let firstCard = deck[firstCardIndex];
    while (firstCard.type === 'wild') {
      firstCardIndex++;
      firstCard = deck[firstCardIndex];
    }

    const remainingDeck = deck.slice(firstCardIndex + 1);

    setGameState({
      players: [
        {
          uid: player.uid,
          name: player.name,
          cards: playerCards,
          isAI: false,
        },
        {
          uid: 'ai-1',
          name: 'AI 플레이어',
          cards: aiCards,
          isAI: true,
        },
      ],
      currentTurn: 0, // 플레이어부터 시작
      deck: remainingDeck,
      discardPile: [firstCard],
      direction: 1,
      attackStack: 0,
      status: 'playing',
    });
  };

  const handleAITurn = async () => {
    if (!gameState) return;

    setIsProcessing(true);
    const aiPlayer = gameState.players[1];
    const lastCard = gameState.discardPile[gameState.discardPile.length - 1];

    await executeAITurn(
      aiPlayer.cards,
      lastCard,
      gameState.attackStack,
      async (card, selectedColor) => {
        await handlePlayCardByAI(card, selectedColor);
      },
      async () => {
        await handleDrawCardByAI();
      },
      1000
    );

    setIsProcessing(false);
  };

  const handlePlayCardByAI = async (card, selectedColor) => {
    const newState = { ...gameState };
    const aiPlayer = newState.players[1];

    // AI 손에서 카드 제거
    const cardIndex = aiPlayer.cards.findIndex((c) => c.id === card.id);
    aiPlayer.cards.splice(cardIndex, 1);

    // 버린 카드 더미에 추가
    const cardToDiscard = { ...card };
    if (selectedColor && (card.value === 'wild' || card.value === 'wild-draw')) {
      cardToDiscard.selectedColor = selectedColor;
    }
    newState.discardPile.push(cardToDiscard);

    // 특수 카드 효과 처리
    handleSpecialCard(newState, card);

    // 승리 확인
    if (aiPlayer.cards.length === 0) {
      newState.status = 'result';
      newState.winner = 1;
      toast.error('AI가 승리했습니다!');
    } else {
      // 턴 넘기기
      nextTurn(newState);
    }

    setGameState(newState);
  };

  const handleDrawCardByAI = async () => {
    const newState = { ...gameState };
    const aiPlayer = newState.players[1];

    if (newState.attackStack > 0) {
      // 공격 받기
      const drawnCards = drawCardsFromDeck(newState, newState.attackStack);
      aiPlayer.cards.push(...drawnCards);
      newState.attackStack = 0;
      toast(`AI가 카드 ${drawnCards.length}장을 받았습니다`);
    } else {
      // 일반 드로우
      const drawnCards = drawCardsFromDeck(newState, 1);
      aiPlayer.cards.push(...drawnCards);
    }

    nextTurn(newState);
    setGameState(newState);
  };

  const handleCardClick = async (card) => {
    if (gameState.currentTurn !== 0 || isProcessing) return;

    const lastCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!canPlayCard(card, lastCard, gameState.attackStack)) {
      toast.error('이 카드를 낼 수 없습니다.');
      return;
    }

    // 와일드 카드면 색상 선택 모달 열기
    if (card.value === 'wild' || card.value === 'wild-draw') {
      setSelectedCard(card);
      setIsColorModalOpen(true);
      return;
    }

    await handlePlayCard(card);
  };

  const handlePlayCard = async (card, selectedColor = null) => {
    setIsProcessing(true);

    const newState = { ...gameState };
    const myPlayer = newState.players[0];

    // 손에서 카드 제거
    const cardIndex = myPlayer.cards.findIndex((c) => c.id === card.id);
    myPlayer.cards.splice(cardIndex, 1);

    // 버린 카드 더미에 추가
    const cardToDiscard = { ...card };
    if (selectedColor && (card.value === 'wild' || card.value === 'wild-draw')) {
      cardToDiscard.selectedColor = selectedColor;
    }
    newState.discardPile.push(cardToDiscard);

    // UNO 확인
    if (myPlayer.cards.length === 1) {
      toast('UNO! 🎉', {
        icon: '🃏',
        style: {
          background: '#b800e6',
          color: '#fff',
          border: '2px solid #ff00ff',
        },
      });
    }

    // 특수 카드 효과 처리
    handleSpecialCard(newState, card);

    // 승리 확인
    if (myPlayer.cards.length === 0) {
      newState.status = 'result';
      newState.winner = 0;
      toast.success('승리했습니다! 🎉');
    } else {
      // 턴 넘기기
      nextTurn(newState);
    }

    setGameState(newState);
    setIsColorModalOpen(false);
    setSelectedCard(null);
    setIsProcessing(false);
  };

  const handleDrawCard = async () => {
    if (gameState.currentTurn !== 0 || isProcessing) return;

    setIsProcessing(true);
    const newState = { ...gameState };
    const myPlayer = newState.players[0];

    if (newState.attackStack > 0) {
      // 공격 받기
      const drawnCards = drawCardsFromDeck(newState, newState.attackStack);
      myPlayer.cards.push(...drawnCards);
      newState.attackStack = 0;
      toast.error(`카드 ${drawnCards.length}장을 받았습니다!`);
    } else {
      // 일반 드로우
      const drawnCards = drawCardsFromDeck(newState, 1);
      myPlayer.cards.push(...drawnCards);
      toast('카드 1장을 뽑았습니다');
    }

    nextTurn(newState);
    setGameState(newState);
    setIsProcessing(false);
  };

  const drawCardsFromDeck = (state, count) => {
    const drawn = [];

    for (let i = 0; i < count; i++) {
      if (state.deck.length === 0) {
        // 덱이 비었으면 버린 카드 더미를 섞어서 덱으로 사용
        const lastCard = state.discardPile[state.discardPile.length - 1];
        const cardsToShuffle = state.discardPile.slice(0, -1);
        state.deck = shuffleDeck(cardsToShuffle);
        state.discardPile = [lastCard];
      }

      if (state.deck.length > 0) {
        drawn.push(state.deck.shift());
      }
    }

    return drawn;
  };

  const handleSpecialCard = (state, card) => {
    if (card.value === 'skip') {
      state.skipNext = true;
    } else if (card.value === 'reverse') {
      state.direction *= -1;
    } else if (card.value === 'draw-two') {
      state.attackStack += 2;
    } else if (card.value === 'wild-draw') {
      state.attackStack += 4;
    } else {
      state.attackStack = 0;
    }
  };

  const nextTurn = (state) => {
    let nextIndex = state.currentTurn + state.direction;

    if (state.skipNext) {
      nextIndex += state.direction;
      state.skipNext = false;
    }

    // 2명이므로 간단히 0과 1 사이로 순환
    nextIndex = (nextIndex + 2) % 2;
    state.currentTurn = nextIndex;
  };

  const handleColorSelect = async (color) => {
    if (!selectedCard) return;
    await handlePlayCard(selectedCard, color);
  };

  const handleQuit = () => {
    navigate('/');
  };

  if (!gameState) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">게임을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  // 승리 화면
  if (gameState.status === 'result') {
    const winner = gameState.players[gameState.winner];
    const isPlayerWin = gameState.winner === 0;

    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">{isPlayerWin ? '🎉' : '😢'}</div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-purple mb-4">
            {isPlayerWin ? '승리!' : 'AI 승리!'}
          </h1>
          <div className="flex gap-4 justify-center">
            <button
              onClick={initGame}
              className="bg-gradient-to-r from-neon-green to-neon-blue text-white font-bold py-3 px-8 rounded-xl"
            >
              다시 하기
            </button>
            <button
              onClick={handleQuit}
              className="bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-3 px-8 rounded-xl"
            >
              메인으로
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const myPlayer = gameState.players[0];
  const aiPlayer = gameState.players[1];
  const lastCard = gameState.discardPile[gameState.discardPile.length - 1];
  const isMyTurn = gameState.currentTurn === 0;

  return (
    <div className="min-h-[calc(100vh-5rem)] py-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl"></div>
      </div>

      {/* Quit Button */}
      <button
        onClick={handleQuit}
        className="fixed top-24 right-4 z-40 bg-gray-800/90 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors"
      >
        나가기
      </button>

      {/* Turn Indicator */}
      <div className="fixed top-24 left-4 z-40 bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border-2 border-neon-purple/50">
        <p className="text-xs text-gray-400 mb-1">현재 차례</p>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center animate-pulse">
            <span className="text-sm">{isMyTurn ? '👤' : '🤖'}</span>
          </div>
          <span className="font-bold text-white">{isMyTurn ? player.name : 'AI'}</span>
        </div>
        {gameState.attackStack > 0 && (
          <div className="mt-3 bg-red-500/20 border border-red-500 rounded-lg p-2 text-center">
            <p className="text-xs text-red-400 mb-1">공격 카드 누적</p>
            <p className="text-2xl font-bold text-red-500">+{gameState.attackStack}</p>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="container mx-auto h-[calc(100vh-7rem)] flex flex-col justify-between px-4">
        {/* AI Area */}
        <div className="flex justify-center items-start py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border-2 ${
              !isMyTurn ? 'border-neon-blue animate-pulse' : 'border-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <span className="text-sm font-medium text-white">AI 플레이어</span>
            </div>
            <div className="flex justify-center">
              {[...Array(Math.min(aiPlayer.cards.length, 7))].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-12 bg-gray-700 rounded border-2 border-gray-600 -ml-4 first:ml-0"
                />
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">{aiPlayer.cards.length}장</p>
          </motion.div>
        </div>

        {/* Center Area - Discard Pile & Deck */}
        <div className="flex justify-center items-center space-x-8">
          {/* Deck */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDrawCard}
            className={`relative ${isMyTurn && !isProcessing ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          >
            <div className="w-24 h-36 bg-gray-700 rounded-lg border-4 border-gray-600 flex items-center justify-center shadow-2xl">
              <span className="text-4xl">🃏</span>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">덱: {gameState.deck.length}장</p>
          </motion.div>

          {/* Discard Pile */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={lastCard.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card card={lastCard} size="lg" />
              </motion.div>
            </AnimatePresence>
            <p className="text-center text-xs text-gray-400 mt-2">버린 카드 더미</p>
          </div>
        </div>

        {/* My Hand */}
        <div className="pb-4">
          <PlayerHand
            cards={myPlayer.cards}
            lastCard={lastCard}
            attackStack={gameState.attackStack}
            onCardClick={handleCardClick}
            isMyTurn={isMyTurn && !isProcessing}
          />
        </div>
      </div>

      {/* Color Selection Modal */}
      <Modal
        isOpen={isColorModalOpen}
        onClose={() => {
          setIsColorModalOpen(false);
          setSelectedCard(null);
        }}
        title="색상을 선택하세요"
        size="sm"
      >
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorSelect(color)}
              className={`h-24 rounded-xl border-4 font-bold text-white text-lg shadow-lg ${
                color === 'red'
                  ? 'bg-red-600 border-red-400'
                  : color === 'yellow'
                  ? 'bg-yellow-500 border-yellow-300'
                  : color === 'green'
                  ? 'bg-green-600 border-green-400'
                  : 'bg-blue-600 border-blue-400'
              }`}
            >
              {color.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default AIGameBoard;
