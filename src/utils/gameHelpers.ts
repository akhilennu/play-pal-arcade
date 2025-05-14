
import { GameDifficulty } from "@/types";

// Format score with thousand separators
export const formatScore = (score: number): string => {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Get display name for a game ID
export const getGameDisplayName = (gameId: string): string => {
  switch (gameId) {
    case 'tictactoe': return 'Tic-Tac-Toe';
    case 'memorymatch': return 'Memory Match';
    case 'game2048': return '2048';
    case 'sudoku': return 'Sudoku';
    case 'connectfour': return 'Connect Four';
    case 'hangman': return 'Hangman';
    default: return gameId.charAt(0).toUpperCase() + gameId.slice(1);
  }
};

// Get difficulty factor for score calculations
export const getDifficultyMultiplier = (difficulty: GameDifficulty): number => {
  switch (difficulty) {
    case GameDifficulty.EASY: return 1;
    case GameDifficulty.MEDIUM: return 1.5;
    case GameDifficulty.HARD: return 2;
    default: return 1;
  }
};

// Format time in MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Generate a random integer between min (inclusive) and max (inclusive)
export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Shuffle an array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Check if the device is in portrait orientation
export const isPortraitOrientation = (): boolean => {
  return window.innerHeight > window.innerWidth;
};

// Get appropriate grid size based on device and difficulty
export const getGridSize = (gameId: string, difficulty: GameDifficulty): {rows: number, cols: number} => {
  switch (gameId) {
    case 'memorymatch':
      switch (difficulty) {
        case GameDifficulty.EASY: return { rows: 3, cols: 4 };
        case GameDifficulty.MEDIUM: return { rows: 4, cols: 4 };
        case GameDifficulty.HARD: return { rows: 4, cols: 6 };
        default: return { rows: 4, cols: 4 };
      }
    default:
      return { rows: 4, cols: 4 };
  }
};

// Create a debounce function to limit execution rate
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};
