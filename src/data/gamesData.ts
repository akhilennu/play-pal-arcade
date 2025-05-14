
import { Game, GameDifficulty } from "@/types";

export const games: Game[] = [
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    description: "The classic game of X's and O's. Be the first to get three in a row!",
    icon: "grid-2x2",
    component: () => import("@/games/TicTacToe"),
    availableDifficulties: [GameDifficulty.EASY, GameDifficulty.MEDIUM, GameDifficulty.HARD],
    supportsMultiplayer: true,
    category: "classic"
  },
  {
    id: "memorymatch",
    name: "Memory Match",
    description: "Test your memory by finding matching pairs of cards.",
    icon: "square-check",
    component: () => import("@/games/MemoryMatch"),
    availableDifficulties: [GameDifficulty.EASY, GameDifficulty.MEDIUM, GameDifficulty.HARD],
    supportsMultiplayer: false,
    category: "casual"
  },
  {
    id: "game2048",
    name: "2048",
    description: "Combine tiles to reach 2048 and beyond in this addictive puzzle game!",
    icon: "plus",
    component: () => import("@/games/Game2048"),
    availableDifficulties: [GameDifficulty.EASY],
    supportsMultiplayer: false,
    category: "puzzle"
  },
  {
    id: "comingsoon1",
    name: "Sudoku",
    description: "Coming Soon: Fill the grid with numbers 1-9 without repeating in rows, columns, or boxes.",
    icon: "help-circle",
    component: () => import("@/components/ComingSoon"),
    availableDifficulties: [GameDifficulty.EASY, GameDifficulty.MEDIUM, GameDifficulty.HARD],
    supportsMultiplayer: false,
    category: "puzzle"
  },
  {
    id: "comingsoon2",
    name: "Hangman",
    description: "Coming Soon: Guess the word one letter at a time before the hangman is complete.",
    icon: "help-circle",
    component: () => import("@/components/ComingSoon"),
    availableDifficulties: [GameDifficulty.EASY, GameDifficulty.MEDIUM, GameDifficulty.HARD],
    supportsMultiplayer: false,
    category: "classic"
  },
  {
    id: "comingsoon3",
    name: "Connect Four",
    description: "Coming Soon: Drop discs to connect four of your color vertically, horizontally, or diagonally.",
    icon: "help-circle",
    component: () => import("@/components/ComingSoon"),
    availableDifficulties: [GameDifficulty.EASY],
    supportsMultiplayer: true,
    category: "classic"
  }
];

export const getGameById = (id: string): Game | undefined => {
  return games.find(game => game.id === id);
};

export const filterGamesByCategory = (category: string): Game[] => {
  return games.filter(game => game.category === category);
};
