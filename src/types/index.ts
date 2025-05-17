// Game Interfaces
export enum GameDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard"
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  component: () => Promise<{ default: React.ComponentType<{}> }>;
  availableDifficulties: GameDifficulty[];
  defaultDifficulty: GameDifficulty; // Added this property
  supportsMultiplayer: boolean;
  category: "puzzle" | "strategy" | "classic" | "casual";
  isAvailable: boolean; // Added this property
}

export interface UserProfile {
  id: string;
  name: string;
  avatarId: number;
  createdAt: Date;
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  musicEnabled: boolean;
  achievements: Achievement[];
}

export interface Score {
  userId: string;
  gameId: string;
  score: number;
  difficulty: GameDifficulty;
  date: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

// Game-specific types
export interface TicTacToeGame {
  board: Array<string | null>;
  currentPlayer: "X" | "O";
  winner: "X" | "O" | "draw" | null;
}

export interface MemoryGame {
  cards: MemoryCard[];
  flippedIndices: number[];
  matchedPairs: number[];
  moves: number;
}

export interface MemoryCard {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface Game2048 {
  board: number[][];
  score: number;
  bestScore: number;
  gameOver: boolean;
}
