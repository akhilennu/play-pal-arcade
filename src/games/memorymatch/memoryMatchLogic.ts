
import { GameDifficulty, MemoryCard } from '@/types';

export const getBoardConfig = (difficulty: GameDifficulty) => {
  switch (difficulty) {
    case GameDifficulty.EASY:
      return { rows: 3, cols: 4, totalPairs: 6 };
    case GameDifficulty.HARD:
      return { rows: 4, cols: 6, totalPairs: 12 };
    case GameDifficulty.MEDIUM:
    default:
      return { rows: 4, cols: 4, totalPairs: 8 };
  }
};

export const generateNewBoard = (rows: number, cols: number): MemoryCard[] => {
  const totalPairs = (rows * cols) / 2;
  const cardValues = Array.from({ length: totalPairs }, (_, i) => i + 1);
  const cardPairs = [...cardValues, ...cardValues];
  
  return cardPairs
    .sort(() => Math.random() - 0.5)
    .map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }));
};

export const calculateMemoryMatchScore = (
  moves: number,
  startTime: Date | null,
  endTime: Date | null,
  difficulty: GameDifficulty
): number => {
  if (!startTime || !endTime) return 0;

  const timeElapsed = endTime.getTime() - startTime.getTime();
  const secondsElapsed = Math.floor(timeElapsed / 1000);
  
  let baseScore = 1000;
  const difficultyMultiplier = 
    difficulty === GameDifficulty.EASY ? 1 :
    difficulty === GameDifficulty.MEDIUM ? 1.5 : 2;
  
  const movesPenalty = moves * 10;
  const timePenalty = secondsElapsed * 2;
  
  return Math.max(
    Math.floor((baseScore * difficultyMultiplier) - movesPenalty - timePenalty), 
    50
  );
};

