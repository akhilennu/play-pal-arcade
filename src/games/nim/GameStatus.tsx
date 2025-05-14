
import React from 'react';

interface GameStatusProps {
  gameOver: boolean;
  winner: 1 | 2 | null;
  currentPlayer: 1 | 2;
  isMultiplayer: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameOver,
  winner,
  currentPlayer,
  isMultiplayer
}) => {
  return (
    <div className="text-center mb-4">
      <div className={`text-lg font-medium ${gameOver ? 'text-primary' : ''}`}>
        {gameOver 
          ? `Player ${winner} Wins!` 
          : `Player ${currentPlayer}'s Turn ${
              !isMultiplayer && currentPlayer === 2 ? '(AI)' : ''
            }`
        }
      </div>
    </div>
  );
};

export default GameStatus;
