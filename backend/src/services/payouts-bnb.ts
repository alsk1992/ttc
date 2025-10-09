import { ethers } from 'ethers';
import { TREASURY_CONFIG, calculatePayouts } from '../config/treasury';
import { GameState } from '../types';

// Initialize BNB Chain provider
const getProvider = () => {
  const rpcUrl = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Game wallet - this holds funds during games and processes payouts
export const getGameWallet = (): ethers.Wallet => {
  if (!process.env.GAME_WALLET_PRIVATE_KEY) {
    throw new Error('GAME_WALLET_PRIVATE_KEY not set in environment');
  }
  
  const provider = getProvider();
  return new ethers.Wallet(process.env.GAME_WALLET_PRIVATE_KEY, provider);
};

// Convert BNB to Wei (18 decimals)
const bnbToWei = (bnb: number): bigint => {
  return ethers.parseEther(bnb.toString());
};

// Convert Wei to BNB
const weiToBnb = (wei: bigint): string => {
  return ethers.formatEther(wei);
};

// Process game completion and handle payouts
export async function processGamePayout(game: GameState): Promise<{
  success: boolean;
  txHashes?: string[];
  error?: string;
}> {
  try {
    // Skip if no bet amount
    if (!game.betAmount || game.betAmount === 0) {
      return { success: true };
    }

    // Skip if game not completed
    if (game.status !== 'completed') {
      return { success: false, error: 'Game not completed' };
    }

    const gameWallet = getGameWallet();
    const isWin = !!(game.winner && game.winner !== 'draw');
    const isDraw = game.winner === 'draw';
    
    // Calculate payouts (assuming betAmount is in wei)
    const payouts = calculatePayouts(game.betAmount, isWin, isDraw);
    const txHashes: string[] = [];
    
    // Handle treasury fee
    if (payouts.treasuryFee > 0) {
      const treasuryWallet = TREASURY_CONFIG.TREASURY_WALLET !== 'YOUR_BSC_TREASURY_WALLET_ADDRESS_HERE' 
        ? TREASURY_CONFIG.TREASURY_WALLET 
        : gameWallet.address; // Default to game wallet if not set
      
      // If treasury is same as game wallet, fee stays in wallet (no transfer needed)
      if (treasuryWallet.toLowerCase() !== gameWallet.address.toLowerCase()) {
        console.log(`Sending treasury fee: ${weiToBnb(BigInt(payouts.treasuryFee))} BNB`);
        
        const treasuryTx = await gameWallet.sendTransaction({
          to: treasuryWallet,
          value: BigInt(payouts.treasuryFee)
        });
        
        const treasuryReceipt = await treasuryTx.wait();
        if (treasuryReceipt) {
          txHashes.push(treasuryReceipt.hash);
          console.log(`Treasury fee sent: ${treasuryReceipt.hash}`);
        }
      } else {
        console.log(`Treasury fee ${weiToBnb(BigInt(payouts.treasuryFee))} BNB retained in game wallet`);
      }
    }
    
    // Handle winner payout
    if (isWin && payouts.winnerPayout) {
      const winnerAddress = game.winner === 'X' ? game.player1 : game.player2!;
      
      console.log(`Sending winner payout: ${weiToBnb(BigInt(payouts.winnerPayout))} BNB to ${winnerAddress}`);
      
      const winnerTx = await gameWallet.sendTransaction({
        to: winnerAddress,
        value: BigInt(payouts.winnerPayout)
      });
      
      const winnerReceipt = await winnerTx.wait();
      if (winnerReceipt) {
        txHashes.push(winnerReceipt.hash);
        console.log(`Winner payout sent: ${winnerReceipt.hash}`);
      }
    }
    
    // Handle draw refunds
    if (isDraw && payouts.player1Refund && payouts.player2Refund) {
      console.log(`Sending draw refunds: ${weiToBnb(BigInt(payouts.player1Refund))} BNB each`);
      
      // Player 1 refund
      const p1Tx = await gameWallet.sendTransaction({
        to: game.player1,
        value: BigInt(payouts.player1Refund)
      });
      const p1Receipt = await p1Tx.wait();
      if (p1Receipt) {
        txHashes.push(p1Receipt.hash);
      }
      
      // Player 2 refund
      const p2Tx = await gameWallet.sendTransaction({
        to: game.player2!,
        value: BigInt(payouts.player2Refund)
      });
      const p2Receipt = await p2Tx.wait();
      if (p2Receipt) {
        txHashes.push(p2Receipt.hash);
      }
      
      console.log(`Draw refunds sent: ${txHashes.join(', ')}`);
    }
    
    return {
      success: true,
      txHashes,
    };
    
  } catch (error) {
    console.error('Payout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Check game wallet balance
export async function getGameWalletBalance(): Promise<bigint> {
  try {
    const gameWallet = getGameWallet();
    const provider = gameWallet.provider;
    if (!provider) throw new Error('No provider');
    
    const balance = await provider.getBalance(gameWallet.address);
    return balance;
  } catch (error) {
    console.error('Error getting game wallet balance:', error);
    return BigInt(0);
  }
}

// Get treasury wallet balance
export async function getTreasuryBalance(): Promise<bigint> {
  try {
    if (TREASURY_CONFIG.TREASURY_WALLET === 'YOUR_TREASURY_WALLET_ADDRESS_HERE') {
      return BigInt(0);
    }
    
    const provider = getProvider();
    const balance = await provider.getBalance(TREASURY_CONFIG.TREASURY_WALLET);
    return balance;
  } catch (error) {
    console.error('Error getting treasury balance:', error);
    return BigInt(0);
  }
}

// Escrow functions for player deposits
export async function depositToBscrow(playerAddress: string, amount: bigint, gameId: string): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    // In a real implementation, you would have players send BNB directly to the game wallet
    // This is just a placeholder for the escrow logic
    console.log(`Player ${playerAddress} should deposit ${weiToBnb(amount)} BNB for game ${gameId}`);
    
    // The frontend should handle the actual transaction from player to game wallet
    return {
      success: true,
      txHash: '0x' + '0'.repeat(64), // Placeholder
    };
  } catch (error) {
    console.error('Deposit error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Verify player has made deposit
export async function verifyDeposit(
  playerAddress: string, 
  amount: bigint, 
  txHash: string
): Promise<boolean> {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt || receipt.status !== 1) {
      return false;
    }
    
    // Verify the transaction was to game wallet and amount matches
    const gameWallet = getGameWallet();
    if (receipt.to?.toLowerCase() !== gameWallet.address.toLowerCase()) {
      return false;
    }
    
    // Get transaction details to verify amount
    const tx = await provider.getTransaction(txHash);
    if (!tx || tx.value !== amount) {
      return false;
    }
    
    return tx.from.toLowerCase() === playerAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying deposit:', error);
    return false;
  }
}

// Get escrow instructions for players
export function getEscrowInstructions(gameId: string, betAmount: bigint) {
  const gameWallet = getGameWallet();
  
  return {
    instructions: {
      en: 'Send BNB to game escrow wallet to join',
      zh: '发送BNB到游戏托管钱包加入游戏'
    },
    escrowAddress: gameWallet.address,
    amount: weiToBnb(betAmount),
    network: 'BSC Mainnet',
    gameId: gameId
  };
}