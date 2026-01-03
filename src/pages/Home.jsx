import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CreateRoom from '../components/lobby/CreateRoom';
import JoinRoom from '../components/lobby/JoinRoom';
import Modal from '../components/layout/Modal';
import useGameStore from '../store/useGameStore';

const Home = () => {
  const navigate = useNavigate();
  const { player, setPlayerName, initializePlayer } = useGameStore();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    initializePlayer();
  }, [initializePlayer]);

  const handleChangeName = () => {
    setNameInput(player.name);
    setIsNameModalOpen(true);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPlayerName(nameInput.trim());
      setIsNameModalOpen(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="text-8xl mb-4"
          >
            🃏
          </motion.div>
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
              UNO Connect
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            실시간 멀티플레이 원카드 게임
          </p>
        </motion.div>

        {/* Player Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-neon-blue/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">플레이어 이름</p>
                <p className="text-white font-bold text-lg">{player.name}</p>
              </div>
            </div>
            <button
              onClick={handleChangeName}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              변경
            </button>
          </div>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-gray-700"
        >
          <div className="space-y-6">
            {/* Create Room */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <span className="text-neon-blue mr-2">●</span>
                새로운 게임 시작
              </h2>
              <CreateRoom />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-500">또는</span>
              </div>
            </div>

            {/* Join Room */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <span className="text-neon-purple mr-2">●</span>
                친구 방에 참여
              </h2>
              <JoinRoom />
            </div>
          </div>
        </motion.div>

        {/* Coming Soon - AI Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
        >
          <div className="text-center">
            <h2 className="text-xl font-bold mb-3 flex items-center justify-center">
              <span className="text-neon-green mr-2">●</span>
              AI 대전 모드
            </h2>
            <p className="text-gray-400 mb-4">혼자서 AI와 연습하세요!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/ai-game')}
              className="w-full bg-gradient-to-r from-neon-green to-neon-yellow text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-neon-green/50 transition-all"
            >
              🤖 AI와 대결
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>💡 6자리 초대 코드로 친구와 함께 플레이하세요</p>
        </motion.div>
      </div>

      {/* Name Change Modal */}
      <Modal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        title="이름 변경"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">새로운 이름</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
              placeholder="이름을 입력하세요"
              maxLength={20}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border-2 border-gray-600 focus:border-neon-blue focus:outline-none transition-colors"
              autoFocus
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveName}
            disabled={!nameInput.trim()}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            저장
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
