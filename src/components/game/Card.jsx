import { motion } from 'framer-motion';
import { getCardColorClass, getCardDisplayValue } from '../../utils/cardDeck';

const Card = ({ card, onClick, style, isPlayable = false, isSelected = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-20 h-32',
    lg: 'w-24 h-36',
  };

  const colorClass = getCardColorClass(card.selectedColor || card.color);
  const displayValue = getCardDisplayValue(card.value);

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.1, y: -10 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      style={style}
      className={`
        ${sizeClasses[size]}
        ${colorClass}
        rounded-lg
        shadow-xl
        flex
        items-center
        justify-center
        relative
        border-4
        transition-all
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${isPlayable ? 'ring-4 ring-neon-green animate-neon-pulse' : ''}
        ${isSelected ? 'ring-4 ring-neon-yellow' : ''}
      `}
    >
      {/* Card Value */}
      <div className="text-white font-bold text-3xl drop-shadow-lg">
        {displayValue}
      </div>

      {/* Top-left corner number */}
      <div className="absolute top-1 left-1 text-white text-xs font-bold">
        {displayValue}
      </div>

      {/* Bottom-right corner number (rotated) */}
      <div className="absolute bottom-1 right-1 text-white text-xs font-bold transform rotate-180">
        {displayValue}
      </div>
    </motion.div>
  );
};

export default Card;
