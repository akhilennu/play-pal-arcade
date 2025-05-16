import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useGameContext } from '@/contexts/GameContext';
import { SoundType, useSoundEffects } from '@/hooks/use-sound-effects';

// Import the new components
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
  
  // Game state
  const [piles, setPiles] = useState<number[]>([3, 4, 5]); // Default pile sizes
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1); // Player 1 starts
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const isMultiplayer = gameSettings.isMultiplayer;
  
  // Set up AI turn if needed
  useEffect(() => {
    if (!isMultiplayer && currentPlayer === 2 && !gameOver) {
      // Add a delay to make the AI move feel more natural
      const timeoutId = setTimeout(() => {
        makeAIMove();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer, gameOver, isMultiplayer]);
  
  // AI move logic
  const makeAIMove = () => {
    const aiMove = calculateAIMove(piles);
    if (aiMove) {
      handleRemoveStones(aiMove.pileIndex, aiMove.count);
    }
  };
  
  // Reset game state
  const handleResetGame = () => {
    const { piles, currentPlayer, selectedPile, selectedCount, gameOver, winner } = initializeGame();
    setPiles(piles);
    setCurrentPlayer(currentPlayer);
    setSelectedPile(selectedPile);
    setSelectedCount(selectedCount);
    setGameOver(gameOver);
    setWinner(winner);
  };
  
  // Handle pile selection
  const handleSelectPile = (pileIndex: number) => {
    if (gameOver) return;
    
    // Can only select non-empty piles
    if (piles[pileIndex] === 0) return;
    
    setSelectedPile(pileIndex);
    setSelectedCount(1); // Start with selecting 1 stone
    play(SoundType.CLICK);
  };
  
  // Handle stone selection (increase/decrease)
  const handleAdjustSelection = (amount: number) => {
    if (selectedPile === null) return;
    
    const newCount = selectedCount + amount;
    if (newCount >= 1 && newCount <= piles[selectedPile]) {
      setSelectedCount(newCount);
      play(SoundType.CLICK);
    }
  };
  
  // Handle selecting specific stone count directly
  const handleSelectCount = (count: number) => {
    if (selectedPile === null) return;
    setSelectedCount(count);
  };
  
  // Handle confirming stone removal
  const handleRemoveStones = (pileIndex: number | null = null, count: number | null = null) => {
    const finalPileIndex = pileIndex !== null ? pileIndex : selectedPile;
    const finalCount = count !== null ? count : selectedCount;
    
    if (finalPileIndex === null || finalCount <= 0) return;
    
    const result = removeStones(
      piles, 
      currentPlayer, 
      finalPileIndex, 
      finalCount, 
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
    setSelectedPile(null);
    setSelectedCount(0);
  };
  
  return (
    <div className="flex flex-col h-full p-4">
      {/* Game Header */}
      <GameHeader 
        onRestart={handleResetGame}
      />
      
      <Card className="flex-grow flex flex-col p-4">
        {/* Game Status */}
        <GameStatus 
          gameOver={gameOver}
          winner={winner}
          currentPlayer={currentPlayer}
          isMultiplayer={isMultiplayer}
        />
        
        {/* Piles Display */}
        <div className="flex-1 flex items-center justify-around flex-wrap">
          {piles.map((pileSize, index) => (
            <div key={index}>
              <PileComponent
                pileSize={pileSize}
                pileIndex={index}
                selectedPile={selectedPile}
                selectedCount={selectedCount}
                currentPlayer={currentPlayer}
                gameOver={gameOver}
                onSelectPile={handleSelectPile}
                onSelectCount={handleSelectCount}
              />
            </div>
          ))}
        </div>
        
        {/* Game Controls */}
        <GameControls
          selectedPile={selectedPile}
          selectedCount={selectedCount}
          currentPlayer={currentPlayer}
          gameOver={gameOver}
          piles={piles}
          onAdjustSelection={handleAdjustSelection}
          onRemoveStones={() => handleRemoveStones()}
        />
        
        {/* Game Over Message */}
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
