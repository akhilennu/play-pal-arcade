
import { Game, GameDifficulty } from "@/types";

export const games: Game[] = [
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    description: "The classic game of X's and O's. Get three in a row to win!",
    icon: "gamepad-2",
    component: () => import("../games/TicTacToe"),
    availableDifficulties: [
      GameDifficulty.EASY,
      GameDifficulty.MEDIUM,
      GameDifficulty.HARD
    ],
    defaultDifficulty: GameDifficulty.HARD, // Default to HARD
    supportsMultiplayer: true,
    category: "classic",
    isAvailable: true
  },
  {
    id: "memorymatch",
    name: "Memory Match",
    description: "Test your memory by matching pairs of cards.",
    icon: "brain",
    component: () => import("../games/MemoryMatch"),
    availableDifficulties: [
      GameDifficulty.EASY,
      GameDifficulty.MEDIUM,
      GameDifficulty.HARD
    ],
    defaultDifficulty: GameDifficulty.MEDIUM, // Default to MEDIUM as requested
    supportsMultiplayer: false,
    category: "classic",
    isAvailable: true
  },
  {
    id: "game2048",
    name: "2048",
    description: "Slide numbered tiles and combine them to reach 2048!",
    icon: "puzzle",
    component: () => import("../games/Game2048"),
    availableDifficulties: [
      GameDifficulty.EASY
    ],
    defaultDifficulty: GameDifficulty.EASY, // Default to EASY (only one available)
    supportsMultiplayer: false,
    category: "puzzle",
    isAvailable: true
  },
  {
    id: "nim",
    name: "Nim",
    description: "Strategic pile game - remove objects to win!",
    icon: "layers",
    component: () => import("../games/NimGame"),
    availableDifficulties: [
      GameDifficulty.EASY,
      GameDifficulty.MEDIUM,
      GameDifficulty.HARD
    ],
    defaultDifficulty: GameDifficulty.HARD, // Default to HARD
    supportsMultiplayer: true,
    category: "strategy",
    isAvailable: true
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Fill the grid with numbers. Each row, column, and 3x3 box must contain numbers 1-9.",
    icon: "grid-3x3",
    component: () => import("../components/ComingSoon"),
    availableDifficulties: [
      GameDifficulty.EASY,
      GameDifficulty.MEDIUM,
      GameDifficulty.HARD
    ],
    defaultDifficulty: GameDifficulty.HARD, // Default to HARD
    supportsMultiplayer: false,
    category: "puzzle",
    isAvailable: false
  },
  {
    id: "connectfour",
    name: "Connect Four",
    description: "Drop discs to connect four of your color in a row.",
    icon: "grid-2x2",
    component: () => import("../components/ComingSoon"),
    availableDifficulties: [
      GameDifficulty.MEDIUM
    ],
    defaultDifficulty: GameDifficulty.MEDIUM, // Default to MEDIUM (only one available)
    supportsMultiplayer: true,
    category: "strategy",
    isAvailable: false
  },
  {
    id: "hangman",
    name: "Hangman",
    description: "Guess the word one letter at a time before the hangman is complete.",
    icon: "pen",
    component: () => import("../components/ComingSoon"),
    availableDifficulties: [
      GameDifficulty.EASY,
      GameDifficulty.MEDIUM,
      GameDifficulty.HARD
    ],
    defaultDifficulty: GameDifficulty.HARD, // Default to HARD
    supportsMultiplayer: false,
    category: "casual",
    isAvailable: false
  }
];

// Helper function to get a game by ID
export const getGameById = (id: string): Game | undefined => {
  return games.find(game => game.id === id);
};

// Helper function to get games by category
export const getGamesByCategory = (category: string): Game[] => {
  return games.filter(game => game.category === category);
};

// Helper function to get available games
export const getAvailableGames = (): Game[] => {
  return games.filter(game => game.isAvailable);
};
