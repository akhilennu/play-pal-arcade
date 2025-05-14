
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { SoundType, useSoundEffects } from '@/hooks/use-sound-effects';
import { NimPile } from './types';

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
    <div className="flex flex-col items-center mb-4">
      <div className="text-sm font-medium mb-1">Pile {pileIndex + 1}</div>
      <div 
        className={`flex flex-wrap justify-center p-2 rounded-md transition-colors ${
          isPileSelected ? 'bg-primary/20' : 'bg-muted/20'
        }`}
        style={{ minWidth: '100px', minHeight: '120px' }}
      >
        {Array.from({ length: pileSize }).map((_, stoneIndex) => (
          <motion.div
            key={stoneIndex}
            className={`${stoneSize} m-1 rounded-full ${
              isPileSelected && stoneIndex < selectedCount 
                ? 'bg-primary/80' 
                : 'bg-primary/30'
            } cursor-pointer transition-colors`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              if (isPileSelected && currentPlayer === 1 && onSelectCount) {
                onSelectCount(stoneIndex + 1);
              }
            }}
          />
        ))}
      </div>
      {pileSize > 0 && (
        <Button 
          size="sm" 
          variant="outline"
          className="mt-2"
          onClick={() => onSelectPile(pileIndex)}
          disabled={gameOver || (currentPlayer !== 1)}
        >
          Select
        </Button>
      )}
    </div>
  );
};

export default PileComponent;
