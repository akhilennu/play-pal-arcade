
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameOverMessageProps {
  gameOver: boolean;
  winner: 1 | 2 | null;
  onRestart: () => void;
}

const GameOverMessage: React.FC<GameOverMessageProps> = ({
  gameOver,
  winner,
  onRestart
}) => {
  if (!gameOver) {
    return null;
  }
  
  return (
    <div className="mt-4 p-4 bg-primary/20 rounded-md text-center">
      <h3 className="text-lg font-semibold mb-2">Game Over!</h3>
      <p>Player {winner} Wins!</p>
      <Button onClick={onRestart} className="mt-2">Play Again</Button>
    </div>
  );
};

export default GameOverMessage;
