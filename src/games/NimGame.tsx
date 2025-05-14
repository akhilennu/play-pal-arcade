
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { useSoundEffects, SoundType } from '@/hooks/use-sound-effects';

const NimGame: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const { activeProfileId, gameSettings } = state;
  const isMobile = useIsMobile();
  const { play } = useSoundEffects();
  
  // Game state
  const [piles, setPiles] = useState<number[]>([3, 4, 5]); // Default pile sizes
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1); // Player 1 starts
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
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
    // Simple AI strategy
    // Find non-empty pile
    const nonEmptyPileIndices = piles
      .map((count, index) => ({ count, index }))
      .filter(pile => pile.count > 0);
    
    if (nonEmptyPileIndices.length === 0) return;
    
    // Choose random pile and random count
    const chosenPile = nonEmptyPileIndices[Math.floor(Math.random() * nonEmptyPileIndices.length)];
    const chosenCount = Math.max(1, Math.floor(Math.random() * chosenPile.count));
    
    // Make the move
    handleRemoveStones(chosenPile.index, chosenCount);
  };
  
  // Initialize or reset game
  const initializeGame = () => {
    setPiles([3, 4, 5]);
    setCurrentPlayer(1);
    setSelectedPile(null);
    setSelectedCount(0);
    setGameOver(false);
    setWinner(null);
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
  
  // Handle confirming stone removal
  const handleRemoveStones = (pileIndex: number | null = null, count: number | null = null) => {
    const finalPileIndex = pileIndex !== null ? pileIndex : selectedPile;
    const finalCount = count !== null ? count : selectedCount;
    
    if (finalPileIndex === null || finalCount <= 0) return;
    
    // Update piles
    const newPiles = [...piles];
    newPiles[finalPileIndex] -= finalCount;
    setPiles(newPiles);
    
    // Play sound
    play(SoundType.MERGE);
    
    // Check if game is over
    const remainingStones = newPiles.reduce((sum, pile) => sum + pile, 0);
    if (remainingStones === 0) {
      setGameOver(true);
      // Set winner to the player who DIDN'T make the last move
      const gameWinner = currentPlayer === 1 ? 2 : 1;
      setWinner(gameWinner);
      
      // Play appropriate sound
      play(currentPlayer === 1 ? SoundType.LOSE : SoundType.WIN);
      
      // Record score if player wins against AI
      if (activeProfileId && !isMultiplayer && gameWinner === 1) {
        dispatch({
          type: 'ADD_SCORE',
          payload: {
            userId: activeProfileId,
            gameId: 'nim',
            score: 1, // Win = 1 point
            difficulty: gameSettings.difficulty,
            date: new Date(),
          },
        });
      }
      
      toast({
        title: "Game Over!",
        description: `Player ${gameWinner} wins!`,
      });
    }
    
    // Switch player
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setSelectedPile(null);
    setSelectedCount(0);
  };
  
  // Render a single pile
  const renderPile = (pileSize: number, pileIndex: number) => {
    const isPileSelected = selectedPile === pileIndex;
    const stoneSize = isMobile ? "w-8 h-8" : "w-10 h-10";
    
    return (
      <div className="flex flex-col items-center mb-4">
        <div className="text-sm font-medium mb-1">Pile {pileIndex + 1}</div>
        <div 
          className={`flex flex-wrap justify-center p-2 rounded-md transition-colors ${
            isPileSelected ? 'bg-primary/20' : 'bg-muted/20'
          }`}
          style={{ minWidth: '100px', minHeight: '120px' }}
        >
          {Array.from({ length: pileSize }).map((_, stoneIndex) => (
            <motion.div
              key={stoneIndex}
              className={`${stoneSize} m-1 rounded-full ${
                isPileSelected && stoneIndex < selectedCount 
                  ? 'bg-primary/80' 
                  : 'bg-primary/30'
              } cursor-pointer transition-colors`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                if (isPileSelected && currentPlayer === 1) {
                  setSelectedCount(stoneIndex + 1);
                }
              }}
            />
          ))}
        </div>
        {pileSize > 0 && (
          <Button 
            size="sm" 
            variant="outline"
            className="mt-2"
            onClick={() => handleSelectPile(pileIndex)}
            disabled={gameOver || (currentPlayer !== 1) || (!isMultiplayer && currentPlayer === 2)}
          >
            Select
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Nim</h2>
          <p className="text-sm text-muted-foreground">
            Strategic pile game - remove objects to win!
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <Button onClick={initializeGame} size="sm" variant="outline">Restart</Button>
            <Button onClick={() => setShowInstructions(!showInstructions)} size="sm" variant="outline">
              Help
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="flex-grow flex flex-col p-4">
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
        
        <div className="flex-1 flex items-center justify-around flex-wrap">
          {piles.map((pileSize, index) => (
            <div key={index}>
              {renderPile(pileSize, index)}
            </div>
          ))}
        </div>
        
        {selectedPile !== null && currentPlayer === 1 && !gameOver && (
          <div className="flex flex-col items-center mt-4 p-3 bg-muted/20 rounded-md">
            <p className="font-medium mb-2">
              Selected: {selectedCount} from Pile {selectedPile + 1}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAdjustSelection(-1)}
                disabled={selectedCount <= 1}
              >
                -
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAdjustSelection(1)}
                disabled={selectedCount >= piles[selectedPile]}
              >
                +
              </Button>
              <Button 
                size="sm"
                onClick={() => handleRemoveStones()}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="mt-4 p-4 bg-primary/20 rounded-md text-center">
            <h3 className="text-lg font-semibold mb-2">Game Over!</h3>
            <p>Player {winner} Wins!</p>
            <Button onClick={initializeGame} className="mt-2">Play Again</Button>
          </div>
        )}
      </Card>
      
      {showInstructions && (
        <div className="mt-4 bg-muted/40 p-4 rounded-md text-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">How to Play Nim:</p>
            <Button size="sm" variant="ghost" onClick={() => setShowInstructions(false)}>Close</Button>
          </div>
          <div className="text-left space-y-2">
            <p><span className="font-medium">Goal:</span> Force your opponent to take the last object.</p>
            <p><span className="font-medium">Setup:</span> The game starts with several piles of objects.</p>
            <p><span className="font-medium">Turns:</span> On your turn, select a pile and remove any number of objects from it (at least one).</p>
            <p><span className="font-medium">Winning:</span> The player who removes the last object loses.</p>
            <p><span className="font-medium">Strategy:</span> Try to leave your opponent with an odd number of piles with one object each.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NimGame;
