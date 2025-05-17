import { toast } from '@/components/ui/use-toast';
import { GameDifficulty } from '@/types';
import { SoundType } from '@/hooks/use-sound-effects';
import { getAIMove } from './qlearning';

// Generate random piles for the game
export const generateRandomPiles = (): number[] => {
  const numPiles = Math.random() < 0.25 ? 3 : 4; // 25% chance for 3 piles, 75% for 4
  const piles: number[] = [];
  for (let i = 0; i < numPiles; i++) {
    // Random integer between 1 and 10 (inclusive)
    const stones = Math.floor(Math.random() * 10) + 1;
    piles.push(stones);
  }
  return piles;
};

// Initialize or reset game
export const initializeGame = () => {
  return {
    piles: generateRandomPiles(), // Use the new random pile generator
    currentPlayer: 1 as 1 | 2,
    selectedPile: null as number | null,
    selectedCount: 0,
    gameOver: false,
    winner: null as 1 | 2 | null,
  };
};

// Make AI move based on difficulty
export const calculateAIMove = (piles: number[], difficulty: GameDifficulty) => {
  if (difficulty === GameDifficulty.HARD) {
    // Use Q-learning AI for hard difficulty
    return getAIMove(piles);
  } else if (difficulty === GameDifficulty.MEDIUM) {
    // For medium difficulty: 70% Q-learning, 30% random
    if (Math.random() < 0.7) {
      return getAIMove(piles);
    }
  }
  
  // Random move for EASY difficulty or fallback
  const nonEmptyPileIndices = piles
    .map((count, index) => ({ count, index }))
    .filter(pile => pile.count > 0);
  
  if (nonEmptyPileIndices.length === 0) return null;
  
  // Choose random pile and random count
  const chosenPile = nonEmptyPileIndices[Math.floor(Math.random() * nonEmptyPileIndices.length)];
  const chosenCount = Math.max(1, Math.floor(Math.random() * chosenPile.count));
  
  return { pileIndex: chosenPile.index, count: chosenCount };
};

// Remove stones and check for game over
export const removeStones = (
  piles: number[],
  currentPlayer: 1 | 2, 
  pileIndex: number,
  count: number,
  activeProfileId: string | null,
  isMultiplayer: boolean,
  difficulty: GameDifficulty,
  dispatch: any,
  playSound: (type: SoundType) => void
) => {
  // Update piles
  const newPiles = [...piles];
  newPiles[pileIndex] -= count;
  
  // Play sound
  playSound(SoundType.MERGE);
  
  // Check if game is over
  const remainingStones = newPiles.reduce((sum, pile) => sum + pile, 0);
  let gameOver = false;
  let winner = null;
  
  if (remainingStones === 0) {
    gameOver = true;
    // Set winner to the player who DIDN'T make the last move
    winner = currentPlayer === 1 ? 2 : 1;
    
    // Play appropriate sound
    playSound(currentPlayer === 1 ? SoundType.LOSE : SoundType.WIN);
    
    // Record score if player wins against AI
    if (activeProfileId && !isMultiplayer && winner === 1) {
      dispatch({
        type: 'ADD_SCORE',
        payload: {
          userId: activeProfileId,
          gameId: 'nim',
          score: 1, // Win = 1 point
          difficulty: difficulty,
          date: new Date(),
        },
      });
    }
    
    toast({
      title: "Game Over!",
      description: `Player ${winner} wins!`,
    });
  }
  
  // Switch player
  const nextPlayer = currentPlayer === 1 ? 2 : 1;
  
  return { 
    newPiles, 
    gameOver, 
    winner: winner as 1 | 2 | null,
    nextPlayer: nextPlayer as 1 | 2
  };
};
