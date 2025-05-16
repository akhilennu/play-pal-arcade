
import React from 'react';

// GameInstructionsProps is not strictly needed if no props are passed,
// but kept for consistency or future props.
interface GameInstructionsProps {}

const GameInstructions: React.FC<GameInstructionsProps> = () => {
  return (
    <div className="mt-4 text-sm">
      <div className="text-left space-y-2">
        <p>Nim is a two-player strategy game.</p>
        <p>Players take turns removing one or more objects from a single pile.</p>
        <p>The player who removes the last object loses.</p>
        <p>Only one pile can be used per turn.</p>
      </div>
    </div>
  );
};

export default GameInstructions;
