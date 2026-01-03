import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useGameStore from '../../store/useGameStore';
import useGameSync from '../../hooks/useGameSync';
import { updatePlayerReady, leaveRoom } from '../../api/roomApi';
import { startGame } from '../../api/gameApi';

const WaitingRoom = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { player, currentRoom, setRoomCode, resetGame } = useGameStore();
  const { isConnected, syncError } = useGameSync(roomCode);
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    setRoomCode(roomCode);
  }, [roomCode, setRoomCode]);

  useEffect(() => {
    if (syncError) {
      toast.error(syncError);
      navigate('/');
    }
  }, [syncError, navigate]);

  // 게임 시작 감지
  useEffect(() => {
    if (currentRoom?.metadata?.status === 'playing') {
      navigate(`/game/${roomCode}`);
    }
  }, [currentRoom, roomCode, navigate]);

  const players = currentRoom?.players ? Object.values(currentRoom.players) : [];
  const isHost = currentRoom?.metadata?.hostId === player.uid;
  const allReady = players.length >= 2 && players.every(p => p.ready || p.uid === currentRoom?.metadata?.hostId);

  const handleToggleReady = async () => {
    try {
      const newReady = !isReady;
      await updatePlayerReady(roomCode, player.uid, newReady);
      setIsReady(newReady);
      toast.success(newReady ? '준비 완료!' : '준비 취소');
    } catch (error) {
      toast.error('준비 상태 변경에 실패했습니다.');
    }
  };

  const handleStartGame = async () => {
    if (!allReady) {
      toast.error('모든 플레이어가 준비되지 않았습니다.');
      return;
    }

    setIsStarting(true);
    const loadingToast = toast.loading('게임을 시작하는 중...');

    try {
      await startGame(roomCode);
      toast.success('게임 시작!', { id: loadingToast });
    } catch (error) {
      console.error('Start game error:', error);
      toast.error(error.message || '게임 시작에 실패했습니다.', { id: loadingToast });
      setIsStarting(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(roomCode, player.uid);
      resetGame();
      navigate('/');
    } catch (error) {
      console.error('Leave room error:', error);
      resetGame();
      navigate('/');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('방 코드가 복사되었습니다!');
  };

  if (!currentRoom) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">방 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Room Code Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 mb-8 border-2 border-neon-blue/30"
        >
          <div className="text-center">
            <p className="text-gray-400 mb-2">친구를 초대하세요!</p>
            <div className="flex items-center justify-center space-x-4">
              <span className="text-4xl font-mono font-bold text-neon-blue tracking-wider">
                {roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue p-3 rounded-lg transition-colors"
              >
                📋
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? '연결됨' : '연결 끊김'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Players List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span>👥</span>
            <span className="ml-2">플레이어</span>
            <span className="ml-2 text-neon-purple">({players.length}/4)</span>
          </h2>

          <div className="space-y-3">
            {players.map((p) => (
              <motion.div
                key={p.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  p.online ? 'bg-gray-700' : 'bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    p.uid === currentRoom.metadata.hostId
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-br from-neon-blue to-neon-purple'
                  }`}>
                    <span className="text-lg">{p.uid === currentRoom.metadata.hostId ? '👑' : '👤'}</span>
                  </div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.uid === currentRoom.metadata.hostId && '방장'}
                      {p.uid === player.uid && ' (나)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!p.online && (
                    <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">
                      연결 끊김
                    </span>
                  )}
                  {(p.ready || p.uid === currentRoom.metadata.hostId) && (
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                      ✓ 준비 완료
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Empty slots */}
            {[...Array(4 - players.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center p-4 rounded-xl bg-gray-700/30 border-2 border-dashed border-gray-600"
              >
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                  <span className="text-gray-500">?</span>
                </div>
                <span className="text-gray-500">플레이어 대기 중...</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isHost ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartGame}
              disabled={!allReady || isStarting}
              className="flex-1 bg-gradient-to-r from-neon-green to-neon-blue text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-neon-green/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? '시작 중...' : '🎮 게임 시작'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleReady}
              className={`flex-1 font-bold py-4 px-8 rounded-xl shadow-lg transition-all ${
                isReady
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gradient-to-r from-neon-green to-neon-blue text-white hover:shadow-neon-green/50'
              }`}
            >
              {isReady ? '❌ 준비 취소' : '✓ 준비 완료'}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLeaveRoom}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all"
          >
            🚪 나가기
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
