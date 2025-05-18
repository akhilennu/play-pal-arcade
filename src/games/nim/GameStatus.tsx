
import React from 'react';
import { Loader2 } from 'lucide-react';

interface GameStatusProps {
  gameOver: boolean;
  winner: 1 | 2 | null;
  currentPlayer: 1 | 2;
  isMultiplayer: boolean;
  aiThinking?: boolean;
  player1Name: string;
  player2Name: string;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameOver,
  winner,
  currentPlayer,
  isMultiplayer,
  aiThinking = false,
  player1Name,
  player2Name,
}) => {
  const winnerName = winner === 1 ? player1Name : player2Name;
  const currentPlayerName = currentPlayer === 1 ? player1Name : player2Name;

  return (
    <div className="text-center mb-4">
      <div className={`text-lg font-medium ${gameOver ? 'text-primary' : ''} flex items-center justify-center gap-2`}>
        {gameOver 
          ? `${winnerName} Wins!` 
          : aiThinking
            ? (
              <>
                <span>AI thinking</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            )
            : `${currentPlayerName}'s Turn ${!isMultiplayer && currentPlayer === 2 && player2Name === "AI" ? '(AI)' : ''}`
        }
      </div>
    </div>
  );
};

export default GameStatus;
