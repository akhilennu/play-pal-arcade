
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
// import { SoundType, useSoundEffects } from '@/hooks/use-sound-effects'; // Not used here
// import { NimPile } from './types'; // Not used here

interface PileProps {
  pileSize: number;
  pileIndex: number;
  selectedPile: number | null;
  selectedCount: number;
  currentPlayer: 1 | 2;
  gameOver: boolean;
  onSelectPile: (pileIndex: number) => void;
  onSelectCount?: (count: number) => void;
}

const PileComponent: React.FC<PileProps> = ({
  pileSize,
  pileIndex,
  selectedPile,
  selectedCount,
  currentPlayer,
  gameOver,
  onSelectPile,
  onSelectCount
}) => {
  const isMobile = useIsMobile();
  
  const isPileSelected = selectedPile === pileIndex;
  const stoneSize = isMobile ? "w-8 h-8" : "w-10 h-10";
  
  return (
    <div className="flex flex-col items-center mb-4 p-2"> {/* Added padding to outer div for spacing between piles */}
      <div className="text-sm font-medium mb-1">Pile {pileIndex + 1}</div>
      <div 
        className={`flex flex-wrap justify-center p-3 rounded-lg transition-all duration-200 ease-in-out border-2 shadow-sm hover:shadow-md
          ${isPileSelected 
            ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2 dark:ring-offset-background' 
            : 'border-muted bg-muted/20 hover:border-muted-foreground/50'
          }`}
        style={{ minWidth: isMobile ? '90px' : '120px', minHeight: isMobile ? '100px' : '120px' }} // Adjusted minWidth for consistency
      >
        {Array.from({ length: pileSize }).map((_, stoneIndex) => (
          <motion.div
            key={stoneIndex}
            className={`${stoneSize} m-1 rounded-full 
              ${isPileSelected && stoneIndex < selectedCount 
                ? 'bg-primary opacity-100' 
                : 'bg-primary/40 opacity-70 hover:opacity-100'
              } 
              ${currentPlayer === 1 && !gameOver && isPileSelected ? 'cursor-pointer' : 'cursor-default'}
              transition-all duration-150`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
              if (isPileSelected && currentPlayer === 1 && !gameOver && onSelectCount) {
                onSelectCount(stoneIndex + 1);
              }
            }}
            whileHover={isPileSelected && currentPlayer === 1 && !gameOver ? { scale: 1.1, backgroundColor: 'hsl(var(--primary))' } : {}}
            whileTap={isPileSelected && currentPlayer === 1 && !gameOver ? { scale: 0.95 } : {}}
          />
        ))}
        {pileSize === 0 && (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">
            Empty
          </div>
        )}
      </div>
      {pileSize > 0 && (
        <Button 
          size="sm" 
          variant={isPileSelected ? "default" : "outline"}
          className="mt-3 w-full max-w-[100px]" // Ensure button width is consistent
          onClick={() => onSelectPile(pileIndex)}
          disabled={gameOver || (currentPlayer !== 1)}
        >
          {isPileSelected ? "Selected" : "Select"}
        </Button>
      )}
    </div>
  );
};

export default PileComponent;
