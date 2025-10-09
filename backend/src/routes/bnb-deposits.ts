import express from 'express';
import { z } from 'zod';
import { createError } from '../utils/errors';
import { validateGameId } from '../utils/validation';
import { getGameWallet, verifyDeposit, getEscrowInstructions } from '../services/payouts-bnb';
import * as db from '../services/database';

const router = express.Router();

// Schema for deposit verification
const verifyDepositSchema = z.object({
  gameId: z.string().min(1),
  player: z.string().regex(/^0x[a-fA-F0-9]{40}$/), // Ethereum address format
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/), // Transaction hash format
});

// Get escrow deposit instructions
router.get('/instructions/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    
    if (!validateGameId(gameId)) {
      return next(createError('Invalid game ID format', 400));
    }
    
    const game = await db.getGame(gameId);
    if (!game) {
      return next(createError('Game not found', 404));
    }
    
    const instructions = getEscrowInstructions(gameId, BigInt(game.betAmount));
    
    res.json({
      success: true,
      instructions,
      betAmount: game.betAmount,
      status: game.status,
      player1Deposited: game.player1Deposited || false,
      player2Deposited: game.player2 ? (game.player2Deposited || false) : null,
    });
  } catch (error) {
    next(error);
  }
});

// Verify deposit and update game state
router.post('/verify', async (req, res, next) => {
  try {
    const { gameId, player, txHash } = verifyDepositSchema.parse(req.body);
    
    const game = await db.getGame(gameId);
    if (!game) {
      return next(createError('Game not found', 404));
    }
    
    // Determine if this is player 1 or player 2
    const isPlayer1 = game.player1.toLowerCase() === player.toLowerCase();
    const isPlayer2 = game.player2?.toLowerCase() === player.toLowerCase();
    
    if (!isPlayer1 && !isPlayer2) {
      return next(createError('Player not in this game', 403));
    }
    
    // Check if already deposited
    if (isPlayer1 && game.player1Deposited) {
      return next(createError('Player 1 already deposited', 400));
    }
    if (isPlayer2 && game.player2Deposited) {
      return next(createError('Player 2 already deposited', 400));
    }
    
    // Verify the deposit transaction
    const isValid = await verifyDeposit(player, BigInt(game.betAmount), txHash);
    if (!isValid) {
      return next(createError('Invalid deposit transaction', 400));
    }
    
    // Update game state
    const updates: any = {};
    if (isPlayer1) {
      updates.player1Deposited = true;
      updates.player1TxHash = txHash;
    } else {
      updates.player2Deposited = true;
      updates.player2TxHash = txHash;
    }
    
    // If both players have deposited and game is waiting, make it active
    if (game.player2 && 
        ((isPlayer1 && game.player2Deposited) || 
         (isPlayer2 && game.player1Deposited))) {
      updates.status = 'active';
    }
    
    const updatedGame = await db.updateGame(gameId, updates);
    
    res.json({
      success: true,
      message: 'Deposit verified successfully',
      game: updatedGame,
      gameActive: updates.status === 'active',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createError('Invalid request data: ' + error.errors.map(e => e.message).join(', '), 400));
    }
    next(error);
  }
});

// Get game wallet address (public endpoint)
router.get('/wallet-address', async (req, res, next) => {
  try {
    const gameWallet = getGameWallet();
    
    res.json({
      success: true,
      address: gameWallet.address,
      network: 'BSC Mainnet',
      instructions: {
        en: 'Send exact bet amount to this address to join game',
        zh: '发送准确的下注金额到此地址加入游戏'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;