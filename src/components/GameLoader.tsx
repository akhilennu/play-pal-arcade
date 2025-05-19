
import React, { Suspense, lazy } from 'react';
import { getGameById } from '@/data/gamesData';
import GameLoading from './GameLoading'; // Assuming GameLoading is a general loading spinner

// Lazy load games
const TicTacToe = lazy(() => import('@/games/TicTacToe'));
const MemoryMatch = lazy(() => import('@/games/MemoryMatch'));
const Game2048 = lazy(() => import('@/games/Game2048'));
const NimGame = lazy(() => import('@/games/NimGame'));
const ComingSoon = lazy(() => import('@/components/ComingSoon'));

interface GameLoaderProps {
  gameId: string;
  player1Name?: string;
  player2Name?: string;
  isMultiplayer?: boolean;
}

const GameLoader: React.FC<GameLoaderProps> = ({ gameId, player1Name, player2Name, isMultiplayer }) => {
  const gameData = getGameById(gameId); // Potentially unused if only routing by gameId matters for component choice

  let GameComponent;

  switch (gameId) {
    case 'tictactoe':
      GameComponent = <TicTacToe p1Name={player1Name} p2Name={player2Name} isMultiplayerOverride={isMultiplayer} />;
      break;
    case 'memorymatch':
      GameComponent = <MemoryMatch />; // MemoryMatch doesn't take these props currently
      break;
    case 'game2048':
      GameComponent = <Game2048 />; // Game2048 doesn't take these props currently
      break;
    case 'nim':
      GameComponent = <NimGame p1Name={player1Name} p2Name={player2Name} isMultiplayerOverride={isMultiplayer} />;
      break;
    case 'hangman': // Example for future games
    case 'connectfour':
    case 'sudoku':
      GameComponent = <ComingSoon />;
      break;
    default:
      GameComponent = <ComingSoon />; // Fallback for unknown game IDs
  }

  return (
    <Suspense fallback={<GameLoading />}>
      {GameComponent}
    </Suspense>
  );
};

export default GameLoader;

