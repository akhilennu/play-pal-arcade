
import React from 'react';
// Button import might not be needed if the modal handles the close action

interface GameInstructionsProps {
  // showInstructions and onToggleInstructions are no longer needed
  // as this component will be displayed directly within a modal.
}

const GameInstructions: React.FC<GameInstructionsProps> = () => {
  // The parent Dialog/Modal will handle visibility and closing.
  // So, we don't need the if (!showInstructions) return null; check anymore.
  // Also, the internal "Close" button is removed, relying on DialogClose.

  return (
    <div className="mt-4 text-sm"> {/* Removed bg-muted/40 and p-4, DialogContent will provide padding */}
      {/* Removed the header with "How to Play Nim:" and "Close" button */}
      <div className="text-left space-y-2">
        <p><span className="font-medium">Goal:</span> Force your opponent to take the last object.</p>
        <p><span className="font-medium">Setup:</span> The game starts with several piles of objects.</p>
        <p><span className="font-medium">Turns:</span> On your turn, select a pile and remove any number of objects from it (at least one).</p>
        <p><span className="font-medium">Winning:</span> The player who takes the last object from the last pile loses (Misere play). If all objects are gone, and it was your turn to move, you lose.</p>
        <p className="italic text-xs">(Note: The original description said "player who removes the last object loses", which is standard Nim. Some implementations vary, ensure this matches game logic.)</p>
        <p><span className="font-medium">Strategy (Simple):</span> Try to leave your opponent with an odd number of piles each containing one object. Or, more generally, aim for a "Nim-sum" of zero after your move (advanced).</p>
      </div>
    </div>
  );
};

export default GameInstructions;

