import { motion } from 'framer-motion';
import Card from './Card';
import { calculateCardFanTransform } from '../../utils/cardDeck';
import { canPlayCard } from '../../utils/gameRules';

const PlayerHand = ({ cards, lastCard, attackStack, onCardClick, isMyTurn }) => {
  // 모바일 감지
  const isMobile = window.innerWidth < 768;

  return (
    <div className="relative h-40 md:h-48 flex items-end justify-center">
      <div className="relative flex items-center justify-center" style={{ width: '100%', maxWidth: '800px' }}>
        {cards.map((card, index) => {
          const isPlayable = isMyTurn && canPlayCard(card, lastCard, attackStack);
          const transform = calculateCardFanTransform(index, cards.length, isMobile);

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 100 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                ...transform,
              }}
              transition={{ 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              className="absolute"
              style={{ 
                left: '50%',
                marginLeft: '-40px', // Half of card width
              }}
            >
              <Card
                card={card}
                onClick={isPlayable ? () => onCardClick(card) : null}
                isPlayable={isPlayable}
                size={isMobile ? 'sm' : 'md'}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Card count indicator */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800/90 px-4 py-2 rounded-full border border-neon-blue/50">
        <span className="text-sm text-gray-300">
          내 카드: <span className="text-neon-blue font-bold">{cards.length}</span>장
        </span>
      </div>
    </div>
  );
};

export default PlayerHand;
