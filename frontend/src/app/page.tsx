'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Plus, Users, Trophy, Clock, Zap, Shield, Gamepad2 } from 'lucide-react';

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
      <div className="min-h-screen relative overflow-hidden">
        {/* Dark geometric background */}
        <div className="absolute inset-0 bg-[#0a0e27]">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          
          {/* Geometric shapes */}
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-blue-500/20 rounded-lg transform rotate-12 animate-pulse-soft"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-purple-500/20 rounded-full animate-pulse-soft animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border-2 border-pink-500/20 transform -rotate-6 animate-pulse-soft animation-delay-4000"></div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-transparent to-[#0a0e27]/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-full text-blue-400 text-sm mb-8">
                <Zap className="h-4 w-4 mr-2" />
                Powered by Solana blockchain
              </div>
              
              <h1 className="text-7xl md:text-8xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Solana
                </span>
                <br />
                <span className="text-gray-100">Tic-Tac-Toe</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Experience the classic game reimagined on the blockchain.
                <br className="hidden md:block" />
                Challenge players worldwide with optional SOL betting.
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                    <Gamepad2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-4">Play & Earn</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Challenge opponents in real-time matches with optional SOL betting to make every game exciting.
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-4">Secure & Fair</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Smart contracts ensure transparent gameplay and automatic prize distribution.
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-4">Lightning Fast</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Experience instant moves with real-time WebSocket updates and Solana's high-speed network.
                  </p>
                </div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="text-center">
              <div className="inline-flex flex-col items-center">
                <p className="text-xl text-gray-500 mb-8">Ready to play?</p>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative px-8 py-4 bg-gray-900 border border-gray-800 rounded-lg leading-none">
                    <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      Connect Your Wallet to Start Playing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Game Lobby</h1>
            <p className="text-gray-400 mt-2 text-lg">
              Create a new game or join an existing one
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="relative group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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
    </div>
  );
}