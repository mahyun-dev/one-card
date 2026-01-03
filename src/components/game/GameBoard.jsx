import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGameStore from '../../store/useGameStore';
import useGameSync from '../../hooks/useGameSync';
import Card from './Card';
import PlayerHand from './PlayerHand';
import TurnIndicator from './TurnIndicator';
import Modal from '../layout/Modal';
import { playCard, drawCards, nextTurn, takeAttack } from '../../api/gameApi';
import { COLORS } from '../../utils/cardDeck';

const GameBoard = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { player, currentRoom, resetGame } = useGameStore();
  const { isConnected } = useGameSync(roomCode);

  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentRoom) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">게임을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const gameState = currentRoom.gameState;
  const players = Object.values(currentRoom.players);
  const myPlayer = players.find(p => p.uid === player.uid);
  const isMyTurn = gameState.currentTurn === player.uid;
  const lastCard = gameState.discardPile[gameState.discardPile.length - 1];
  const currentPlayer = players.find(p => p.uid === gameState.currentTurn);

  // 승리 확인
  if (currentRoom.metadata.status === 'result') {
    const winner = players.find(p => p.uid === currentRoom.metadata.winnerId);
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-purple mb-4">
            {winner?.uid === player.uid ? '승리!' : `${winner?.name} 승리!`}
          </h1>
          <button
            onClick={() => {
              resetGame();
              navigate('/');
            }}
            className="bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-3 px-8 rounded-xl mt-4"
          >
            메인으로
          </button>
        </motion.div>
      </div>
    );
  }

  const handleCardClick = async (card) => {
    if (!isMyTurn || isProcessing) return;

    // 와일드 카드면 색상 선택 모달 열기
    if (card.value === 'wild' || card.value === 'wild-draw') {
      setSelectedCard(card);
      setIsColorModalOpen(true);
      return;
    }

    // 일반 카드 플레이
    await handlePlayCard(card);
  };

  const handlePlayCard = async (card, selectedColor = null) => {
    setIsProcessing(true);
    try {
      const remainingCards = await playCard(roomCode, player.uid, card, selectedColor);
      
      if (remainingCards === 1) {
        toast('UNO! 🎉', {
          icon: '🃏',
          style: {
            background: '#b800e6',
            color: '#fff',
            border: '2px solid #ff00ff',
          },
        });
      }

      // 턴 넘기기
      await nextTurn(roomCode);
      
      toast.success('카드를 냈습니다!');
    } catch (error) {
      console.error('Play card error:', error);
      toast.error(error.message || '카드를 낼 수 없습니다.');
    } finally {
      setIsProcessing(false);
      setIsColorModalOpen(false);
      setSelectedCard(null);
    }
  };

  const handleDrawCard = async () => {
    if (!isMyTurn || isProcessing) return;

    setIsProcessing(true);
    try {
      // 공격 카드가 쌓여있으면 공격 받기
      if (gameState.attackStack > 0) {
        await takeAttack(roomCode, player.uid);
        toast.error(`카드 ${gameState.attackStack}장을 받았습니다!`);
      } else {
        // 일반 드로우
        await drawCards(roomCode, player.uid, 1);
        await nextTurn(roomCode);
        toast('카드 1장을 뽑았습니다');
      }
    } catch (error) {
      console.error('Draw card error:', error);
      toast.error('카드를 뽑는데 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColorSelect = async (color) => {
    if (!selectedCard) return;
    await handlePlayCard(selectedCard, color);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl"></div>
      </div>

      {/* Connection Indicator */}
      {!isConnected && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm z-50">
          ⚠️ 연결이 끊겼습니다
        </div>
      )}

      {/* Turn Indicator */}
      <TurnIndicator
        currentPlayer={currentPlayer}
        direction={gameState.direction}
        players={players}
        attackStack={gameState.attackStack}
      />

      {/* Game Board */}
      <div className="container mx-auto h-[calc(100vh-7rem)] flex flex-col justify-between px-4">
        {/* Opponents Area */}
        <div className="flex justify-center items-start space-x-4 py-4">
          {players.filter(p => p.uid !== player.uid).map((opponent) => (
            <motion.div
              key={opponent.uid}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border-2 ${
                opponent.uid === gameState.currentTurn ? 'border-neon-blue animate-pulse' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <span className="text-sm font-medium text-white">{opponent.name}</span>
              </div>
              <div className="flex justify-center">
                {[...Array(Math.min(opponent.cards?.length || 0, 7))].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-12 bg-gray-700 rounded border-2 border-gray-600 -ml-4 first:ml-0 transform hover:translate-y-1 transition-transform"
                  />
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                {opponent.cards?.length || 0}장
              </p>
            </motion.div>
          ))}
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
            <p className="text-center text-xs text-gray-400 mt-2">
              덱: {gameState.deck?.length || 0}장
            </p>
          </motion.div>

          {/* Discard Pile */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={lastCard?.id}
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
            cards={myPlayer?.cards || []}
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
                color === 'red' ? 'bg-red-600 border-red-400' :
                color === 'yellow' ? 'bg-yellow-500 border-yellow-300' :
                color === 'green' ? 'bg-green-600 border-green-400' :
                'bg-blue-600 border-blue-400'
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

export default GameBoard;
