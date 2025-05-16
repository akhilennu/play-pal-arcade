import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types'; // GameDifficulty is used in dispatch

const Game2048: React.FC = () => {
  const { state: gameContextState, dispatch } = useGameContext();
  const { activeProfileId } = gameContextState;
  
  // Game state
  const [board, setBoard] = useState<number[][]>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  // Initialize game
  const initializeGame = useCallback(() => {
    const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, []);
  
  // Load best score from localStorage & initialize
  useEffect(() => {
    const savedBestScore = localStorage.getItem('game2048BestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
    initializeGame();
  }, [initializeGame]);
  
  // Save best score
  useEffect(() => {
    localStorage.setItem('game2048BestScore', bestScore.toString());
  }, [bestScore]);

  
  // Add a new random tile to the board
  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
      return true;
    }
    return false;
  };
  
  // Check if the game is over
  const checkGameOver = (currentBoard: number[][]) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) return false;
      }
    }
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (currentBoard[i][j] === currentBoard[i][j + 1]) return false;
      }
    }
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 3; i++) {
        if (currentBoard[i][j] === currentBoard[i + 1][j]) return false;
      }
    }
    return true;
  };
  
  // Move tiles in different directions
  const moveLeft = (currentBoard: number[][], currentScore: number) => {
    let changed = false;
    const newBoard = currentBoard.map(row => [...row]);
    let newScore = currentScore;
    
    for (let i = 0; i < 4; i++) {
      const compactedRow = newBoard[i].filter(tile => tile !== 0);
      const mergedRow: number[] = [];
      let tileIndex = 0;
      while(tileIndex < compactedRow.length) {
        if (tileIndex + 1 < compactedRow.length && compactedRow[tileIndex] === compactedRow[tileIndex+1]) {
          const mergedValue = compactedRow[tileIndex] * 2;
          mergedRow.push(mergedValue);
          newScore += mergedValue;
          changed = true;
          tileIndex += 2;
        } else {
          mergedRow.push(compactedRow[tileIndex]);
          tileIndex += 1;
        }
      }
      while(mergedRow.length < 4) {
        mergedRow.push(0);
      }
      if (!newBoard[i].every((val, index) => val === mergedRow[index])) {
        changed = true;
      }
      newBoard[i] = mergedRow;
    }
    return { newBoard, newScore, changed };
  };
  
  const moveRight = (currentBoard: number[][], currentScore: number) => {
    let changed = false;
    const newBoard = currentBoard.map(row => [...row]);
    let newScore = currentScore;
    for (let i = 0; i < 4; i++) {
      const compactedRow = newBoard[i].filter(tile => tile !== 0).reverse();
      const mergedRow: number[] = [];
      let tileIndex = 0;
      while(tileIndex < compactedRow.length) {
        if (tileIndex + 1 < compactedRow.length && compactedRow[tileIndex] === compactedRow[tileIndex+1]) {
          const mergedValue = compactedRow[tileIndex] * 2;
          mergedRow.push(mergedValue);
          newScore += mergedValue;
          changed = true;
          tileIndex += 2;
        } else {
          mergedRow.push(compactedRow[tileIndex]);
          tileIndex += 1;
        }
      }
      const finalRow = mergedRow.reverse();
      while(finalRow.length < 4) {
        finalRow.unshift(0);
      }
      if (!newBoard[i].every((val, index) => val === finalRow[index])) {
        changed = true;
      }
      newBoard[i] = finalRow;
    }
    return { newBoard, newScore, changed };
  };
  
  const moveUp = (currentBoard: number[][], currentScore: number) => {
    const transposedBoard = transpose(currentBoard);
    const { newBoard: movedTransposedBoard, newScore, changed } = moveLeft(transposedBoard, currentScore);
    return { newBoard: transpose(movedTransposedBoard), newScore, changed };
  };
  
  const moveDown = (currentBoard: number[][], currentScore: number) => {
    const transposedBoard = transpose(currentBoard);
    const { newBoard: movedTransposedBoard, newScore, changed } = moveRight(transposedBoard, currentScore);
    return { newBoard: transpose(movedTransposedBoard), newScore, changed };
  };
  
  // Transpose function for vertical moves
  const transpose = (matrix: number[][]) => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    let result;
    switch (e.key) {
      case 'ArrowLeft': result = moveLeft(board, score); break;
      case 'ArrowRight': result = moveRight(board, score); break;
      case 'ArrowUp': result = moveUp(board, score); break;
      case 'ArrowDown': result = moveDown(board, score); break;
      default: return;
    }
    e.preventDefault();
    if (result) processMoveResult(result);
  }, [gameOver, board, score, bestScore, activeProfileId, dispatch]);
  

  // Add and remove keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // Re-attach if handleKeyDown changes (due to its dependencies)

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameOver) return;
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || gameOver) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Determine direction of swipe based on which delta is larger
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 30) { // Check positive deltaX for right swipe
        // Right swipe
        const result = moveRight(board, score);
        processMoveResult(result);
      } else if (deltaX < -30) { // Check negative deltaX for left swipe
        // Left swipe
        const result = moveLeft(board, score);
        processMoveResult(result);
      }
    } else {
      // Vertical swipe
      if (deltaY > 30) { // Check positive deltaY for down swipe
        // Down swipe
        const result = moveDown(board, score);
        processMoveResult(result);
      } else if (deltaY < -30) { // Check negative deltaY for up swipe
        // Up swipe
        const result = moveUp(board, score);
        processMoveResult(result);
      }
    }
    
    setTouchStart(null);
  };
  
  // Process game move result
  const processMoveResult = (result: { newBoard: number[][], newScore: number, changed: boolean }) => {
    if (!result.changed) return;
    
    setBoard(result.newBoard);
    setScore(result.newScore);
    
    if (result.newScore > bestScore) {
      setBestScore(result.newScore);
    }
    
    const boardWithNewTile = result.newBoard.map(row => [...row]);
    const tileAdded = addRandomTile(boardWithNewTile);
    
    if (checkGameOver(boardWithNewTile)) {
      setGameOver(true);
      if (activeProfileId) {
        dispatch({
          type: 'ADD_SCORE',
          payload: {
            userId: activeProfileId,
            gameId: 'game2048',
            score: result.newScore,
            difficulty: GameDifficulty.EASY,
            date: new Date(),
          },
        });
        toast({
          title: "Game Over",
          description: `Your final score: ${result.newScore}`,
        });
      }
    }
    
    setBoard(boardWithNewTile);
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
    if (value === 0) return 'text-lg sm:text-xl';         // e.g., 18px base, 20px on sm+
    if (value < 100) return 'text-xl sm:text-3xl';       // e.g., 20px base, 30px on sm+
    if (value < 1000) return 'text-lg sm:text-2xl';      // e.g., 18px base, 24px on sm+
    return 'text-base sm:text-xl';                       // e.g., 16px base, 20px on sm+
  };
  
  return (
    // Ensure this component tries to fill its parent's height and doesn't overflow internally.
    // `overflow-hidden` on the root prevents its children from causing scrollbars on the parent page,
    // assuming this component itself is meant to be self-contained within its allocated height.
    // The `h-full` means it will respect the height given by its parent.
    <div 
      className="flex flex-col h-full p-2 sm:p-4 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
        <Button onClick={initializeGame} size="sm" variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
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
        {/* Board Container: Reduced base padding for mobile (p-1), sm screens use p-1.5 */}
        <div className={`
          w-full h-full 
          max-w-[400px] sm:max-w-[480px] 
          max-h-[400px] sm:max-h-[480px]
          aspect-square bg-muted/70 dark:bg-muted/30 p-1 sm:p-1.5 rounded-lg shadow-lg`}>
          <div className="grid grid-cols-4 grid-rows-4 gap-1 sm:gap-1.5 h-full rounded-md overflow-hidden">
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
          <Button onClick={initializeGame} className="mt-2">Play Again</Button>
        </div>
      )}
    </div>
  );
};

export default Game2048;
