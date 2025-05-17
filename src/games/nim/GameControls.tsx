
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MinusCircle, PlusCircle } from 'lucide-react'; // MinusCircle and PlusCircle might not be needed

interface GameControlsProps {
  selectedPile: number | null;
  selectedCount: number;
  currentPlayer: 1 | 2;
  gameOver: boolean;
  piles: number[]; // Keep if needed for validation, though count is already validated in NimGame
  onRemoveStones: () => void;
  // onAdjustSelection is removed
}

const GameControls: React.FC<GameControlsProps> = ({
  selectedPile,
  selectedCount,
  currentPlayer,
  gameOver,
  piles, // piles might not be strictly needed here if selectedCount is always valid
  onRemoveStones
}) => {
  // Show controls only if it's player 1's turn, game is not over, and a pile is selected with some stones
  const canShowControls = selectedPile !== null && selectedCount > 0 && currentPlayer === 1 && !gameOver;

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
        {/* <span className="text-muted-foreground hidden sm:inline">to remove</span> */}
      </div>
      <div className="flex w-full justify-center">
        {/* Remove "Decrease" and "Increase" buttons */}
        <Button 
          size="sm" // Consider 'default' size for better touch target on mobile
          className="w-full sm:w-auto sm:flex-none sm:px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onRemoveStones}
          disabled={selectedCount === 0 || selectedCount > pileStonesAvailable} // Disable if nothing selected or trying to remove more than available
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
