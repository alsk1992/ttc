import express from 'express';
import { TREASURY_CONFIG } from '../config/treasury';
import { getGameWalletBalance, getTreasuryBalance } from '../services/payouts';
import * as db from '../services/database';

const router = express.Router();

// Get treasury stats
router.get('/stats', async (req, res, next) => {
  try {
    // You might want to add authentication here to protect treasury data
    // For now, this is public
    
    const [gameWalletBalance, treasuryBalance] = await Promise.all([
      getGameWalletBalance(),
      getTreasuryBalance(),
    ]);
    
    // Get total fees collected from database
    // This would require adding a treasury_fees table to track all fees
    // For now, we'll calculate from completed games
    
    res.json({
      success: true,
      treasury: {
        wallet: TREASURY_CONFIG.TREASURY_WALLET === 'YOUR_TREASURY_WALLET_ADDRESS_HERE' 
          ? 'Not configured' 
          : TREASURY_CONFIG.TREASURY_WALLET,
        balance: treasuryBalance / 1e9, // Convert to SOL
        config: {
          winFeePercent: TREASURY_CONFIG.WIN_FEE_PERCENT,
          drawFeePercent: TREASURY_CONFIG.DRAW_FEE_PERCENT,
          minBetForFees: TREASURY_CONFIG.MIN_BET_FOR_FEES / 1e9,
        }
      },
      gameWallet: {
        balance: gameWalletBalance / 1e9, // Convert to SOL
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get fee projections
router.get('/projections', async (req, res, next) => {
  try {
    // Get active games with bets
    const activeGames = await db.getActiveGames();
    const gamesWithBets = activeGames.filter(g => g.betAmount > 0);
    
    // Calculate potential fees
    let potentialWinFees = 0;
    let potentialDrawFees = 0;
    let totalPotentialPot = 0;
    
    gamesWithBets.forEach(game => {
      const pot = game.betAmount * 2;
      totalPotentialPot += pot;
      potentialWinFees += pot * TREASURY_CONFIG.WIN_FEE_PERCENT / 100;
      potentialDrawFees += pot * TREASURY_CONFIG.DRAW_FEE_PERCENT / 100;
    });
    
    res.json({
      success: true,
      projections: {
        activeGamesWithBets: gamesWithBets.length,
        totalPotentialPot: totalPotentialPot / 1e9,
        potentialFeesIfAllWin: potentialWinFees / 1e9,
        potentialFeesIfAllDraw: potentialDrawFees / 1e9,
        averagePotentialFee: ((potentialWinFees + potentialDrawFees) / 2) / 1e9,
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;