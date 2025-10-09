'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Menu, X, Home, History, Trophy } from 'lucide-react';

export function Navbar() {
  const { connected, publicKey } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900/90 backdrop-blur-sm shadow-lg border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <span className="ml-2 text-xl font-bold text-gray-100">
                  井字游戏 · TTT
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {connected && (
              <>
                <Link
                  href="/"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  大厅 Lobby
                </Link>
                <Link
                  href="/history"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  <History className="h-4 w-4 mr-2" />
                  历史 History
                </Link>
              </>
            )}
            
            <div className="flex items-center">
              <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 !text-white !font-medium !py-2 !px-4 !rounded-md !text-sm !transition-colors" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700">
            {connected && (
              <>
                <Link
                  href="/"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5 mr-3" />
                  大厅 Lobby
                </Link>
                <Link
                  href="/history"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <History className="h-5 w-5 mr-3" />
                  历史 History
                </Link>
              </>
            )}
            
            <div className="px-3 py-2">
              <WalletMultiButton className="!w-full !bg-primary-600 hover:!bg-primary-700 !text-white !font-medium !py-2 !px-4 !rounded-md !text-sm !transition-colors" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}