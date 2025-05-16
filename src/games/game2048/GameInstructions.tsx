
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const GameInstructions2048: React.FC = () => {
  const isMobile = useIsMobile();
  return (
    <div className="mt-4 text-sm">
      <div className="text-left space-y-2">
        <p>The objective of the game is to slide numbered tiles on a grid to combine them to create a tile with the number 2048.</p>
        {isMobile ? (
          <p>Swipe Up, Down, Left, or Right to move all tiles. When two tiles with the same number touch, they merge into one!</p>
        ) : (
          <p>Use your arrow keys (Up, Down, Left, Right) to move all tiles. When two tiles with the same number touch, they merge into one!</p>
        )}
        <p>After every move, a new tile (either 2 or 4) will randomly appear in an empty spot.</p>
        <p>The game ends when the grid is full and no more moves can be made, or when you create the 2048 tile (though you can continue playing after that!).</p>
      </div>
    </div>
  );
};

export default GameInstructions2048;
