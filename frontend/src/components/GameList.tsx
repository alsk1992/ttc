'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { Users, Clock, Coins, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import { api, ApiError } from '@/lib/api';
import { formatSol, shortenAddress } from '@/lib/solana';
import { GameListItem } from '@/types';

export function GameList() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [games, setGames] = useState<GameListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);

  const fetchGames = async () => {
    if (!connected) return;

    try {
      setIsLoading(true);
      const response = await api.getActiveGames();
      setGames(response.games);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    
    // Refresh games every 30 seconds
    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, [connected]);

  const handleJoinGame = async (gameId: string) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsJoining(gameId);

    try {
      await api.joinGame(gameId, {
        player2: publicKey.toString(),
      });

      toast.success('Successfully joined game!');
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to join game');
      }
    } finally {
      setIsJoining(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Available Games</h2>
        <button
          onClick={fetchGames}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No games available</h3>
          <p className="text-gray-500">Create a new game to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => {
            const canJoin = game.player1 !== publicKey?.toString();
            const isCurrentlyJoining = isJoining === game.id;

            return (
              <div key={game.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">1/2 players</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(game.createdAt)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Player 1:</span>
                    <span className="text-sm font-mono">
                      {shortenAddress(game.player1)}
                    </span>
                  </div>

                  {game.betAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bet Amount:</span>
                      <div className="flex items-center text-sm font-medium text-primary-600">
                        <Coins className="h-3 w-3 mr-1" />
                        {formatSol(game.betAmount, 4)} SOL
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleJoinGame(game.id)}
                  disabled={!canJoin || isCurrentlyJoining}
                  className={clsx(
                    'w-full py-2 px-4 rounded-md text-sm font-medium transition-colors',
                    canJoin && !isCurrentlyJoining
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {isCurrentlyJoining ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Joining...
                    </div>
                  ) : !canJoin ? (
                    'Your Game'
                  ) : (
                    'Join Game'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}