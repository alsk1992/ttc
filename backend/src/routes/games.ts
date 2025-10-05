import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import * as db from '../services/database';
import { 
  emitGameUpdate, 
  emitPlayerJoined, 
  emitMoveMade, 
  emitGameCompleted 
} from '../services/websocket';
import { createError } from '../middleware/errorHandler';
import { 
  createGameSchema, 
  joinGameSchema, 
  makeMoveSchema, 
  validateGameId 
} from '../utils/validation';

const router = express.Router();

router.post('/create', async (req, res, next) => {
  try {
    const { player1, betAmount } = createGameSchema.parse(req.body);
    
    const gameId = uuidv4();
    const game = await db.createGame({
      id: gameId,
      player1,
      betAmount
    });

    res.status(201).json({ 
      success: true, 
      game,
      message: 'Game created successfully' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError('Invalid request data: ' + error.errors.map(e => e.message).join(', '), 400));
    }
    next(error);
  }
});

router.get('/active', async (req, res, next) => {
  try {
    const games = await db.getActiveGames();
    res.json({ 
      success: true, 
      games: games.map(game => ({
        id: game.id,
        player1: game.player1,
        betAmount: game.betAmount,
        createdAt: game.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!validateGameId(id)) {
      return next(createError('Invalid game ID format', 400));
    }

    const game = await db.getGame(id);
    
    if (!game) {
      return next(createError('Game not found', 404));
    }

    res.json({ success: true, game });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/join', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { player2 } = joinGameSchema.parse(req.body);
    
    if (!validateGameId(id)) {
      return next(createError('Invalid game ID format', 400));
    }

    const game = await db.getGame(id);
    
    if (!game) {
      return next(createError('Game not found', 404));
    }
    
    if (game.status !== 'waiting') {
      return next(createError('Game is not available to join', 400));
    }
    
    if (game.player2) {
      return next(createError('Game is already full', 400));
    }
    
    if (game.player1 === player2) {
      return next(createError('Cannot join your own game', 400));
    }

    const updatedGame = await db.updateGame(id, {
      player2,
      status: 'active'
    });

    if (!updatedGame) {
      return next(createError('Failed to join game', 500));
    }

    emitPlayerJoined(id, player2);
    emitGameUpdate(id, updatedGame);

    res.json({ 
      success: true, 
      game: updatedGame,
      message: 'Successfully joined game' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError('Invalid request data: ' + error.errors.map(e => e.message).join(', '), 400));
    }
    next(error);
  }
});

router.post('/:id/move', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { player, position } = makeMoveSchema.parse(req.body);
    
    if (!validateGameId(id)) {
      return next(createError('Invalid game ID format', 400));
    }

    const game = await db.getGame(id);
    
    if (!game) {
      return next(createError('Game not found', 404));
    }
    
    if (game.status !== 'active') {
      return next(createError('Game is not active', 400));
    }
    
    if (!game.player2) {
      return next(createError('Waiting for second player', 400));
    }
    
    const currentPlayer = game.currentTurn === 'X' ? game.player1 : game.player2;
    if (player !== currentPlayer) {
      return next(createError('Not your turn', 400));
    }
    
    if (game.board[position] !== null) {
      return next(createError('Position already taken', 400));
    }

    const newBoard = [...game.board];
    newBoard[position] = game.currentTurn;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every(cell => cell !== null);

    const updates: any = {
      board: newBoard,
    };

    if (winner) {
      updates.status = 'completed';
      updates.winner = winner;
    } else if (isDraw) {
      updates.status = 'completed';
      updates.winner = 'draw';
    } else {
      updates.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
    }

    const updatedGame = await db.updateGame(id, updates);

    if (!updatedGame) {
      return next(createError('Failed to make move', 500));
    }

    emitMoveMade(id, { player, position, gameState: updatedGame });

    if (winner || isDraw) {
      emitGameCompleted(id, { winner: winner || 'draw', gameState: updatedGame });
    }

    res.json({ 
      success: true, 
      game: updatedGame,
      message: winner ? `Game won by ${winner}` : isDraw ? 'Game ended in draw' : 'Move made successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError('Invalid request data: ' + error.errors.map(e => e.message).join(', '), 400));
    }
    next(error);
  }
});

router.get('/player/:wallet', async (req, res, next) => {
  try {
    const { wallet } = req.params;
    
    const games = await db.getPlayerGames(wallet);
    const stats = await db.getPlayerStats(wallet);

    res.json({ 
      success: true, 
      games,
      stats
    });
  } catch (error) {
    next(error);
  }
});

function checkWinner(board: (string | null)[]): string | null {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

export default router;