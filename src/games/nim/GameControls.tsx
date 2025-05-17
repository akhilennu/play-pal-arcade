
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface GameControlsProps {
  selectedPile: number | null;
  selectedCount: number;
  currentPlayer: 1 | 2;
  gameOver: boolean;
  piles: number[];
  onRemoveStones: () => void;
  isMultiplayer?: boolean;
  aiThinking?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  selectedPile,
  selectedCount,
  currentPlayer,
  gameOver,
  piles,
  onRemoveStones,
  isMultiplayer = false,
  aiThinking = false
}) => {
  // Fix for multiplayer: Allow controls for either player when it's their turn in multiplayer mode
  const canShowControls = selectedPile !== null && 
                         selectedCount > 0 && 
                         !gameOver && 
                         !aiThinking &&
                         (isMultiplayer || currentPlayer === 1);

  if (!canShowControls) {
    return <div className="h-16 sm:h-20"></div>; // Placeholder for consistent height when controls are hidden
  }

  const pileStonesAvailable = selectedPile !== null ? piles[selectedPile] : 0;

  return (
    <div className="flex flex-col items-center mt-3 sm:mt-4 p-2 sm:p-3 bg-card border rounded-lg shadow w-full">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 text-xs sm:text-sm w-full text-center">
        <span className="font-medium">Pile {selectedPile + 1} selected:</span>
        <Badge variant="secondary" className="text-sm sm:text-base px-2 py-0.5 sm:px-2.5">
          {selectedCount} stone{selectedCount > 1 ? 's' : ''}
        </Badge>
      </div>
      <div className="flex w-full justify-center">
        <Button 
          size="sm"
          className="w-full sm:w-auto sm:flex-none sm:px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onRemoveStones}
          disabled={selectedCount === 0 || selectedCount > pileStonesAvailable}
          aria-label={`Remove ${selectedCount} stone${selectedCount > 1 ? 's' : ''} from Pile ${selectedPile + 1}`}
        >
          <CheckCircle className="h-4 w-4 sm:mr-1.5" />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default GameControls;
