import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair
} from '@solana/web3.js';
import { TREASURY_CONFIG, calculatePayouts } from '../config/treasury';
import { GameState } from '../types';

// Initialize connection to Solana
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Game wallet keypair - this should be loaded from environment
// This wallet holds funds during games and processes payouts
const getGameWallet = (): Keypair => {
  if (!process.env.GAME_WALLET_PRIVATE_KEY) {
    throw new Error('GAME_WALLET_PRIVATE_KEY not set in environment');
  }
  
  const privateKey = JSON.parse(process.env.GAME_WALLET_PRIVATE_KEY);
  return Keypair.fromSecretKey(Uint8Array.from(privateKey));
};

// Process game completion and handle payouts
export async function processGamePayout(game: GameState): Promise<{
  success: boolean;
  txSignature?: string;
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
    const isWin = game.winner && game.winner !== 'draw';
    const isDraw = game.winner === 'draw';
    
    // Calculate payouts
    const payouts = calculatePayouts(game.betAmount, isWin, isDraw);
    
    // Create transaction
    const transaction = new Transaction();
    
    // Add treasury fee transfer if applicable
    if (payouts.treasuryFee > 0 && TREASURY_CONFIG.TREASURY_WALLET !== 'YOUR_TREASURY_WALLET_ADDRESS_HERE') {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: gameWallet.publicKey,
          toPubkey: new PublicKey(TREASURY_CONFIG.TREASURY_WALLET),
          lamports: payouts.treasuryFee,
        })
      );
      
      console.log(`Treasury fee: ${payouts.treasuryFee / 1e9} SOL`);
    }
    
    // Handle winner payout
    if (isWin && payouts.winnerPayout) {
      const winnerAddress = game.winner === 'X' ? game.player1 : game.player2!;
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: gameWallet.publicKey,
          toPubkey: new PublicKey(winnerAddress),
          lamports: payouts.winnerPayout,
        })
      );
      
      console.log(`Winner payout: ${payouts.winnerPayout / 1e9} SOL to ${winnerAddress}`);
    }
    
    // Handle draw refunds
    if (isDraw && payouts.player1Refund && payouts.player2Refund) {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: gameWallet.publicKey,
          toPubkey: new PublicKey(game.player1),
          lamports: payouts.player1Refund,
        })
      );
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: gameWallet.publicKey,
          toPubkey: new PublicKey(game.player2!),
          lamports: payouts.player2Refund,
        })
      );
      
      console.log(`Draw refunds: ${payouts.player1Refund / 1e9} SOL each`);
    }
    
    // Send transaction
    const txSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [gameWallet],
      {
        commitment: 'confirmed',
      }
    );
    
    console.log(`Payout transaction confirmed: ${txSignature}`);
    
    return {
      success: true,
      txSignature,
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
export async function getGameWalletBalance(): Promise<number> {
  try {
    const gameWallet = getGameWallet();
    const balance = await connection.getBalance(gameWallet.publicKey);
    return balance;
  } catch (error) {
    console.error('Error getting game wallet balance:', error);
    return 0;
  }
}

// Get treasury wallet balance
export async function getTreasuryBalance(): Promise<number> {
  try {
    if (TREASURY_CONFIG.TREASURY_WALLET === 'YOUR_TREASURY_WALLET_ADDRESS_HERE') {
      return 0;
    }
    
    const balance = await connection.getBalance(
      new PublicKey(TREASURY_CONFIG.TREASURY_WALLET)
    );
    return balance;
  } catch (error) {
    console.error('Error getting treasury balance:', error);
    return 0;
  }
}