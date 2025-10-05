import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, web3, BN } from '@coral-xyz/anchor';

// Configuration
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('devnet');
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || '3eYvFqyMAYiKZ3cYKQtQ8cSwFwrSqUKgbQDUWLj2QVnT'
);

// Connection
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Utility functions
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function formatSol(lamports: number, decimals: number = 4): string {
  return lamportsToSol(lamports).toFixed(decimals);
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

// Game PDA helpers
export async function getGamePDA(gameId: string): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('game'), Buffer.from(gameId)],
    PROGRAM_ID
  );
}

// Solana wallet balance
export async function getWalletBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

// Program interface types (matching Rust program)
export interface GameAccount {
  player1: PublicKey;
  player2: PublicKey | null;
  currentTurn: { x: {} } | { o: {} };
  status: { active: {} } | { won: {} } | { draw: {} };
  winner: { x: {} } | { o: {} } | null;
  board: (({ x: {} } | { o: {} }) | null)[];
  betAmount: BN;
  gameId: string;
}

// Convert program account data to frontend types
export function convertGameAccount(account: GameAccount): any {
  return {
    player1: account.player1.toString(),
    player2: account.player2?.toString() || null,
    currentTurn: 'x' in account.currentTurn ? 'X' : 'O',
    status: 'active' in account.status ? 'active' : 'won' in account.status ? 'completed' : 'completed',
    winner: account.winner ? ('x' in account.winner ? 'X' : 'O') : null,
    board: account.board.map(cell => {
      if (cell === null) return null;
      return 'x' in cell ? 'X' : 'O';
    }),
    betAmount: account.betAmount.toNumber(),
    gameId: account.gameId,
  };
}

// Get game account from blockchain
export async function getGameAccount(gameId: string): Promise<GameAccount | null> {
  try {
    const [gamePDA] = await getGamePDA(gameId);
    const accountInfo = await connection.getAccountInfo(gamePDA);
    
    if (!accountInfo) {
      return null;
    }

    // Note: In a real implementation, you'd decode the account data using Anchor
    // For now, this is a placeholder
    return null;
  } catch (error) {
    console.error('Error fetching game account:', error);
    return null;
  }
}

// Transaction helpers
export function createTransactionInstruction(
  instruction: string,
  accounts: any[],
  data?: Buffer
): web3.TransactionInstruction {
  // This would create actual program instructions
  // Placeholder for now
  return new web3.TransactionInstruction({
    keys: accounts,
    programId: PROGRAM_ID,
    data: data || Buffer.alloc(0),
  });
}

// Error handling
export class SolanaError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SolanaError';
  }
}