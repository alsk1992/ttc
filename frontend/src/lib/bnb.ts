// BNB Chain constants
export const BNB_DECIMALS = 18;
export const WEI_PER_BNB = 10 ** BNB_DECIMALS;

// Utility functions for BNB
export function weiToBnb(wei: number): number {
  return wei / WEI_PER_BNB;
}

export function bnbToWei(bnb: number): number {
  return Math.floor(bnb * WEI_PER_BNB);
}

export function formatBnb(wei: number, decimals: number = 4): string {
  return weiToBnb(wei).toFixed(decimals);
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

// For compatibility with existing code
export const lamportsToSol = weiToBnb;
export const solToLamports = bnbToWei;
export const formatSol = formatBnb;
export const LAMPORTS_PER_SOL = WEI_PER_BNB;