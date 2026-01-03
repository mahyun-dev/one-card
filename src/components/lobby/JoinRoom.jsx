import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { joinRoom, validateRoomCode } from '../../api/roomApi';
import useGameStore from '../../store/useGameStore';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { player, setRoomCode, setGameMode } = useGameStore();
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error('6자리 코드를 입력해주세요.');
      return;
    }

    if (!player.uid || !player.name) {
      toast.error('플레이어 정보를 찾을 수 없습니다.');
      return;
    }

    setIsJoining(true);
    const loadingToast = toast.loading('방에 참여하는 중...');

    try {
      // 방 코드 검증
      const isValid = await validateRoomCode(code);
      if (!isValid) {
        toast.error('존재하지 않는 방입니다.', {
          id: loadingToast,
        });
        return;
      }

      // 방 참여
      await joinRoom(code, player.uid, player.name);
      setRoomCode(code);
      setGameMode('multiplayer');

      toast.success('방에 참여했습니다!', {
        id: loadingToast,
      });

      // 대기실로 이동
      navigate(`/lobby/${code}`);
    } catch (error) {
      console.error('Join room error:', error);
      toast.error(error.message || '방 참여에 실패했습니다.', {
        id: loadingToast,
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <form onSubmit={handleJoinRoom} className="w-full space-y-4">
      <div className="relative">
        <input
          type="text"
          value={code}
          onChange={handleCodeChange}
          placeholder="6자리 방 코드 입력"
          className="w-full bg-gray-800 text-white text-center font-mono text-2xl tracking-widest py-4 px-6 rounded-xl border-2 border-gray-700 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition-all uppercase"
          maxLength={6}
          disabled={isJoining}
        />
        {code.length > 0 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {code.length}/6
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={code.length !== 6 || isJoining}
        className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-neon-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isJoining ? (
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
            참여 중...
          </span>
        ) : (
          '🚀 참여하기'
        )}
      </motion.button>
    </form>
  );
};

export default JoinRoom;
