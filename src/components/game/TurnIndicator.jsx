import { motion } from 'framer-motion';

const TurnIndicator = ({ currentPlayer, direction, players, attackStack }) => {
  return (
    <div className="fixed top-20 right-4 z-40">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border-2 border-neon-purple/50 shadow-2xl min-w-[200px]"
      >
        {/* Current Turn */}
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">현재 차례</p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center animate-pulse">
              <span className="text-sm">👤</span>
            </div>
            <span className="font-bold text-white">{currentPlayer?.name}</span>
          </div>
        </div>

        {/* Direction */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">방향</span>
          <motion.div
            animate={{ rotate: direction === 1 ? 0 : 180 }}
            transition={{ duration: 0.5 }}
            className="text-2xl"
          >
            ↻
          </motion.div>
        </div>

        {/* Attack Stack */}
        {attackStack > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-500/20 border border-red-500 rounded-lg p-2 text-center"
          >
            <p className="text-xs text-red-400 mb-1">공격 카드 누적</p>
            <p className="text-2xl font-bold text-red-500">+{attackStack}</p>
          </motion.div>
        )}

        {/* Players Order */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">플레이어 순서</p>
          <div className="space-y-1">
            {players.map((player) => (
              <div
                key={player.uid}
                className={`flex items-center justify-between text-sm ${
                  player.uid === currentPlayer?.uid ? 'text-neon-blue font-bold' : 'text-gray-400'
                }`}
              >
                <span className="truncate">{player.name}</span>
                <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded">
                  {player.cards?.length || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TurnIndicator;
