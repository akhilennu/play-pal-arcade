
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
import { trainAgent, saveQTable, loadQTable } from './nim/qlearning'; // Added loadQTable

const NimGame: React.FC = () => {
  const { state: gameContextState, dispatch } = useGameContext(); // Renamed state to avoid conflict
  const { activeProfileId, gameSettings } = gameContextState;
  const { play } = useSoundEffects();
  
  // Initialize state using the (now potentially randomized) initializeGame function
  const initialGameState = initializeGame();
  const [piles, setPiles] = useState<number[]>(initialGameState.piles);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(initialGameState.currentPlayer);
  const [selectedPile, setSelectedPile] = useState<number | null>(initialGameState.selectedPile);
  const [selectedCount, setSelectedCount] = useState(initialGameState.selectedCount);
  const [gameOver, setGameOver] = useState(initialGameState.gameOver);
  const [winner, setWinner] = useState<1 | 2 | null>(initialGameState.winner);
  const [aiThinking, setAiThinking] = useState(false);
  const isMultiplayer = gameSettings.isMultiplayer;
  
  // Train AI on component mount if needed or ensure Q-table is loaded/exists
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const qTable = loadQTable(); // Check if QTable exists
      if (qTable.size === 0) { // If not, then train
        console.log('Training AI model on first load or if not found...');
        const newQTable = trainAgent();
        saveQTable(newQTable);
      } else {
        console.log('Existing Q-table loaded for Nim AI.');
      }
    }
  }, []);
  
  // AI move handler with useCallback to avoid re-creations
  const makeAIMove = useCallback(() => {
    if (isMultiplayer || gameOver || currentPlayer !== 2) return; // Ensure it's AI's turn
    
    setAiThinking(true);
    
    // Add a small delay to simulate "thinking"
    setTimeout(() => {
      const aiMove = calculateAIMove(piles, gameSettings.difficulty);
      if (aiMove && aiMove.pileIndex !== -1) { // Check for valid move
        // Ensure AI move is valid for the current pile state
        if (aiMove.pileIndex >= 0 && aiMove.pileIndex < piles.length && aiMove.count > 0 && aiMove.count <= piles[aiMove.pileIndex]) {
          handleRemoveStonesInternal(aiMove.pileIndex, aiMove.count);
        } else {
          console.error("AI proposed an invalid move:", aiMove, "Piles:", piles);
          // Fallback to a simple valid move if AI fails (e.g. first available stone)
          // This is a safeguard, ideally calculateAIMove should always return valid moves for current state.
          const nonEmptyPiles = piles.map((p, i) => ({p, i})).filter(pile => pile.p > 0);
          if (nonEmptyPiles.length > 0) {
            handleRemoveStonesInternal(nonEmptyPiles[0].i, 1);
          }
        }
      } else if (aiMove && aiMove.pileIndex === -1) {
        console.warn("AI could not determine a move (potentially no valid actions). This might indicate an issue or end of game for AI.");
        // This case should be handled if game isn't over but AI has no moves.
        // For Nim, this implies the game is over, which should be caught by gameOver flag.
      }
      setAiThinking(false);
    }, 700);
  }, [piles, gameOver, isMultiplayer, gameSettings.difficulty, currentPlayer, // Added currentPlayer
      // handleRemoveStonesInternal (will be added as dependency by ESLint if needed)
    ]);
  
  // AI turn handler
  useEffect(() => {
    if (!isMultiplayer && currentPlayer === 2 && !gameOver && !aiThinking) {
      makeAIMove();
    }
  }, [currentPlayer, gameOver, isMultiplayer, makeAIMove, aiThinking]);
  
  const handleResetGame = () => {
    const newInitialState = initializeGame(); // Get new random state
    setPiles(newInitialState.piles);
    setCurrentPlayer(newInitialState.currentPlayer);
    setSelectedPile(newInitialState.selectedPile);
    setSelectedCount(newInitialState.selectedCount);
    setGameOver(newInitialState.gameOver);
    setWinner(newInitialState.winner);
    setAiThinking(false); // Reset AI thinking state
  };
  
  // Consolidated handler for when a player interacts with a pile (clicks a stone)
  const handlePileInteraction = (pileIndex: number, count: number) => {
    if (gameOver || piles[pileIndex] === 0 || aiThinking) return;
     // Allow interaction if it's human's turn in single player, or current player's turn in multiplayer
    const canInteract = (!isMultiplayer && currentPlayer === 1) || isMultiplayer;

    if (canInteract) {
      setSelectedPile(pileIndex);
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
    // setCurrentPlayer should be set by removeStones logic result.nextPlayer
    setCurrentPlayer(result.nextPlayer); 
    setSelectedPile(null); 
    setSelectedCount(0);
  };

  // This function will be called by GameControls when the player confirms removal
  const playerConfirmRemoveStones = () => {
    if (selectedPile === null || selectedCount <= 0 || gameOver || aiThinking) return;
    
    // Allow removal if it's human's turn in single player, or current player's turn in multiplayer
    const canRemove = (!isMultiplayer && currentPlayer === 1) || isMultiplayer;
    if (canRemove) {
        handleRemoveStonesInternal(selectedPile, selectedCount);
    }
  };
  
  return (
    <div className="flex flex-col h-full p-2 sm:p-4">
      <GameHeader onRestart={handleResetGame} />
      
      <Card className="flex-grow flex flex-col p-2 sm:p-4">
        <div className="my-2 sm:my-4">
          <GameStatus 
            gameOver={gameOver}
            winner={winner}
            currentPlayer={currentPlayer}
            isMultiplayer={isMultiplayer}
            aiThinking={aiThinking}
          />
        </div>
        
        <div className="flex-1 flex items-center justify-around flex-wrap gap-1 sm:gap-2">
          {piles.map((pileSize, index) => (
            <PileComponent
              key={index}
              pileSize={pileSize}
              pileIndex={index}
              selectedPile={selectedPile}
              selectedCount={selectedCount}
              currentPlayer={currentPlayer}
              gameOver={gameOver}
              onPileInteraction={handlePileInteraction}
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

