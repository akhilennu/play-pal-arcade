
import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface PileProps {
  pileSize: number;
  pileIndex: number;
  selectedPile: number | null;
  selectedCount: number;
  currentPlayer: 1 | 2;
  gameOver: boolean;
  onPileInteraction: (pileIndex: number, count: number) => void;
  isMultiplayer?: boolean;
  aiThinking?: boolean;
}

const PileComponent: React.FC<PileProps> = ({
  pileSize,
  pileIndex,
  selectedPile,
  selectedCount,
  currentPlayer,
  gameOver,
  onPileInteraction,
  isMultiplayer = false,
  aiThinking = false,
}) => {
  const isMobile = useIsMobile();
  
  const isPileCurrentlySelected = selectedPile === pileIndex;
  const stoneSize = isMobile ? "w-7 h-7 sm:w-8 sm:h-8" : "w-10 h-10"; // Slightly smaller on very small screens
  
  const handleStoneClick = (stoneIndexClicked: number) => {
    // Fix for multiplayer: Allow either player to select stones on their turn
    if ((isMultiplayer || currentPlayer === 1) && !gameOver && pileSize > 0 && !aiThinking) {
      onPileInteraction(pileIndex, stoneIndexClicked + 1);
    }
  };

  // Determine if interaction is allowed
  const isInteractionDisabled = gameOver || pileSize === 0 || aiThinking ||
    (!isMultiplayer && currentPlayer !== 1);

  return (
    <div className="flex flex-col items-center mb-2 sm:mb-3 p-1 sm:p-2">
      <div className="text-xs sm:text-sm font-medium mb-1">Pile {pileIndex + 1}</div>
      <div 
        className={`flex flex-wrap justify-center items-start p-2 sm:p-3 rounded-lg transition-all duration-200 ease-in-out border-2 shadow-sm hover:shadow-md
          ${isPileCurrentlySelected 
            ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 dark:ring-offset-background' 
            : 'border-muted bg-muted/20 hover:border-muted-foreground/50'
          }
          ${isInteractionDisabled ? 'cursor-not-allowed' : 'cursor-pointer' } 
        `}
        style={{ 
          minWidth: isMobile ? '80px' : '110px',
          minHeight: isMobile ? '80px' : '100px'
        }}
      >
        {pileSize > 0 ? (
          Array.from({ length: pileSize }).map((_, stoneIndex) => (
            <motion.div
              key={stoneIndex}
              className={`${stoneSize} m-0.5 sm:m-1 rounded-full 
                ${isPileCurrentlySelected && stoneIndex < selectedCount 
                  ? 'bg-primary opacity-100 ring-2 ring-primary/50'
                  : 'bg-primary/40 opacity-70 hover:opacity-90'
                } 
                ${!isInteractionDisabled ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-all duration-150`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => handleStoneClick(stoneIndex)}
              whileHover={!isInteractionDisabled ? { scale: 1.15, backgroundColor: 'hsl(var(--primary))' } : {}}
              whileTap={!isInteractionDisabled ? { scale: 0.95 } : {}}
              aria-label={`Select ${stoneIndex + 1} stone${stoneIndex + 1 > 1 ? 's' : ''} from Pile ${pileIndex + 1}`}
              role="button"
              tabIndex={!isInteractionDisabled ? 0 : -1}
            />
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs p-2">
            Empty
          </div>
        )}
      </div>
    </div>
  );
};

export default PileComponent;
