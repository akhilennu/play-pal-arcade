
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useGameContext } from '@/contexts/GameContext';
import { SoundType, useSoundEffects } from '@/hooks/use-sound-effects';

import PileComponent from './nim/PileComponent';
import GameControls from './nim/GameControls';
import GameOverMessage from './nim/GameOverMessage';
import GameHeader from './nim/GameHeader';
import GameStatus from './nim/GameStatus';
import { initializeGame, calculateAIMove, removeStones } from './nim/gameLogic';

const NimGame: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const { activeProfileId, gameSettings } = state;
  const { play } = useSoundEffects();
  
  const [piles, setPiles] = useState<number[]>([3, 4, 5]);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const isMultiplayer = gameSettings.isMultiplayer;
  
  useEffect(() => {
    if (!isMultiplayer && currentPlayer === 2 && !gameOver) {
      const timeoutId = setTimeout(() => {
        makeAIMove();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer, gameOver, isMultiplayer, piles]); // Added piles to dependency array for AI
  
  const makeAIMove = () => {
    const aiMove = calculateAIMove(piles);
    if (aiMove) {
      // AI directly removes stones, no intermediate selection state needed for AI
      handleRemoveStonesInternal(aiMove.pileIndex, aiMove.count);
    }
  };
  
  const handleResetGame = () => {
    const initialState = initializeGame();
    setPiles(initialState.piles);
    setCurrentPlayer(initialState.currentPlayer);
    setSelectedPile(initialState.selectedPile);
    setSelectedCount(initialState.selectedCount);
    setGameOver(initialState.gameOver);
    setWinner(initialState.winner);
  };
  
  // Consolidated handler for when a player interacts with a pile (clicks a stone)
  const handlePileInteraction = (pileIndex: number, count: number) => {
    if (gameOver || currentPlayer !== 1 || piles[pileIndex] === 0) return;

    // If clicking a different pile, or the same pile but a different count
    if (selectedPile !== pileIndex || selectedCount !== count) {
      setSelectedPile(pileIndex);
      // Ensure count does not exceed stones in pile
      setSelectedCount(Math.min(count, piles[pileIndex])); 
      play(SoundType.CLICK);
    }
  };
  
  // Renamed to avoid conflict with the one passed to GameControls
  const handleRemoveStonesInternal = (pileIdxToRemove: number, countToRemove: number) => {
     const result = removeStones(
      piles, 
      currentPlayer, 
      pileIdxToRemove, 
      countToRemove, 
      activeProfileId, 
      isMultiplayer, 
      gameSettings.difficulty,
      dispatch,
      play
    );
    
    setPiles(result.newPiles);
    setGameOver(result.gameOver);
    setWinner(result.winner);
    setCurrentPlayer(result.nextPlayer);
    setSelectedPile(null); // Reset selection after removing
    setSelectedCount(0);
  };

  // This function will be called by GameControls when the player confirms removal
  const playerConfirmRemoveStones = () => {
    if (selectedPile === null || selectedCount <= 0 || currentPlayer !== 1 || gameOver) return;
    handleRemoveStonesInternal(selectedPile, selectedCount);
  };
  
  return (
    <div className="flex flex-col h-full p-2 sm:p-4">
      <GameHeader onRestart={handleResetGame} />
      
      <Card className="flex-grow flex flex-col p-2 sm:p-4">
        <div className="my-2 sm:my-4"> {/* Reduced vertical margin for status */}
          <GameStatus 
            gameOver={gameOver}
            winner={winner}
            currentPlayer={currentPlayer}
            isMultiplayer={isMultiplayer}
          />
        </div>
        
        <div className="flex-1 flex items-center justify-around flex-wrap gap-1 sm:gap-2"> {/* Added gap for spacing between piles */}
          {piles.map((pileSize, index) => (
            <PileComponent
              key={index}
              pileSize={pileSize}
              pileIndex={index}
              selectedPile={selectedPile}
              selectedCount={selectedCount}
              currentPlayer={currentPlayer}
              gameOver={gameOver}
              onPileInteraction={handlePileInteraction} // Use the new consolidated handler
            />
          ))}
        </div>
        
        <GameControls
          selectedPile={selectedPile}
          selectedCount={selectedCount}
          currentPlayer={currentPlayer}
          gameOver={gameOver}
          piles={piles} // Pass piles to GameControls if it needs to know max stones
          onRemoveStones={playerConfirmRemoveStones} // Pass the confirm removal handler
          // onAdjustSelection is removed
        />
        
        <GameOverMessage
          gameOver={gameOver}
          winner={winner}
          onRestart={handleResetGame}
        />
      </Card>
    </div>
  );
};

export default NimGame;
