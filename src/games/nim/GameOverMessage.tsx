
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameOverMessageProps {
  gameOver: boolean;
  winner: 1 | 2 | null; // Player 1 or Player 2
  onRestart: () => void;
  isMultiplayer: boolean;
  isPlayerVsAI: boolean; // True if single player mode is against AI
  player1Name?: string; // Optional: For named display in multiplayer
  player2Name?: string; // Optional: For named display in multiplayer
}

const GameOverMessage: React.FC<GameOverMessageProps> = ({
  gameOver,
  winner,
  onRestart,
  isMultiplayer,
  isPlayerVsAI,
  player1Name = "Player 1", // Default names
  player2Name = "Player 2"
}) => {
  if (!gameOver || winner === null) {
    return null;
  }
  
  let message = "";
  if (isMultiplayer) {
    // In multiplayer, use provided names or defaults
    message = winner === 1 ? `${player1Name} Wins!` : `${player2Name} Wins!`;
  } else { // Single player
    if (isPlayerVsAI) {
      message = winner === 1 ? "You Won!" : "AI Won.";
    } else {
      // Fallback for single player non-AI (e.g. pass-and-play if ever implemented differently)
      message = winner === 1 ? "Player 1 Wins!" : "Player 2 Wins!";
    }
  }
  
  return (
    <div className="mt-4 p-4 bg-primary/10 dark:bg-primary/20 rounded-md text-center animate-fade-in">
      <h3 className="text-xl font-semibold mb-2 text-primary">{message}</h3>
      <Button onClick={onRestart} className="mt-3">Play Again</Button>
    </div>
  );
};

export default GameOverMessage;
