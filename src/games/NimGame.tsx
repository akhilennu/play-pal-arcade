
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { useGameContext } from '@/contexts/GameContext';
import { SoundType, useSoundEffects } from '@/hooks/use-sound-effects';

import PileComponent from './nim/PileComponent';
import GameControls from './nim/GameControls';
import GameOverMessage from './nim/GameOverMessage';
import GameHeader from './nim/GameHeader';
import GameStatus from './nim/GameStatus';
import { initializeGame, calculateAIMove, removeStones } from './nim/gameLogic';
import { trainAgent, saveQTable } from './nim/qlearning';

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
  const [aiThinking, setAiThinking] = useState(false);
  const isMultiplayer = gameSettings.isMultiplayer;
  
  // Train AI on component mount if needed
  useEffect(() => {
    // Check if we're in localStorage to avoid unnecessary training in dev mode
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('nim-qtable')) {
      console.log('Training AI model on first load...');
      const qTable = trainAgent();
      saveQTable(qTable);
    }
  }, []);
  
  // AI move handler with useCallback to avoid re-creations
  const makeAIMove = useCallback(() => {
    if (isMultiplayer || gameOver) return;
    
    setAiThinking(true);
    
    // Add a small delay to simulate "thinking"
    setTimeout(() => {
      const aiMove = calculateAIMove(piles, gameSettings.difficulty);
      if (aiMove) {
        handleRemoveStonesInternal(aiMove.pileIndex, aiMove.count);
      }
      setAiThinking(false);
    }, 700);
  }, [piles, gameOver, isMultiplayer, gameSettings.difficulty]);
  
  // AI turn handler
  useEffect(() => {
    if (!isMultiplayer && currentPlayer === 2 && !gameOver && !aiThinking) {
      makeAIMove();
    }
  }, [currentPlayer, gameOver, isMultiplayer, makeAIMove, aiThinking]);
  
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
    // Fix for multiplayer: Allow either player 1 or player 2 to select when it's their turn
    // Instead of hardcoding currentPlayer !== 1
    if (gameOver || piles[pileIndex] === 0) return;
    
    if ((isMultiplayer || currentPlayer === 1) && !aiThinking) {
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
    if (selectedPile === null || selectedCount <= 0 || gameOver) return;
    
    // Fix for multiplayer: Allow either player to confirm removal when it's their turn
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
            aiThinking={aiThinking}
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
              isMultiplayer={isMultiplayer}
              aiThinking={aiThinking}
            />
          ))}
        </div>
        
        <GameControls
          selectedPile={selectedPile}
          selectedCount={selectedCount}
          currentPlayer={currentPlayer}
          gameOver={gameOver}
          piles={piles}
          onRemoveStones={playerConfirmRemoveStones}
          isMultiplayer={isMultiplayer}
          aiThinking={aiThinking}
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
