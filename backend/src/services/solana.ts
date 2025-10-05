import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';

let connection: Connection;
let programId: PublicKey;

export function initializeSolana() {
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet');
  connection = new Connection(rpcUrl, 'confirmed');
  
  const programIdString = process.env.PROGRAM_ID || '3eYvFqyMAYiKZ3cYKQtQ8cSwFwrSqUKgbQDUWLj2QVnT';
  programId = new PublicKey(programIdString);
  
  console.log(`Connected to Solana ${rpcUrl}`);
  console.log(`Program ID: ${programId.toString()}`);
}

export async function getGamePDA(gameId: string): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('game'), Buffer.from(gameId)],
    programId
  );
}

export async function getGameAccountInfo(gameId: string) {
  try {
    const [gamePDA] = await getGamePDA(gameId);
    const accountInfo = await connection.getAccountInfo(gamePDA);
    return accountInfo;
  } catch (error) {
    console.error('Error fetching game account:', error);
    return null;
  }
}

export function getConnection(): Connection {
  return connection;
}

export function getProgramId(): PublicKey {
  return programId;
}

initializeSolana();