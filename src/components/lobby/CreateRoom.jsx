import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createRoom } from '../../api/roomApi';
import useGameStore from '../../store/useGameStore';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { player, setRoomCode, setGameMode } = useGameStore();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!player.uid || !player.name) {
      toast.error('플레이어 정보를 찾을 수 없습니다.');
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading('방을 생성하는 중...');

    try {
      const roomCode = await createRoom(player.uid, player.name);
      setRoomCode(roomCode);
      setGameMode('multiplayer');
      
      toast.success(`방이 생성되었습니다! 코드: ${roomCode}`, {
        id: loadingToast,
      });

      // 대기실로 이동
      navigate(`/lobby/${roomCode}`);
    } catch (error) {
      console.error('Room creation error:', error);
      toast.error(error.message || '방 생성에 실패했습니다.', {
        id: loadingToast,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleCreateRoom}
      disabled={isCreating}
      className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-neon-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isCreating ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          생성 중...
        </span>
      ) : (
        '🎮 방 만들기'
      )}
    </motion.button>
  );
};

export default CreateRoom;
