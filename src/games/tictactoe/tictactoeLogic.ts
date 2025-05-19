
import { GameDifficulty } from '@/types';

export type Board = Array<string | null>;
export type Player = 'X' | 'O';

export const calculateWinner = (squares: Board): Player | 'draw' | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a] as Player;
    }
  }
  
  if (squares.every(square => square !== null)) {
    return 'draw';
  }
  
  return null;
};

const getRandomMove = (currentBoard: Board): number => {
  const emptySquares = currentBoard
    .map((square, index) => (square === null ? index : -1))
    .filter(index => index !== -1);
  
  if (emptySquares.length === 0) return -1;
  
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
};

const minimax = (
  currentBoard: Board,
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

const getBestMoveMinimax = (currentBoard: Board, player: Player): number => {
  let bestScore = player === 'O' ? -Infinity : Infinity;
  let move = -1;
  
  for (let i = 0; i < currentBoard.length; i++) {
    if (currentBoard[i] === null) {
      currentBoard[i] = player;
      const score = minimax(currentBoard, 0, player === 'X'); 
      currentBoard[i] = null;
      
      if (player === 'O') {
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
  }
  return move;
};

export const determineAIMove = (board: Board, difficulty: GameDifficulty): number => {
  switch (difficulty) {
    case GameDifficulty.HARD:
      return getBestMoveMinimax(board, 'O'); // AI is 'O'
    case GameDifficulty.MEDIUM:
      return Math.random() < 0.7 ? getBestMoveMinimax(board, 'O') : getRandomMove(board);
    case GameDifficulty.EASY:
    default:
      return getRandomMove(board);
  }
};

