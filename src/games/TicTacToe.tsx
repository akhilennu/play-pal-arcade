import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { GameDifficulty } from '@/types';
import { calculateWinner, determineAIMove, Board as TicTacToeBoard } from './tictactoe/tictactoeLogic';

interface TicTacToeProps {
  p1Name?: string;
  p2Name?: string;
  isMultiplayerOverride?: boolean;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ p1Name, p2Name, isMultiplayerOverride }) => {
  const { state, dispatch } = useGameContext();
  const { gameSettings, activeProfileId, profiles } = state;
  const { difficulty: contextDifficulty, isMultiplayer: contextIsMultiplayer } = gameSettings;
  
  const actualIsMultiplayer = typeof isMultiplayerOverride === 'boolean' 
                              ? isMultiplayerOverride 
                              : contextIsMultiplayer;
  
  const player1ActualName = p1Name || profiles.find(p => p.id === activeProfileId)?.name || "Player X";
  const player2ActualName = actualIsMultiplayer ? (p2Name || "Player O") : "AI";

  const [board, setBoard] = useState<TicTacToeBoard>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };
  
  const handleScoreAndToast = (gameWinner: 'X' | 'O' | 'draw') => {
    if (activeProfileId) {
      const winnerName = gameWinner === 'X' ? player1ActualName : player2ActualName;
      if (gameWinner === 'X' || gameWinner === 'O') {
        const shouldAddScore = actualIsMultiplayer || (!actualIsMultiplayer && gameWinner === 'X');
        if (shouldAddScore) {
          const score = 10;
          dispatch({
            type: 'ADD_SCORE',
            payload: {
              userId: activeProfileId,
              gameId: 'tictactoe',
              score,
              difficulty: contextDifficulty as GameDifficulty,
              date: new Date(),
            },
          });
        }
        
        let toastTitle: string;
        let toastDescription: string;
        if (actualIsMultiplayer) {
            toastTitle = `${winnerName} Wins!`;
            toastDescription = `${winnerName} has won the game.`;
        } else { // Single player
            if (gameWinner === 'X') {
                toastTitle = "You Won!";
                toastDescription = "Congratulations, you beat the AI!";
            } else { // AI wins
                toastTitle = "AI Won";
                toastDescription = "The AI has won the game.";
            }
        }
        toast({ title: toastTitle, description: toastDescription });

      } else if (gameWinner === 'draw') {
        toast({ title: "It's a Draw!", description: "The game ended in a draw." });
      }
    }
  };

  const handleClick = (index: number) => {
    if (winner || board[index] || (!actualIsMultiplayer && !isXNext)) {
      return;
    }
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      handleScoreAndToast(gameWinner);
      return;
    }
    
    setIsXNext(!isXNext);
    
    if (!actualIsMultiplayer && !gameWinner && isXNext) { 
      setTimeout(() => makeAIMoveAfterPlayer(newBoard), 500);
    }
  };
  
  const makeAIMoveAfterPlayer = (currentBoard: TicTacToeBoard) => {
    // AI moves only if it's 'O's turn (which is !isXNext logically, but isXNext is true when this is called *after* player X moved)
    // and there is no winner yet.
    if (calculateWinner(currentBoard) || isXNext) { // isXNext is true here means player X just moved. So AI (O) moves.
         // However, the logic for AI making a move expects !isXNext state, so this is a bit confusing.
         // The original logic: if (!actualIsMultiplayer && !gameWinner && isXNext) { setTimeout(() => makeAIMove(newBoard), 500); }
         // This means after X moves (isXNext becomes false, but then it's set true for AI's thinking phase), AI kicks in.
         // Let's simplify: AI moves if it's its turn.
    }
    
    // The board passed to determineAIMove should be the state *before* AI makes its move.
    const aiMoveIndex = determineAIMove(currentBoard, contextDifficulty);
    
    if (aiMoveIndex !== -1 && currentBoard[aiMoveIndex] === null) {
      const newBoardWithAIMove = [...currentBoard];
      newBoardWithAIMove[aiMoveIndex] = 'O'; // AI plays as 'O'
      setBoard(newBoardWithAIMove);
      
      const gameWinner = calculateWinner(newBoardWithAIMove);
      if (gameWinner) {
        setWinner(gameWinner);
        handleScoreAndToast(gameWinner);
      }
      setIsXNext(true); // Switch back to player X's turn
    } else {
      // This case should ideally not happen if there are valid moves.
      // If AI can't make a move and game isn't over, it might be a draw or an issue.
      // For now, we assume determineAIMove returns a valid move if one exists.
    }
  };
  
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
  
  const renderStatus = () => {
    if (winner) {
      if (winner === 'draw') return "Game ended in a draw!";
      const winnerDisplayName = winner === 'X' ? player1ActualName : player2ActualName;
      
      if (!actualIsMultiplayer) {
        return winner === 'X' ? "You Won!" : "AI Won";
      }
      return `Winner: ${winnerDisplayName}`;

    } else {
      const nextPlayerName = isXNext ? player1ActualName : player2ActualName;
      return `Next player: ${nextPlayerName} (${isXNext ? 'X' : 'O'})`;
    }
  };

  useEffect(() => {
    resetGame();
  }, [contextDifficulty, actualIsMultiplayer]);
  
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
