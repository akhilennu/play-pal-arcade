
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { MinusCircle, PlusCircle, CheckCircle } from 'lucide-react'; // Import icons

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
    <div className="flex flex-col items-center mt-4 p-4 bg-card border rounded-lg shadow">
      <div className="flex items-center gap-2 mb-3 text-sm">
        <span className="font-medium">Pile {selectedPile + 1}:</span>
        <Badge variant="secondary" className="text-base px-2.5 py-0.5">
          {selectedCount}
        </Badge>
        <span className="text-muted-foreground">stones selected</span>
      </div>
      <div className="flex w-full justify-center gap-2 sm:gap-3">
        <Button 
          size="sm" 
          variant="outline"
          className="flex-1 sm:flex-none sm:px-4"
          onClick={() => onAdjustSelection(-1)}
          disabled={selectedCount <= 1}
          aria-label="Decrease selection"
        >
          <MinusCircle className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Decrease</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="flex-1 sm:flex-none sm:px-4"
          onClick={() => onAdjustSelection(1)}
          disabled={selectedCount >= piles[selectedPile]}
          aria-label="Increase selection"
        >
          <PlusCircle className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Increase</span>
        </Button>
        <Button 
          size="sm"
          className="flex-1 sm:flex-none sm:px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onRemoveStones}
          aria-label="Remove selected stones"
        >
          <CheckCircle className="h-4 w-4 sm:mr-1.5" />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default GameControls;

