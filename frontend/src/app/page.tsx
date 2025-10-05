'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Plus, Users, Trophy, Clock } from 'lucide-react';

import { GameList } from '@/components/GameList';
import { CreateGameModal } from '@/components/CreateGameModal';
import { StatsCard } from '@/components/StatsCard';
import { usePlayerStats } from '@/hooks/usePlayerStats';

export default function HomePage() {
  const { publicKey, connected } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { stats, isLoading: statsLoading } = usePlayerStats();

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gradient mb-4">
              Solana Tic-Tac-Toe
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Play classic tic-tac-toe on the Solana blockchain with optional SOL betting. 
              Connect your wallet to start playing!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="card p-6 text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multiplayer</h3>
              <p className="text-gray-600">Play against other players in real-time</p>
            </div>
            
            <div className="card p-6 text-center">
              <Trophy className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">SOL Betting</h3>
              <p className="text-gray-600">Optional betting with Solana tokens</p>
            </div>
            
            <div className="card p-6 text-center">
              <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time</h3>
              <p className="text-gray-600">Instant moves with WebSocket updates</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-600">Connect your Solana wallet to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Game Lobby</h1>
            <p className="text-gray-600 mt-1">
              Create a new game or join an existing one
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Game
          </button>
        </div>

        {/* Player Stats */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Games Played"
              value={stats.gamesPlayed}
              icon={<Users className="h-5 w-5" />}
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
              value={`${(stats.totalEarnings / 1e9).toFixed(2)} SOL`}
              icon={<Trophy className="h-5 w-5" />}
              color="yellow"
            />
          </div>
        )}
      </div>

      {/* Game List */}
      <GameList />

      {/* Create Game Modal */}
      <CreateGameModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}