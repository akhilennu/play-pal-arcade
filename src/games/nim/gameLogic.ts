import { toast } from '@/hooks/use-toast';
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
    piles: generateRandomPiles(),
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
  
  if (nonEmptyPileIndices.length === 0) return { pileIndex: -1, count: 0 }; // Ensure a return object
  
  // Choose random pile and random count
  const chosenPile = nonEmptyPileIndices[Math.floor(Math.random() * nonEmptyPileIndices.length)];
  const chosenCount = Math.max(1, Math.floor(Math.random() * chosenPile.count) +1); // ensure at least 1
  
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
  dispatch: any, // Consider typing dispatch more strictly if possible
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
    winner = currentPlayer === 1 ? 2 : 1; // The current player made the last move, so the other player wins
    
    // Toast is a side effect, ideally handled by the component.
    // For now, keeping it here to maintain functionality during this refactor stage.
    // A future refactor could involve this function returning a game outcome object,
    // and the component would then call toast.
    toast({
      title: "Game Over!",
      description: `Player ${winner} wins!`, // This assumes Player 1 and Player 2 are the display names.
                                           // For more accurate naming (e.g., "AI wins"), this toast
                                           // might need to be triggered from NimGame.tsx where player names are known.
    });
    
    playSound(winner === 1 && !isMultiplayer ? SoundType.WIN : SoundType.LOSE); // If P1 (human) wins vs AI, WIN sound. Otherwise LOSE.
                                                                         // Or more generally, if current user is the winner.

    if (activeProfileId && winner === 1 && !isMultiplayer) { // Score if Player 1 (human) wins against AI
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
    } else if (activeProfileId && isMultiplayer && winner === 1) { // Score if Player 1 (human) wins in multiplayer
        // Assuming player 1 is the active user in multiplayer for scoring purposes
        // This might need more sophisticated logic if any player can be the active user.
         dispatch({
          type: 'ADD_SCORE',
          payload: {
            userId: activeProfileId,
            gameId: 'nim',
            score: 1, 
            difficulty: difficulty,
            date: new Date(),
          },
        });
    }
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
