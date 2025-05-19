import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { HelpCircle } from 'lucide-react';
import {
  initializeBoard2048,
  addRandomTileToBoard2048,
  isGameOver2048,
  performMove2048,
  Board2048 as GameBoardType,
  MoveDirection
} from './game2048/game2048Logic';

const Game2048: React.FC = () => {
  const { state: gameContextState, dispatch } = useGameContext();
  const { activeProfileId } = gameContextState;
  const isMobile = useIsMobile();
  
  // Game state
  const [board, setBoard] = useState<GameBoardType>(initializeBoard2048());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  // Initialize game
  const resetGame = useCallback(() => {
    setBoard(initializeBoard2048());
    setScore(0);
    setGameOver(false);
  }, []);
  
  useEffect(() => {
    const savedBestScore = localStorage.getItem('game2048BestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
    resetGame(); // Initialize game on mount
  }, [resetGame]);
  
  // Save best score
  useEffect(() => {
    localStorage.setItem('game2048BestScore', bestScore.toString());
  }, [bestScore]);

  const processMove = (newBoard: GameBoardType, scoreDelta: number, changed: boolean) => {
    if (!changed) return;

    setBoard(newBoard);
    const newCurrentScore = score + scoreDelta;
    setScore(newCurrentScore);

    if (newCurrentScore > bestScore) {
      setBestScore(newCurrentScore);
    }

    const boardAfterAddingTile = newBoard.map(row => [...row]);
    addRandomTileToBoard2048(boardAfterAddingTile); // Modifies in place
    setBoard(boardAfterAddingTile);

    if (isGameOver2048(boardAfterAddingTile)) {
      setGameOver(true);
      if (activeProfileId) {
        dispatch({
          type: 'ADD_SCORE',
          payload: {
            userId: activeProfileId,
            gameId: 'game2048',
            score: newCurrentScore, // Use the latest score
            difficulty: GameDifficulty.EASY, // 2048 might not have difficulty settings in this version
            date: new Date(),
          },
        });
        toast({
          title: "Game Over",
          description: `Your final score: ${newCurrentScore}`,
        });
      }
    }
  };
  
  const handleKeyPress = useCallback((key: MoveDirection) => {
    if (gameOver) return;
    const { newBoard, scoreDelta, changed } = performMove2048(board, key);
    processMove(newBoard, scoreDelta, changed);
  }, [board, score, gameOver, bestScore, activeProfileId, dispatch]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Type assertion for key compatibility with MoveDirection
    const key = e.key as MoveDirection;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
        e.preventDefault();
        handleKeyPress(key);
    }
  }, [handleKeyPress]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // Re-attach if handleKeyDown changes (due to its dependencies)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameOver) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || gameOver) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    let direction: MoveDirection | null = null;

    const minSwipeDistance = 30; // Minimum distance for a swipe to be registered

    if (Math.abs(deltaX) > Math.abs(deltaY)) { // Horizontal swipe
      if (deltaX > minSwipeDistance) direction = 'ArrowRight';
      else if (deltaX < -minSwipeDistance) direction = 'ArrowLeft';
    } else { // Vertical swipe
      if (deltaY > minSwipeDistance) direction = 'ArrowDown';
      else if (deltaY < -minSwipeDistance) direction = 'ArrowUp';
    }
    
    if (direction) {
      handleKeyPress(direction);
    }
    setTouchStart(null);
  };
  
  // Get color for tile based on its value
  const getTileColor = (value: number) => {
    switch (value) {
      case 2: return 'bg-orange-100 text-gray-800';
      case 4: return 'bg-orange-200 text-gray-800';
      case 8: return 'bg-orange-300 text-white';
      case 16: return 'bg-orange-400 text-white';
      case 32: return 'bg-orange-500 text-white';
      case 64: return 'bg-orange-600 text-white';
      case 128: return 'bg-yellow-500 text-white';
      case 256: return 'bg-yellow-400 text-white';
      case 512: return 'bg-yellow-300 text-gray-800';
      case 1024: return 'bg-yellow-200 text-gray-800';
      case 2048: return 'bg-yellow-100 text-gray-800';
      default: return 'bg-gray-200 dark:bg-gray-700';
    }
  };
  
  // Get font size for tile based on its value
  const getTileTextSize = (value: number) => {
    if (value === 0) return 'text-xl';
    if (value < 100) return 'text-3xl sm:text-4xl';
    if (value < 1000) return 'text-2xl sm:text-3xl';
    return 'text-xl sm:text-2xl';
  };
  
  return (
    // Ensure this component tries to fill its parent's height and doesn't overflow internally.
    // `overflow-hidden` on the root prevents its children from causing scrollbars on the parent page,
    // assuming this component itself is meant to be self-contained within its allocated height.
    // The `h-full` means it will respect the height given by its parent.
    <div 
      className="flex flex-col h-full p-2 sm:p-4 overflow-hidden max-h-fit"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      // tabIndex={0} // Optional: makes the div focusable for key events if not window-bound
    >
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-around sm:justify-start">
          <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-2 sm:p-3 text-center min-w-[80px] sm:min-w-[100px] shadow">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">SCORE</div>
            <div className="text-lg sm:text-xl font-bold">{score}</div>
          </div>
          <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-2 sm:p-3 text-center min-w-[80px] sm:min-w-[100px] shadow">
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">BEST</div>
            <div className="text-lg sm:text-xl font-bold">{bestScore}</div>
          </div>
        </div>
        <Button onClick={resetGame} size="sm" variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
          Restart Game
        </Button>
      </div>
      
      <div 
        // This container will take up the remaining vertical space.
        // `min-h-0` is important for flex children in a column layout that need to shrink.
        // It allows this container to shrink below its content's intrinsic minimum size if necessary,
        // preventing it from pushing the parent (the root div of Game2048) to overflow.
        className="flex-grow flex items-center justify-center p-1 min-h-0" 
      >
        <div className="w-full max-w-[400px] sm:max-w-[480px] aspect-square bg-muted/70 dark:bg-muted/30 p-1.5 sm:p-2 rounded-lg shadow-lg">
          <div className="grid grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2 h-full rounded-md overflow-hidden">
            {board.flat().map((value, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-center rounded font-bold select-none
                  ${getTileColor(value)} 
                  ${getTileTextSize(value)}
                  transition-all duration-100 ease-in-out
                  ${value > 0 ? 'animate-scale-in' : ''} 
                `}
                style={{ transform: `scale(${value > 0 ? 1 : 0.9})`, opacity: value > 0 ? 1 : 0.7 }}
              >
                {value > 0 ? value : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {gameOver && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/50 rounded-md text-center flex-shrink-0 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Game Over!</h3>
          <p className="text-sm">Your Score: {score}</p>
          <Button onClick={resetGame} className="mt-2">Play Again</Button>
        </div>
      )}
    </div>
  );
};

export default Game2048;
