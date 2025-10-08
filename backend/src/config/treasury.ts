// Treasury configuration
export const TREASURY_CONFIG = {
  // Treasury wallet address - UPDATE THIS with your actual treasury wallet
  TREASURY_WALLET: 'YOUR_TREASURY_WALLET_ADDRESS_HERE',
  
  // Fee percentages
  WIN_FEE_PERCENT: 3,     // 3% fee on wins
  DRAW_FEE_PERCENT: 1,    // 1% fee on draws
  
  // Minimum bet amount to charge fees (in lamports)
  // Below this amount, no fees are charged to avoid dust
  MIN_BET_FOR_FEES: 0.01 * 1e9, // 0.01 SOL
};

// Calculate treasury fee
export function calculateTreasuryFee(betAmount: number, isWin: boolean): number {
  if (betAmount < TREASURY_CONFIG.MIN_BET_FOR_FEES) {
    return 0; // No fees on very small bets
  }
  
  const totalPot = betAmount * 2;
  const feePercent = isWin ? TREASURY_CONFIG.WIN_FEE_PERCENT : TREASURY_CONFIG.DRAW_FEE_PERCENT;
  return Math.floor(totalPot * feePercent / 100);
}

// Calculate player payouts after fees
export function calculatePayouts(betAmount: number, isWin: boolean, isDraw: boolean): {
  treasuryFee: number;
  winnerPayout?: number;
  player1Refund?: number;
  player2Refund?: number;
} {
  const totalPot = betAmount * 2;
  const treasuryFee = calculateTreasuryFee(betAmount, isWin);
  
  if (isWin) {
    return {
      treasuryFee,
      winnerPayout: totalPot - treasuryFee,
    };
  } else if (isDraw) {
    const remainingAfterFee = totalPot - treasuryFee;
    const perPlayerRefund = Math.floor(remainingAfterFee / 2);
    return {
      treasuryFee,
      player1Refund: perPlayerRefund,
      player2Refund: perPlayerRefund,
    };
  }
  
  return { treasuryFee: 0 };
}