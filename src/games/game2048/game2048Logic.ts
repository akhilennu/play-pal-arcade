
export type Board2048 = number[][];

export const initializeBoard2048 = (): Board2048 => {
  const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
  addRandomTileToBoard2048(newBoard); // Modifies in place
  addRandomTileToBoard2048(newBoard); // Modifies in place
  return newBoard;
};

// Modifies board in place and returns true if a tile was added
export const addRandomTileToBoard2048 = (board: Board2048): boolean => {
  const emptyCells: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        emptyCells.push([i, j]);
      }
    }
  }
  if (emptyCells.length > 0) {
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }
  return false;
};

export const isGameOver2048 = (board: Board2048): boolean => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) return false; // Check for empty cells
      // Check for adjacent identical cells
      if (i < 3 && board[i][j] === board[i + 1][j]) return false;
      if (j < 3 && board[i][j] === board[i][j + 1]) return false;
    }
  }
  return true;
};

const transpose = (matrix: Board2048): Board2048 => {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

const processRow = (row: number[]): { newRow: number[], scoreDelta: number, changed: boolean } => {
  let scoreDelta = 0;
  let changed = false;

  // 1. Filter out zeros
  const filteredRow = row.filter(tile => tile !== 0);
  if (filteredRow.length !== row.length) changed = true;

  // 2. Merge identical tiles
  const mergedRow: number[] = [];
  for (let i = 0; i < filteredRow.length; i++) {
    if (i + 1 < filteredRow.length && filteredRow[i] === filteredRow[i + 1]) {
      const mergedValue = filteredRow[i] * 2;
      mergedRow.push(mergedValue);
      scoreDelta += mergedValue;
      i++; // Skip next tile as it's merged
      changed = true;
    } else {
      mergedRow.push(filteredRow[i]);
    }
  }
  
  // 3. Pad with zeros
  const newRow = Array(4).fill(0);
  for (let i = 0; i < mergedRow.length; i++) {
    newRow[i] = mergedRow[i];
  }

  // Check if row actually changed beyond just zero filtering if no merges happened
  if (!changed && !row.every((val, index) => val === newRow[index])) {
    changed = true;
  }
  
  return { newRow, scoreDelta, changed };
};


export const moveLeft2048 = (board: Board2048): { newBoard: Board2048, scoreDelta: number, changed: boolean } => {
  let totalScoreDelta = 0;
  let overallChanged = false;
  const newBoard = board.map(row => {
    const { newRow, scoreDelta, changed } = processRow(row);
    totalScoreDelta += scoreDelta;
    if (changed) overallChanged = true;
    return newRow;
  });
  return { newBoard, scoreDelta: totalScoreDelta, changed: overallChanged };
};

export const moveRight2048 = (board: Board2048): { newBoard: Board2048, scoreDelta: number, changed: boolean } => {
  let totalScoreDelta = 0;
  let overallChanged = false;
  const newBoard = board.map(row => {
    const reversedRow = [...row].reverse();
    const { newRow: processedReversedRow, scoreDelta, changed } = processRow(reversedRow);
    totalScoreDelta += scoreDelta;
    if (changed) overallChanged = true;
    return processedReversedRow.reverse();
  });
  return { newBoard, scoreDelta: totalScoreDelta, changed: overallChanged };
};

export const moveUp2048 = (board: Board2048): { newBoard: Board2048, scoreDelta: number, changed: boolean } => {
  const transposed = transpose(board);
  const { newBoard: movedTransposed, scoreDelta, changed } = moveLeft2048(transposed);
  return { newBoard: transpose(movedTransposed), scoreDelta, changed };
};

export const moveDown2048 = (board: Board2048): { newBoard: Board2048, scoreDelta: number, changed: boolean } => {
  const transposed = transpose(board);
  const { newBoard: movedTransposed, scoreDelta, changed } = moveRight2048(transposed);
  return { newBoard: transpose(movedTransposed), scoreDelta, changed };
};

export type MoveDirection = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';

export const performMove2048 = (board: Board2048, direction: MoveDirection): { newBoard: Board2048, scoreDelta: number, changed: boolean } => {
  switch (direction) {
    case 'ArrowLeft': return moveLeft2048(board);
    case 'ArrowRight': return moveRight2048(board);
    case 'ArrowUp': return moveUp2048(board);
    case 'ArrowDown': return moveDown2048(board);
    default: return { newBoard: board.map(row => [...row]), scoreDelta: 0, changed: false }; // Should not happen
  }
};

