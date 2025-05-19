
import React, { Suspense, lazy } from 'react';

// Lazy load instruction components
const GameInstructionsNim = lazy(() => import('@/games/nim/GameInstructions'));
const GameInstructionsTicTacToe = lazy(() => import('@/games/tictactoe/GameInstructions'));
const GameInstructionsMemoryMatch = lazy(() => import('@/games/memorymatch/GameInstructions'));
const GameInstructions2048 = lazy(() => import('@/games/game2048/GameInstructions'));

interface HowToPlayContentProviderProps {
  gameId: string;
}

const HowToPlayContentProvider: React.FC<HowToPlayContentProviderProps> = ({ gameId }) => {
  let InstructionsComponent;

  switch (gameId) {
    case 'nim':
      InstructionsComponent = <GameInstructionsNim />;
      break;
    case 'tictactoe':
      InstructionsComponent = <GameInstructionsTicTacToe />;
      break;
    case 'memorymatch':
      InstructionsComponent = <GameInstructionsMemoryMatch />;
      break;
    case 'game2048':
      InstructionsComponent = <GameInstructions2048 />;
      break;
    case 'hangman':
      InstructionsComponent = <p className="italic text-muted-foreground">Detailed instructions for Hangman are coming soon!</p>;
      break;
    case 'connectfour':
      InstructionsComponent = <p className="italic text-muted-foreground">Detailed instructions for Connect Four are coming soon!</p>;
      break;
    default:
      InstructionsComponent = <p className="italic text-muted-foreground">Detailed instructions for this game are coming soon!</p>;
  }
  
  return (
    <Suspense fallback={<div>Loading instructions...</div>}>
      {InstructionsComponent}
    </Suspense>
  );
};

export default HowToPlayContentProvider;

