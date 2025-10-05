'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { History, Trophy, Coins, Calendar, Eye, RefreshCw } from 'lucide-react';

import { api } from '@/lib/api';
import { formatSol, shortenAddress } from '@/lib/solana';
import { GameState, PlayerStats } from '@/types';
import { StatsCard } from '@/components/StatsCard';

export default function HistoryPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [games, setGames] = useState<GameState[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlayerData = async () => {
    if (!connected || !publicKey) return;

    try {
      setIsLoading(true);
      const response = await api.getPlayerGames(publicKey.toString());
      setGames(response.games);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching player data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [connected, publicKey]);

  const getGameResult = (game: GameState) => {
    if (game.status !== 'completed') return 'In Progress';
    
    const isPlayer1 = game.player1 === publicKey?.toString();
    const isPlayer2 = game.player2 === publicKey?.toString();
    
    if (game.winner === 'draw') return 'Draw';
    
    if ((game.winner === 'X' && isPlayer1) || (game.winner === 'O' && isPlayer2)) {
      return 'Won';
    }
    
    return 'Lost';
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Won':
        return 'text-green-600 bg-green-50';
      case 'Lost':
        return 'text-red-600 bg-red-50';
      case 'Draw':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Game History</h1>
          <p className="text-gray-600">Connect your wallet to view your game history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Game History</h1>
          <p className="text-gray-600 mt-1">
            Your tic-tac-toe game history and statistics
          </p>
        </div>
        
        <button
          onClick={fetchPlayerData}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Player Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Games Played"
            value={stats.gamesPlayed}
            icon={<History className="h-5 w-5" />}
            color="blue"
          />
          <StatsCard
            title="Games Won"
            value={stats.gamesWon}
            icon={<Trophy className="h-5 w-5" />}
            color="green"
          />
          <StatsCard
            title="Win Rate"
            value={stats.gamesPlayed > 0 ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` : '0%'}
            icon={<Trophy className="h-5 w-5" />}
            color="purple"
          />
          <StatsCard
            title="Total Earnings"
            value={`${(stats.totalEarnings / 1e9).toFixed(4)} SOL`}
            icon={<Coins className="h-5 w-5" />}
            color="yellow"
          />
        </div>
      )}

      {/* Games List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Games</h2>
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="p-12 text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games yet</h3>
            <p className="text-gray-500 mb-6">Start playing to see your game history here!</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Play Your First Game
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opponent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bet Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {games.map((game) => {
                  const isPlayer1 = game.player1 === publicKey?.toString();
                  const opponent = isPlayer1 ? game.player2 : game.player1;
                  const result = getGameResult(game);
                  
                  return (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {game.id.slice(0, 8)}...
                          </div>
                          <div className="ml-2 text-xs text-gray-500">
                            ({isPlayer1 ? 'X' : 'O'})
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {opponent ? shortenAddress(opponent) : 'N/A'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(result)}`}>
                          {result}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.betAmount > 0 ? (
                          <div className="flex items-center">
                            <Coins className="h-3 w-3 mr-1 text-gray-400" />
                            {formatSol(game.betAmount, 4)} SOL
                          </div>
                        ) : (
                          'Free'
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(game.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => router.push(`/game/${game.id}`)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}