
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameInstructionsProps {
  showInstructions: boolean;
  onToggleInstructions: () => void;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({
  showInstructions,
  onToggleInstructions
}) => {
  if (!showInstructions) {
    return null;
  }
  
  return (
    <div className="mt-4 bg-muted/40 p-4 rounded-md text-sm">
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium">How to Play Nim:</p>
        <Button size="sm" variant="ghost" onClick={onToggleInstructions}>Close</Button>
      </div>
      <div className="text-left space-y-2">
        <p><span className="font-medium">Goal:</span> Force your opponent to take the last object.</p>
        <p><span className="font-medium">Setup:</span> The game starts with several piles of objects.</p>
        <p><span className="font-medium">Turns:</span> On your turn, select a pile and remove any number of objects from it (at least one).</p>
        <p><span className="font-medium">Winning:</span> The player who removes the last object loses.</p>
        <p><span className="font-medium">Strategy:</span> Try to leave your opponent with an odd number of piles with one object each.</p>
      </div>
    </div>
  );
};

export default GameInstructions;
