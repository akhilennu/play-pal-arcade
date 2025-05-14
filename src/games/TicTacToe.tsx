
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { v4 as uuidv4 } from 'uuid';
import { GameDifficulty } from '@/types';

const TicTacToe: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const { difficulty, isMultiplayer } = state.gameSettings;
  const { activeProfileId } = state;
  
  // Game state
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  
  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };
  
  // Check for winner
  const calculateWinner = (squares: Array<string | null>): 'X' | 'O' | 'draw' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Check for winner
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a] as 'X' | 'O';
      }
    }
    
    // Check for draw
    if (squares.every(square => square !== null)) {
      return 'draw';
    }
    
    return null;
  };
  
  // Handle click on a square
  const handleClick = (index: number) => {
    // Return if there's a winner or the square is already filled
    if (winner || board[index] || (!isMultiplayer && !isXNext)) {
      return;
    }
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      
      // Update score if game is won
      if (gameWinner !== 'draw' && activeProfileId) {
        const score = gameWinner === 'X' ? 10 : 5;
        dispatch({
          type: 'ADD_SCORE',
          payload: {
            userId: activeProfileId,
            gameId: 'tictactoe',
            score,
            difficulty: difficulty as GameDifficulty,
            date: new Date(),
          },
        });
        
        toast({
          title: gameWinner === 'draw' ? "It's a Draw!" : `${gameWinner} Wins!`,
          description: gameWinner === 'draw' 
            ? "The game ended in a draw." 
            : `Player ${gameWinner} has won the game.`,
        });
      }
      
      return;
    }
    
    setIsXNext(!isXNext);
    
    // If playing against AI and there's no winner yet, make the AI move
    if (!isMultiplayer && !gameWinner) {
      setTimeout(() => makeAIMove(newBoard), 500);
    }
  };
  
  // AI logic
  const makeAIMove = (currentBoard: Array<string | null>) => {
    if (calculateWinner(currentBoard)) return;
    
    let move: number;
    
    switch (difficulty) {
      case GameDifficulty.HARD:
        move = getBestMove(currentBoard);
        break;
      case GameDifficulty.MEDIUM:
        // 70% chance of making the best move, 30% chance of making a random move
        move = Math.random() < 0.7 ? getBestMove(currentBoard) : getRandomMove(currentBoard);
        break;
      case GameDifficulty.EASY:
      default:
        // Make random moves
        move = getRandomMove(currentBoard);
        break;
    }
    
    if (move !== -1) {
      const newBoard = [...currentBoard];
      newBoard[move] = 'O';
      setBoard(newBoard);
      
      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        
        // Update score if AI wins
        if (gameWinner !== 'draw' && activeProfileId) {
          toast({
            title: gameWinner === 'draw' ? "It's a Draw!" : `${gameWinner} Wins!`,
            description: gameWinner === 'draw' 
              ? "The game ended in a draw." 
              : `Player ${gameWinner} has won the game.`,
          });
        }
      }
      
      setIsXNext(true);
    }
  };
  
  // Get random empty square for AI
  const getRandomMove = (currentBoard: Array<string | null>): number => {
    const emptySquares = currentBoard
      .map((square, index) => (square === null ? index : -1))
      .filter(index => index !== -1);
    
    if (emptySquares.length === 0) return -1;
    
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };
  
  // Minimax algorithm for unbeatable AI in hard mode
  const getBestMove = (currentBoard: Array<string | null>): number => {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  };
  
  const minimax = (
    currentBoard: Array<string | null>,
    depth: number,
    isMaximizing: boolean
  ): number => {
    const gameWinner = calculateWinner(currentBoard);
    
    if (gameWinner === 'O') return 10 - depth;
    if (gameWinner === 'X') return depth - 10;
    if (gameWinner === 'draw') return 0;
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      
      for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          bestScore = Math.max(bestScore, score);
        }
      }
      
      return bestScore;
    } else {
      let bestScore = Infinity;
      
      for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          bestScore = Math.min(bestScore, score);
        }
      }
      
      return bestScore;
    }
  };
  
  // Render each square
  const renderSquare = (index: number) => {
    const value = board[index];
    return (
      <button
        onClick={() => handleClick(index)}
        className={`w-full h-24 flex items-center justify-center text-4xl font-bold border-2
          ${value === 'X' ? 'text-tictactoe-accent' : value === 'O' ? 'text-tictactoe-primary' : ''}
          ${winner ? 'cursor-not-allowed' : 'hover:bg-muted'}
          transition-colors duration-200`}
        disabled={!!winner}
      >
        {value}
      </button>
    );
  };
  
  // Display game status
  const renderStatus = () => {
    let status;
    if (winner) {
      status = winner === 'draw'
        ? "Game ended in a draw!"
        : `Winner: ${winner}`;
    } else {
      status = `Next player: ${isXNext ? 'X' : 'O'}`;
    }
    return status;
  };

  // Start a new game when difficulty or multiplayer mode changes
  useEffect(() => {
    resetGame();
  }, [difficulty, isMultiplayer]);
  
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-xl font-bold mb-4 flex justify-between items-center">
        <span>{renderStatus()}</span>
        <Button onClick={resetGame}>New Game</Button>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="grid grid-cols-3 gap-1 p-2">
            {board.map((_, index) => (
              <div key={index}>{renderSquare(index)}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicTacToe;
