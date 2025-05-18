
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
import { trainAgent, saveQTable, loadQTable } from './nim/qlearning';

// Define props for NimGame
interface NimGameProps {
  p1Name?: string;
  p2Name?: string;
  isMultiplayerOverride?: boolean;
}

const NimGame: React.FC<NimGameProps> = ({ p1Name, p2Name, isMultiplayerOverride }) => {
  const { state: gameContextState, dispatch } = useGameContext();
  const { activeProfileId, gameSettings, profiles } = gameContextState; // Added profiles
  const { play } = useSoundEffects();

  // Determine actual isMultiplayer state
  const actualIsMultiplayer = typeof isMultiplayerOverride === 'boolean' 
                              ? isMultiplayerOverride 
                              : gameSettings.isMultiplayer;
  
  // Determine player names
  const player1ActualName = p1Name || profiles.find(p => p.id === activeProfileId)?.name || "Player 1";
  // In single player, Player 2 is AI. For multiplayer, use p2Name prop or default.
  const player2ActualName = actualIsMultiplayer ? (p2Name || "Player 2") : "AI";

  const initialGameState = initializeGame();
  const [piles, setPiles] = useState<number[]>(initialGameState.piles);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(initialGameState.currentPlayer);
  const [selectedPile, setSelectedPile] = useState<number | null>(initialGameState.selectedPile);
  const [selectedCount, setSelectedCount] = useState(initialGameState.selectedCount);
  const [gameOver, setGameOver] = useState(initialGameState.gameOver);
  const [winner, setWinner] = useState<1 | 2 | null>(initialGameState.winner);
  const [aiThinking, setAiThinking] = useState(false);
  // Removed: const isMultiplayer = gameSettings.isMultiplayer; // Now using actualIsMultiplayer

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const qTable = loadQTable();
      if (qTable.size === 0) {
        console.log('Training AI model on first load or if not found...');
        const newQTable = trainAgent();
        saveQTable(newQTable);
      } else {
        console.log('Existing Q-table loaded for Nim AI.');
      }
    }
  }, []);

  const handleRemoveStonesInternal = useCallback((pileIdxToRemove: number, countToRemove: number) => {
    const result = removeStones(
     piles, 
     currentPlayer, 
     pileIdxToRemove, 
     countToRemove, 
     activeProfileId, 
     actualIsMultiplayer, // Use actualIsMultiplayer
     gameSettings.difficulty,
     dispatch,
     play
   );
   
   setPiles(result.newPiles);
   setGameOver(result.gameOver);
   setWinner(result.winner);
   setCurrentPlayer(result.nextPlayer); 
   setSelectedPile(null); 
   setSelectedCount(0);
  }, [piles, currentPlayer, activeProfileId, actualIsMultiplayer, gameSettings.difficulty, dispatch, play]);
  
  const makeAIMove = useCallback(() => {
    if (actualIsMultiplayer || gameOver || currentPlayer !== 2) return;
    
    setAiThinking(true);
    
    setTimeout(() => {
      const aiMove = calculateAIMove(piles, gameSettings.difficulty);
      if (aiMove && aiMove.pileIndex !== -1) {
        if (aiMove.pileIndex >= 0 && aiMove.pileIndex < piles.length && aiMove.count > 0 && aiMove.count <= piles[aiMove.pileIndex]) {
          handleRemoveStonesInternal(aiMove.pileIndex, aiMove.count);
        } else {
          console.error("AI proposed an invalid move:", aiMove, "Piles:", piles);
          const nonEmptyPiles = piles.map((p, i) => ({p, i})).filter(pile => pile.p > 0);
          if (nonEmptyPiles.length > 0) {
            handleRemoveStonesInternal(nonEmptyPiles[0].i, 1);
          }
        }
      } else if (aiMove && aiMove.pileIndex === -1) {
        console.warn("AI could not determine a move (potentially no valid actions). This might indicate an issue or end of game for AI.");
      }
      setAiThinking(false);
    }, 700);
  }, [piles, gameOver, actualIsMultiplayer, gameSettings.difficulty, currentPlayer, handleRemoveStonesInternal]); // Added handleRemoveStonesInternal and actualIsMultiplayer
  
  useEffect(() => {
    if (!actualIsMultiplayer && currentPlayer === 2 && !gameOver && !aiThinking) { // Use actualIsMultiplayer
      makeAIMove();
    }
  }, [currentPlayer, gameOver, actualIsMultiplayer, makeAIMove, aiThinking]); // Use actualIsMultiplayer
  
  const handleResetGame = () => {
    const newInitialState = initializeGame();
    setPiles(newInitialState.piles);
    setCurrentPlayer(newInitialState.currentPlayer);
    setSelectedPile(newInitialState.selectedPile);
    setSelectedCount(newInitialState.selectedCount);
    setGameOver(newInitialState.gameOver);
    setWinner(newInitialState.winner);
    setAiThinking(false);
  };
  
  const handlePileInteraction = (pileIndex: number, count: number) => {
    if (gameOver || piles[pileIndex] === 0 || aiThinking) return;
    const canInteract = (!actualIsMultiplayer && currentPlayer === 1) || actualIsMultiplayer; // Use actualIsMultiplayer

    if (canInteract) {
      setSelectedPile(pileIndex);
      setSelectedCount(Math.min(count, piles[pileIndex])); 
      play(SoundType.CLICK);
    }
  };
  
  const playerConfirmRemoveStones = () => {
    if (selectedPile === null || selectedCount <= 0 || gameOver || aiThinking) return;
    
    const canRemove = (!actualIsMultiplayer && currentPlayer === 1) || actualIsMultiplayer; // Use actualIsMultiplayer
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
            isMultiplayer={actualIsMultiplayer} // Use actualIsMultiplayer
            aiThinking={aiThinking}
            player1Name={player1ActualName}
            player2Name={player2ActualName}
            // Player names could be passed here if GameStatus needs to display them
            // For now, it uses Player 1/2 or AI based on isMultiplayer
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
              isMultiplayer={actualIsMultiplayer} // Use actualIsMultiplayer
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
          isMultiplayer={actualIsMultiplayer} // Use actualIsMultiplayer
          aiThinking={aiThinking}
        />
        
        <GameOverMessage
          gameOver={gameOver}
          winner={winner}
          onRestart={handleResetGame}
          isMultiplayer={actualIsMultiplayer} // Pass actualIsMultiplayer
          isPlayerVsAI={!actualIsMultiplayer} // Single player Nim is vs AI
          player1Name={player1ActualName} // Pass determined player 1 name
          player2Name={player2ActualName} // Pass determined player 2 name (or "AI")
        />
      </Card>
    </div>
  );
};

export default NimGame;
