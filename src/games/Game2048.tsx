
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

const Game2048: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const { activeProfileId } = state;
  const isMobile = useIsMobile();
  
  // Game state
  const [board, setBoard] = useState<number[][]>(Array(4).fill(0).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  // Initialize game
  const initializeGame = () => {
    const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setHasChanged(false);
  };
  
  // Load best score from localStorage
  useEffect(() => {
    const savedBestScore = localStorage.getItem('game2048BestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
    
    initializeGame();
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Save best score whenever it changes
  useEffect(() => {
    localStorage.setItem('game2048BestScore', bestScore.toString());
  }, [bestScore]);
  
  // Add a new random tile to the board
  const addRandomTile = (currentBoard: number[][]) => {
    // Find all empty cells
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    // If there are empty cells, add a new tile
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
      return true;
    }
    
    return false;
  };
  
  // Check if the game is over
  const checkGameOver = (currentBoard: number[][]) => {
    // Check for any empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === 0) {
          return false;
        }
      }
    }
    
    // Check for any possible merges horizontally
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (currentBoard[i][j] === currentBoard[i][j + 1]) {
          return false;
        }
      }
    }
    
    // Check for any possible merges vertically
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentBoard[i][j] === currentBoard[i + 1][j]) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Move tiles in different directions
  const moveLeft = (currentBoard: number[][]) => {
    let changed = false;
    const newBoard = currentBoard.map(row => [...row]);
    let newScore = score;
    
    for (let i = 0; i < 4; i++) {
      let lastMergedIdx = -1; // Track the last merged position
      for (let j = 1; j < 4; j++) {
        if (newBoard[i][j] !== 0) {
          let moveToIdx = j;
          
          // Move left as far as possible
          while (moveToIdx > 0 && newBoard[i][moveToIdx - 1] === 0) {
            moveToIdx--;
          }
          
          // If we can merge with the tile to the left
          if (moveToIdx > 0 && newBoard[i][moveToIdx - 1] === newBoard[i][j] && lastMergedIdx !== moveToIdx - 1) {
            newBoard[i][moveToIdx - 1] *= 2;
            newScore += newBoard[i][moveToIdx - 1];
            newBoard[i][j] = 0;
            lastMergedIdx = moveToIdx - 1;
            changed = true;
          } 
          // Otherwise just move
          else if (moveToIdx !== j) {
            newBoard[i][moveToIdx] = newBoard[i][j];
            newBoard[i][j] = 0;
            changed = true;
          }
        }
      }
    }
    
    return { newBoard, newScore, changed };
  };
  
  const moveRight = (currentBoard: number[][]) => {
    let changed = false;
    const newBoard = currentBoard.map(row => [...row]);
    let newScore = score;
    
    for (let i = 0; i < 4; i++) {
      let lastMergedIdx = 4; // Track the last merged position
      for (let j = 2; j >= 0; j--) {
        if (newBoard[i][j] !== 0) {
          let moveToIdx = j;
          
          // Move right as far as possible
          while (moveToIdx < 3 && newBoard[i][moveToIdx + 1] === 0) {
            moveToIdx++;
          }
          
          // If we can merge with the tile to the right
          if (moveToIdx < 3 && newBoard[i][moveToIdx + 1] === newBoard[i][j] && lastMergedIdx !== moveToIdx + 1) {
            newBoard[i][moveToIdx + 1] *= 2;
            newScore += newBoard[i][moveToIdx + 1];
            newBoard[i][j] = 0;
            lastMergedIdx = moveToIdx + 1;
            changed = true;
          } 
          // Otherwise just move
          else if (moveToIdx !== j) {
            newBoard[i][moveToIdx] = newBoard[i][j];
            newBoard[i][j] = 0;
            changed = true;
          }
        }
      }
    }
    
    return { newBoard, newScore, changed };
  };
  
  const moveUp = (currentBoard: number[][]) => {
    let changed = false;
    const newBoard = currentBoard.map(row => [...row]);
    let newScore = score;
    
    for (let j = 0; j < 4; j++) {
      let lastMergedIdx = -1; // Track the last merged position
      for (let i = 1; i < 4; i++) {
        if (newBoard[i][j] !== 0) {
          let moveToIdx = i;
          
          // Move up as far as possible
          while (moveToIdx > 0 && newBoard[moveToIdx - 1][j] === 0) {
            moveToIdx--;
          }
          
          // If we can merge with the tile above
          if (moveToIdx > 0 && newBoard[moveToIdx - 1][j] === newBoard[i][j] && lastMergedIdx !== moveToIdx - 1) {
            newBoard[moveToIdx - 1][j] *= 2;
            newScore += newBoard[moveToIdx - 1][j];
            newBoard[i][j] = 0;
            lastMergedIdx = moveToIdx - 1;
            changed = true;
          } 
          // Otherwise just move
          else if (moveToIdx !== i) {
            newBoard[moveToIdx][j] = newBoard[i][j];
            newBoard[i][j] = 0;
            changed = true;
          }
        }
      }
    }
    
    return { newBoard, newScore, changed };
  };
  
  const moveDown = (currentBoard: number[][]) => {
    let changed = false;
    const newBoard = currentBoard.map(row => [...row]);
    let newScore = score;
    
    for (let j = 0; j < 4; j++) {
      let lastMergedIdx = 4; // Track the last merged position
      for (let i = 2; i >= 0; i--) {
        if (newBoard[i][j] !== 0) {
          let moveToIdx = i;
          
          // Move down as far as possible
          while (moveToIdx < 3 && newBoard[moveToIdx + 1][j] === 0) {
            moveToIdx++;
          }
          
          // If we can merge with the tile below
          if (moveToIdx < 3 && newBoard[moveToIdx + 1][j] === newBoard[i][j] && lastMergedIdx !== moveToIdx + 1) {
            newBoard[moveToIdx + 1][j] *= 2;
            newScore += newBoard[moveToIdx + 1][j];
            newBoard[i][j] = 0;
            lastMergedIdx = moveToIdx + 1;
            changed = true;
          } 
          // Otherwise just move
          else if (moveToIdx !== i) {
            newBoard[moveToIdx][j] = newBoard[i][j];
            newBoard[i][j] = 0;
            changed = true;
          }
        }
      }
    }
    
    return { newBoard, newScore, changed };
  };
  
  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver) return;
    
    let result;
    
    switch (e.key) {
      case 'ArrowLeft':
        result = moveLeft(board);
        break;
      case 'ArrowRight':
        result = moveRight(board);
        break;
      case 'ArrowUp':
        result = moveUp(board);
        break;
      case 'ArrowDown':
        result = moveDown(board);
        break;
      default:
        return;
    }
    
    e.preventDefault();
    
    if (result?.changed) {
      setHasChanged(true);
      setBoard(result.newBoard);
      setScore(result.newScore);
      
      if (result.newScore > bestScore) {
        setBestScore(result.newScore);
      }
      
      // Add a new tile after the move
      const boardAfterNewTile = result.newBoard.map(row => [...row]);
      addRandomTile(boardAfterNewTile);
      
      // Check if game is over
      if (checkGameOver(boardAfterNewTile)) {
        setGameOver(true);
        
        // Record score
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
      
      setBoard(boardAfterNewTile);
    }
  };
  
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
      if (deltaX > 20) {
        // Right swipe
        const result = moveRight(board);
        processGameMove(result);
      } else if (deltaX < -20) {
        // Left swipe
        const result = moveLeft(board);
        processGameMove(result);
      }
    } else {
      // Vertical swipe
      if (deltaY > 20) {
        // Down swipe
        const result = moveDown(board);
        processGameMove(result);
      } else if (deltaY < -20) {
        // Up swipe
        const result = moveUp(board);
        processGameMove(result);
      }
    }
    
    setTouchStart(null);
  };
  
  // Process game move result
  const processGameMove = (result: { newBoard: number[][], newScore: number, changed: boolean } | undefined) => {
    if (!result?.changed) return;
    
    setHasChanged(true);
    setBoard(result.newBoard);
    setScore(result.newScore);
    
    if (result.newScore > bestScore) {
      setBestScore(result.newScore);
    }
    
    // Add a new tile after the move
    const boardAfterNewTile = result.newBoard.map(row => [...row]);
    addRandomTile(boardAfterNewTile);
    
    // Check if game is over
    if (checkGameOver(boardAfterNewTile)) {
      setGameOver(true);
      
      // Record score
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
    
    setBoard(boardAfterNewTile);
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
    if (value < 100) return 'text-4xl';
    if (value < 1000) return 'text-3xl';
    return 'text-2xl';
  };
  
  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">2048</h2>
          <p className="text-sm text-muted-foreground">Join the tiles, get to 2048!</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-4">
            <div className="bg-game2048-primary/20 rounded-md p-2 text-center min-w-[100px]">
              <div className="text-sm font-medium">SCORE</div>
              <div className="font-bold">{score}</div>
            </div>
            <div className="bg-game2048-secondary/20 rounded-md p-2 text-center min-w-[100px]">
              <div className="text-sm font-medium">BEST</div>
              <div className="font-bold">{bestScore}</div>
            </div>
          </div>
          <Button onClick={initializeGame} size="sm">New Game</Button>
        </div>
      </div>
      
      <Card 
        className="flex-grow flex items-center justify-center p-4 bg-game2048-primary/5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-w-md aspect-square bg-game2048-secondary/20 p-2 rounded-lg">
          <div className="grid grid-cols-4 grid-rows-4 gap-2 h-full">
            {board.flat().map((value, index) => (
              <div
                key={index}
                className={`
                  flex items-center justify-center rounded-md font-bold
                  ${getTileColor(value)} 
                  ${getTileTextSize(value)}
                  ${value > 0 ? 'scale-100' : 'scale-90'}
                  transition-all duration-200
                `}
              >
                {value > 0 ? value : ''}
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {gameOver && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-md text-center">
          <h3 className="text-lg font-semibold mb-2">Game Over!</h3>
          <p>Your Score: {score}</p>
          <Button onClick={initializeGame} className="mt-2">Play Again</Button>
        </div>
      )}
      
      <div className="mt-4 flex justify-center">
        <div className="bg-muted/40 p-4 rounded-md text-center text-sm">
          <p className="font-medium mb-2">How to Play 2048:</p>
          <div className="text-left space-y-3">
            <div>
              <p className="font-medium">1. Goal:</p>
              <p>Merge tiles with the same number to reach the 2048 tile.</p>
            </div>
            
            <div>
              <p className="font-medium">2. Controls (Mobile):</p>
              <p>Swipe up, down, left, or right to move the tiles.</p>
              <p>When two tiles with the same number touch, they merge into one with their combined value.</p>
            </div>
            
            <div>
              <p className="font-medium">3. Game Progression:</p>
              <p>After every swipe, a new tile (2 or 4) appears randomly.</p>
              <p>Merged tiles combine only once per move.</p>
              <p>The game ends if no valid moves are left.</p>
            </div>
            
            <div>
              <p className="font-medium">4. Winning:</p>
              <p>Reach the 2048 tile to win the game. Continue playing for a higher score if desired.</p>
            </div>
            
            <div>
              <p className="font-medium">5. Tips:</p>
              <p>Keep your highest tile in a corner.</p>
              <p>Think ahead before swiping to avoid blocking merges.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
