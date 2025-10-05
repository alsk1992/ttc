import { z } from 'zod';

export const createGameSchema = z.object({
  player1: z.string().min(32, 'Invalid wallet address'),
  betAmount: z.number().min(0, 'Bet amount must be non-negative')
});

export const joinGameSchema = z.object({
  player2: z.string().min(32, 'Invalid wallet address')
});

export const makeMoveSchema = z.object({
  player: z.string().min(32, 'Invalid wallet address'),
  position: z.number().min(0).max(8, 'Position must be between 0 and 8')
});

export function validateGameId(gameId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(gameId) && gameId.length >= 3 && gameId.length <= 50;
}

export function validateWalletAddress(address: string): boolean {
  try {
    return address.length >= 32 && address.length <= 44;
  } catch {
    return false;
  }
}