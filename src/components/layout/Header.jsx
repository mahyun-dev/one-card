import { motion } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const Header = () => {
  const { player, roomCode } = useGameStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-neon-blue/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <span className="text-3xl">🃏</span>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
            UNO Connect
          </h1>
        </motion.div>

        {/* Room Code */}
        {roomCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="bg-gray-800 px-4 py-2 rounded-lg border border-neon-purple/50">
              <span className="text-gray-400 text-sm">방 코드:</span>
              <span className="ml-2 text-neon-purple font-mono font-bold text-lg">{roomCode}</span>
            </div>
          </motion.div>
        )}

        {/* Player Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
            <span className="text-sm font-bold">👤</span>
          </div>
          <span className="text-white font-medium">{player.name}</span>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
