import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PlayerStats } from '@/types';
import { api } from '@/lib/api';

export function usePlayerStats() {
  const { publicKey, connected } = useWallet();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!connected || !publicKey) {
        setStats(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.getPlayerGames(publicKey.toString());
        setStats(response.stats);
      } catch (err) {
        console.error('Error fetching player stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [connected, publicKey]);

  return { stats, isLoading, error };
}