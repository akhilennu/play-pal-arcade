
import React from 'react';
import { Button } from '@/components/ui/button';
import { useMemoryMatchLogic } from './memorymatch/useMemoryMatchLogic';
import MemoryMatchBoard from './memorymatch/MemoryMatchBoard';

const MemoryMatch: React.FC = () => {
  const {
    cards,
    moves,
    gameFinished,
    startTime,
    endTime,
    initializeGame,
    handleCardClick,
    boardConfig,
  } = useMemoryMatchLogic();

  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-xl font-bold mb-4 flex justify-between items-center flex-shrink-0">
        <span>Moves: {moves}</span>
        <Button onClick={initializeGame} variant="outline">New Game</Button>
      </div>

      {cards.length > 0 ? (
        <MemoryMatchBoard
          cards={cards}
          onCardClick={handleCardClick}
          columns={boardConfig.cols}
        />
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p>Loading game...</p>
        </div>
      )}

      {gameFinished && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-md text-center flex-shrink-0">
          <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
          <p>You matched all pairs in {moves} moves.</p>
          <p>
            Time: {endTime && startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0} seconds
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
