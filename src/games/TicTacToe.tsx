
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types';

interface TicTacToeProps {
  p1Name?: string;
  p2Name?: string;
  isMultiplayerOverride?: boolean;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ p1Name, p2Name, isMultiplayerOverride }) => {
  const { state, dispatch } = useGameContext();
  // Corrected destructuring for difficulty and isMultiplayer
  const { gameSettings, activeProfileId, profiles } = state;
  const { difficulty: contextDifficulty, isMultiplayer: contextIsMultiplayer } = gameSettings;
  
  // Determine actual isMultiplayer state
  const actualIsMultiplayer = typeof isMultiplayerOverride === 'boolean' 
                              ? isMultiplayerOverride 
                              : contextIsMultiplayer;
  
  // Determine player names
  const player1ActualName = p1Name || profiles.find(p => p.id === activeProfileId)?.name || "Player X";
  const player2ActualName = actualIsMultiplayer ? (p2Name || "Player O") : "AI";

  // Game state
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // X is always the first player
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
    // Return if there's a winner or the square is already filled or if it's AI's turn in single player
    if (winner || board[index] || (!actualIsMultiplayer && !isXNext)) {
      return;
    }
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O'; // 'X' is player 1, 'O' is player 2 or AI
    setBoard(newBoard);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      
      if (activeProfileId) {
        const winnerName = gameWinner === 'X' ? player1ActualName : player2ActualName;
        if (gameWinner === 'X' || gameWinner === 'O') {
          // Only add score if Player X (human) wins in single player, or any player wins in multiplayer
          const shouldAddScore = actualIsMultiplayer || (!actualIsMultiplayer && gameWinner === 'X');
          if (shouldAddScore) {
            const score = 10; // Simplified score
            dispatch({
              type: 'ADD_SCORE',
              payload: {
                userId: activeProfileId,
                gameId: 'tictactoe',
                score,
                difficulty: contextDifficulty as GameDifficulty, // Use context difficulty for scoring
                date: new Date(),
              },
            });
          }
          
          toast({
            title: `${winnerName} Wins!`,
            description: `${winnerName} has won the game.`,
          });
        } else if (gameWinner === 'draw') {
          toast({
            title: "It's a Draw!",
            description: "The game ended in a draw.",
          });
        }
      }
      
      return;
    }
    
    setIsXNext(!isXNext);
    
    // If playing against AI, there's no winner, and it was X's turn (so now it's AI's turn)
    if (!actualIsMultiplayer && !gameWinner && isXNext) { 
      setTimeout(() => makeAIMove(newBoard), 500);
    }
  };
  
  // AI logic
  const makeAIMove = (currentBoard: Array<string | null>) => {
    if (calculateWinner(currentBoard) || !isXNext) return; // AI moves only if it's 'O's turn
    
    let move: number;
    
    switch (contextDifficulty) { // AI difficulty from context
      case GameDifficulty.HARD:
        move = getBestMove(currentBoard, 'O'); // AI is 'O'
        break;
      case GameDifficulty.MEDIUM:
        move = Math.random() < 0.7 ? getBestMove(currentBoard, 'O') : getRandomMove(currentBoard);
        break;
      case GameDifficulty.EASY:
      default:
        move = getRandomMove(currentBoard);
        break;
    }
    
    if (move !== -1) {
      const newBoard = [...currentBoard];
      newBoard[move] = 'O'; // AI plays as 'O'
      setBoard(newBoard);
      
      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        const winnerName = gameWinner === 'X' ? player1ActualName : (gameWinner === 'O' ? player2ActualName : "Draw");

        if (gameWinner === 'X' || gameWinner === 'O') {
            // Single Player Mode:
            // If player 1 (user) wins: show “You won!”
            // If player 2 (AI) wins: show “AI won.”
            // Multiplayer Mode:
            // Display result as: “<Player Name> won!”
            let toastTitle: string;
            let toastDescription: string;

            if (actualIsMultiplayer) {
                toastTitle = `${winnerName} Wins!`;
                toastDescription = `${winnerName} has won the game.`;
            } else { // Single player
                if (gameWinner === 'X') { // Player (User) wins
                    toastTitle = "You Won!";
                    toastDescription = "Congratulations, you beat the AI!";
                } else { // AI wins
                    toastTitle = "AI Won";
                    toastDescription = "The AI has won the game.";
                }
            }
            toast({
              title: toastTitle,
              description: toastDescription,
            });
          } else if (gameWinner === 'draw') {
            toast({
              title: "It's a Draw!",
              description: "The game ended in a draw.",
            });
          }
      }
      setIsXNext(true); // Switch back to player X's turn
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
  const getBestMove = (currentBoard: Array<string | null>, player: 'X' | 'O'): number => {
    let bestScore = player === 'O' ? -Infinity : Infinity; // AI ('O') maximizes, Human ('X') minimizes for AI's perspective
    let bestMove = -1;
    
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = player;
        const score = minimax(currentBoard, 0, player === 'X'); // If current player is 'X', next is 'O' (maximizing for AI)
        currentBoard[i] = null;
        
        if (player === 'O') { // AI is 'O', wants to maximize score
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        } else { // Hypothetically, if 'X' was using minimax (minimizing for AI's perspective)
          if (score < bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
    }
    return bestMove;
  };
  
  const minimax = (
    currentBoard: Array<string | null>,
    depth: number,
    isMaximizingPlayer: boolean // True if it's AI 'O's turn to maximize its score
  ): number => {
    const gameWinner = calculateWinner(currentBoard);
    
    if (gameWinner === 'O') return 10 - depth; // AI 'O' wins
    if (gameWinner === 'X') return depth - 10; // Player 'X' wins
    if (gameWinner === 'draw') return 0;
    
    if (isMaximizingPlayer) { // AI 'O' is maximizing
      let bestScore = -Infinity;
      for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          bestScore = Math.max(bestScore, minimax(currentBoard, depth + 1, false));
          currentBoard[i] = null;
        }
      }
      return bestScore;
    } else { // Player 'X' is minimizing (from AI's perspective)
      let bestScore = Infinity;
      for (let i = 0; i < currentBoard.length; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          bestScore = Math.min(bestScore, minimax(currentBoard, depth + 1, true));
          currentBoard[i] = null;
        }
      }
      return bestScore;
    }
  };
  
  // Render each square
  const renderSquare = (index: number) => {
    const value = board[index];
    const boxSize = 'w-20 h-20 md:w-24 md:h-24'; // Responsive box size
    const textSize = 'text-3xl md:text-4xl'; // Responsive text size
    
    return (
      <button
        onClick={() => handleClick(index)}
        className={`flex items-center justify-center font-bold border-2 rounded-lg m-1
          ${boxSize} ${textSize}
          ${value === 'X' ? 'text-tictactoe-accent' : value === 'O' ? 'text-tictactoe-primary' : 'text-foreground'}
          ${winner || (!actualIsMultiplayer && !isXNext) ? 'cursor-not-allowed bg-muted/50' : 'hover:bg-muted active:scale-95'}
          transition-all duration-150 ease-in-out shadow-md hover:shadow-lg border-border
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
        disabled={!!winner || (!actualIsMultiplayer && !isXNext)}
        aria-label={`Square ${index + 1}, ${value ? `Player ${value}` : 'Empty'}`}
      >
        {value}
      </button>
    );
  };
  
  // Display game status
  const renderStatus = () => {
    if (winner) {
      if (winner === 'draw') return "Game ended in a draw!";
      // Use actual names for win message
      const winnerDisplayName = winner === 'X' ? player1ActualName : player2ActualName;
      
      // Refined win messages based on game mode
      if (!actualIsMultiplayer) { // Single player
        return winner === 'X' ? "You Won!" : "AI Won";
      }
      // Multiplayer
      return `Winner: ${winnerDisplayName}`;

    } else {
      const nextPlayerName = isXNext ? player1ActualName : player2ActualName;
      return `Next player: ${nextPlayerName} (${isXNext ? 'X' : 'O'})`;
    }
  };

  // Start a new game when difficulty or multiplayer mode from context/override changes
  useEffect(() => {
    resetGame();
  }, [contextDifficulty, actualIsMultiplayer]); // Use actualIsMultiplayer and contextDifficulty
  
  return (
    <div className="flex flex-col h-full p-2 sm:p-4 bg-background items-center justify-center">
      <div className="w-full max-w-md text-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold mb-2">{renderStatus()}</h2>
        <Button onClick={resetGame} className="w-full sm:w-auto">New Game</Button>
      </div>
      
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md shadow-xl border-border">
        <CardContent className="grid grid-cols-3 gap-1 p-2 bg-card rounded-lg">
          {board.map((_, index) => (
            <div key={index}>{renderSquare(index)}</div>
          ))}
        </CardContent>
      </Card>
      <div className="mt-6 text-sm text-muted-foreground text-center">
        Player X: {player1ActualName} | Player O: {player2ActualName}
      </div>
       {/* Footer space */}
      <div className="h-12 flex-shrink-0"></div>
    </div>
  );
};

export default TicTacToe;
