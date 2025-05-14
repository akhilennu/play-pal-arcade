
import { useState, useCallback } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty, Score } from '@/types';
import { toast } from "@/components/ui/use-toast";

interface GameStateOptions {
  gameId: string;
  initialScore?: number;
}

export const useGameState = ({ gameId, initialScore = 0 }: GameStateOptions) => {
  const { state, dispatch } = useGameContext();
  const { activeProfileId, gameSettings } = state;
  const [score, setScore] = useState(initialScore);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Start a new game
  const startGame = useCallback(() => {
    setIsGameActive(true);
    setIsGameOver(false);
    setScore(initialScore);
  }, [initialScore]);
  
  // End the game and record score
  const endGame = useCallback((finalScore?: number) => {
    const scoreToRecord = finalScore !== undefined ? finalScore : score;
    
    setIsGameActive(false);
    setIsGameOver(true);
    
    if (activeProfileId) {
      dispatch({
        type: 'ADD_SCORE',
        payload: {
          userId: activeProfileId,
          gameId: gameId,
          score: scoreToRecord,
          difficulty: gameSettings.difficulty as GameDifficulty,
          date: new Date(),
        },
      });
      
      toast({
        title: "Game Over",
        description: `Your final score: ${scoreToRecord}`,
      });
    }
  }, [activeProfileId, dispatch, gameId, score, gameSettings.difficulty]);
  
  // Update score during gameplay
  const updateScore = useCallback((points: number) => {
    setScore(prevScore => prevScore + points);
  }, []);
  
  // Get user's high score for this game
  const getHighScore = useCallback((): number => {
    if (!activeProfileId) return 0;
    
    const userScores = state.scores
      .filter(s => s.userId === activeProfileId && s.gameId === gameId);
    
    return userScores.length ? Math.max(...userScores.map(s => s.score)) : 0;
  }, [activeProfileId, gameId, state.scores]);
  
  // Get user's recent scores for this game
  const getRecentScores = useCallback((): Score[] => {
    if (!activeProfileId) return [];
    
    return state.scores
      .filter(s => s.userId === activeProfileId && s.gameId === gameId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [activeProfileId, gameId, state.scores]);
  
  return {
    score,
    isGameActive,
    isGameOver,
    difficulty: gameSettings.difficulty,
    isMultiplayer: gameSettings.isMultiplayer,
    highScore: getHighScore(),
    recentScores: getRecentScores(),
    startGame,
    endGame,
    updateScore,
  };
};
