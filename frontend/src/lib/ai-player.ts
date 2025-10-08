// AI Player for Tic-Tac-Toe Practice Mode

export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameBoard {
  board: (string | null)[];
  currentTurn: 'X' | 'O';
}

// Check if a player can win with one more move
function findWinningMove(board: (string | null)[], player: 'X' | 'O'): number | null {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const positions = [board[a], board[b], board[c]];
    const playerCount = positions.filter(p => p === player).length;
    const emptyCount = positions.filter(p => p === null).length;

    // If player has 2 in the pattern and 1 empty, they can win
    if (playerCount === 2 && emptyCount === 1) {
      // Find the empty position
      if (board[a] === null) return a;
      if (board[b] === null) return b;
      if (board[c] === null) return c;
    }
  }

  return null;
}

// Minimax algorithm for perfect play
function minimax(
  board: (string | null)[],
  depth: number,
  isMaximizing: boolean,
  aiPlayer: 'X' | 'O',
  humanPlayer: 'X' | 'O'
): number {
  const winner = checkWinner(board);
  
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const score = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
        board[i] = null;
        maxEval = Math.max(maxEval, score);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const score = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
        board[i] = null;
        minEval = Math.min(minEval, score);
      }
    }
    return minEval;
  }
}

function checkWinner(board: (string | null)[]): 'X' | 'O' | null {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as 'X' | 'O';
    }
  }

  return null;
}

function isBoardFull(board: (string | null)[]): boolean {
  return board.every(cell => cell !== null);
}

// Get all empty positions
function getEmptyPositions(board: (string | null)[]): number[] {
  return board.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
}

// AI move selection based on difficulty
export function getAIMove(
  board: (string | null)[],
  aiPlayer: 'X' | 'O',
  difficulty: Difficulty
): number {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const emptyPositions = getEmptyPositions(board);

  if (emptyPositions.length === 0) {
    throw new Error('No valid moves available');
  }

  // Easy mode: 70% random, 30% smart
  if (difficulty === 'easy') {
    if (Math.random() < 0.7) {
      // Random move
      return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    }
    // Otherwise fall through to medium logic
  }

  // Medium mode: Block wins, take wins, otherwise random
  if (difficulty === 'easy' || difficulty === 'medium') {
    // Check if AI can win
    const winMove = findWinningMove(board, aiPlayer);
    if (winMove !== null) return winMove;

    // Check if need to block human
    const blockMove = findWinningMove(board, humanPlayer);
    if (blockMove !== null) return blockMove;

    // For medium, prefer center and corners
    if (difficulty === 'medium') {
      const preferredMoves = [4, 0, 2, 6, 8]; // center, then corners
      for (const move of preferredMoves) {
        if (board[move] === null) return move;
      }
    }

    // Random move from remaining
    return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  }

  // Hard mode: Use minimax for perfect play
  if (difficulty === 'hard') {
    let bestMove = -1;
    let bestEval = -Infinity;

    for (const position of emptyPositions) {
      board[position] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer, humanPlayer);
      board[position] = null;

      if (score > bestEval) {
        bestEval = score;
        bestMove = position;
      }
    }

    return bestMove;
  }

  // Fallback (should never reach here)
  return emptyPositions[0];
}

// Add some personality to the AI with delays
export function getAIThinkingTime(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 500 + Math.random() * 1000; // 0.5-1.5s
    case 'medium':
      return 800 + Math.random() * 1200; // 0.8-2s
    case 'hard':
      return 1000 + Math.random() * 1500; // 1-2.5s
    default:
      return 1000;
  }
}