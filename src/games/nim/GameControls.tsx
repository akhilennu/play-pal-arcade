
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  selectedPile: number | null;
  selectedCount: number;
  currentPlayer: 1 | 2;
  gameOver: boolean;
  piles: number[];
  onAdjustSelection: (amount: number) => void;
  onRemoveStones: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  selectedPile,
  selectedCount,
  currentPlayer,
  gameOver,
  piles,
  onAdjustSelection,
  onRemoveStones
}) => {
  if (selectedPile === null || currentPlayer !== 1 || gameOver) {
    return null;
  }

  return (
    <div className="flex flex-col items-center mt-4 p-3 bg-muted/20 rounded-md">
      <p className="font-medium mb-2">
        Selected: {selectedCount} from Pile {selectedPile + 1}
      </p>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onAdjustSelection(-1)}
          disabled={selectedCount <= 1}
        >
          -
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onAdjustSelection(1)}
          disabled={selectedCount >= piles[selectedPile]}
        >
          +
        </Button>
        <Button 
          size="sm"
          onClick={onRemoveStones}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default GameControls;
