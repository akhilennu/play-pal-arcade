
import React from 'react';
import { Loader2 } from 'lucide-react';

interface GameStatusProps {
  gameOver: boolean;
  winner: 1 | 2 | null;
  currentPlayer: 1 | 2;
  isMultiplayer: boolean;
  aiThinking?: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameOver,
  winner,
  currentPlayer,
  isMultiplayer,
  aiThinking = false
}) => {
  return (
    <div className="text-center mb-4">
      <div className={`text-lg font-medium ${gameOver ? 'text-primary' : ''} flex items-center justify-center gap-2`}>
        {gameOver 
          ? `Player ${winner} Wins!` 
          : aiThinking
            ? (
              <>
                <span>AI thinking</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            )
            : `Player ${currentPlayer}'s Turn ${
                !isMultiplayer && currentPlayer === 2 ? '(AI)' : ''
              }`
        }
      </div>
    </div>
  );
};

export default GameStatus;
