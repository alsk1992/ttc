'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { Users, Clock, Coins, RefreshCw, Search, Filter, Trophy, Zap } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBetType, setFilterBetType] = useState<'all' | 'free' | 'paid'>('all');
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredGames = useMemo(() => {
    let filtered = games;
    
    // Filter by bet type
    if (filterBetType === 'free') {
      filtered = filtered.filter(game => game.betAmount === 0);
    } else if (filterBetType === 'paid') {
      filtered = filtered.filter(game => game.betAmount > 0);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((game) => {
        const player1Lower = game.player1.toLowerCase();
        const betAmount = formatSol(game.betAmount, 4);
        
        return (
          player1Lower.includes(searchLower) ||
          betAmount.includes(searchLower) ||
          game.id.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filtered;
  }, [games, searchTerm, filterBetType]);

  if (!connected) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Available Games</h2>
            <p className="text-sm text-gray-400 mt-1">
              {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} available
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by address or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={fetchGames}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Bet Type:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterBetType('all')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      filterBetType === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    All Games
                  </button>
                  <button
                    onClick={() => setFilterBetType('free')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                      filterBetType === 'free'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    Free
                  </button>
                  <button
                    onClick={() => setFilterBetType('paid')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                      filterBetType === 'paid'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Trophy className="h-3 w-3" />
                    With Bet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          {searchTerm.trim() || filterBetType !== 'all' ? (
            <>
              <h3 className="text-lg font-medium text-gray-200 mb-2">No games found</h3>
              <p className="text-gray-400">
                No games match your filters
                {searchTerm.trim() && ` for "${searchTerm}"`}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterBetType('all');
                }}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300 underline"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-200 mb-2">No games available</h3>
              <p className="text-gray-400">Create a new game to get started!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => {
            const canJoin = game.player1 !== publicKey?.toString();
            const isCurrentlyJoining = isJoining === game.id;

            return (
              <div key={game.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 animate-fade-in group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-400">1/2 players</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(game.createdAt)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Player 1:</span>
                    <span className="text-sm font-mono text-gray-300">
                      {shortenAddress(game.player1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Bet Amount:</span>
                    {game.betAmount > 0 ? (
                      <div className="flex items-center text-sm font-medium text-yellow-400">
                        <Coins className="h-3 w-3 mr-1" />
                        {formatSol(game.betAmount, 4)} SOL
                      </div>
                    ) : (
                      <div className="flex items-center text-sm font-medium text-green-400">
                        <Zap className="h-3 w-3 mr-1" />
                        Free Game
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinGame(game.id)}
                  disabled={!canJoin || isCurrentlyJoining}
                  className={clsx(
                    'w-full py-2 px-4 rounded-lg text-sm font-medium transition-all',
                    canJoin && !isCurrentlyJoining
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
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