
import React from 'react';

const GameInstructionsTicTacToe: React.FC = () => {
  return (
    <div className="mt-4 text-sm">
      <div className="text-left space-y-2">
        <p>Tic-Tac-Toe is a classic game for two players, X and O, who take turns marking the spaces in a 3×3 grid.</p>
        <p>The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row wins the game.</p>
        <p>If the grid is filled and no player has won, the game is a draw.</p>
      </div>
    </div>
  );
};

export default GameInstructionsTicTacToe;
