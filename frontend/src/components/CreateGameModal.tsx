'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { X, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

import { api, ApiError } from '@/lib/api';
import { solToLamports } from '@/lib/bnb';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGameModal({ isOpen, onClose }: CreateGameModalProps) {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [betAmount, setBetAmount] = useState('0');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    const betAmountNum = parseFloat(betAmount);
    if (isNaN(betAmountNum) || betAmountNum < 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    setIsCreating(true);

    try {
      const response = await api.createGame({
        player1: publicKey.toString(),
        betAmount: solToLamports(betAmountNum),
      });

      toast.success('Game created successfully!');
      onClose();
      router.push(`/game/${response.game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create game');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setBetAmount('0');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                创建新游戏 Create New Game
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="betAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    下注金额 Bet Amount (BNB)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Coins className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="betAmount"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      step="0.001"
                      min="0"
                      className="input pl-10"
                      placeholder="0.000"
                      disabled={isCreating}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    设置0为免费游戏 set 0 for free · 双方都需要存入下注金额
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">下注规则 How betting works:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>双方存入下注金额 Both deposit bet amount</li>
                      <li>赢家获得97%奖池 Winner gets 97% (3%平台费)</li>
                      <li>平局：返还99% Draws: 99% back (1%费用)</li>
                      <li>自动安全支付 Automatic secure payouts</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isCreating || !connected}
                    className={`w-full sm:w-auto btn ${
                      isCreating || !connected ? 'btn-disabled' : 'btn-primary'
                    }`}
                  >
                    {isCreating ? '创建中...' : '创建游戏 Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="w-full sm:w-auto btn btn-secondary"
                  >
                    取消 Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}