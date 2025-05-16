
import React from 'react';

// GameInstructionsProps is not strictly needed if no props are passed,
// but kept for consistency or future props.
interface GameInstructionsProps {}

const GameInstructions: React.FC<GameInstructionsProps> = () => {
  return (
    <div className="mt-4 text-sm">
      <div className="text-left space-y-2">
        <p><span className="font-medium">Overview:</span> Nim is a two-player strategy game.</p>
        <p><span className="font-medium">Gameplay:</span> Players take turns removing one or more objects from a single pile.</p>
        <p><span className="font-medium">Objective:</span> The player who removes the last object loses.</p>
        <p><span className="font-medium">Rule:</span> Only one pile can be used per turn.</p>
        {/* 
          The original prompt mentioned: "The player who takes the last object from the last pile loses (Misere play)."
          The new prompt is: "The player who removes the last object loses." 
          This is consistent with Misere play, which is what the current gameLogic implements.
        */}
      </div>
    </div>
  );
};

export default GameInstructions;
