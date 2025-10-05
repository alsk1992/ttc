'use client';

import { Trophy, Clock, Users, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

import { GameState } from '@/types';

interface GameStatusProps {
  game: GameState;
  isPlayerInGame: boolean;
  playerSymbol: 'X' | 'O' | null;
}

export function GameStatus({ game, isPlayerInGame, playerSymbol }: GameStatusProps) {
  const getStatusIcon = () => {
    switch (game.status) {
      case 'waiting':
        return <Clock className="h-5 w-5" />;
      case 'active':
        return <Users className="h-5 w-5" />;
      case 'completed':
        return <Trophy className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (game.status) {
      case 'waiting':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'active':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusMessage = () => {
    switch (game.status) {
      case 'waiting':
        return 'Waiting for second player to join';
      case 'active':
        if (game.currentTurn === playerSymbol) {
          return "It's your turn!";
        } else if (isPlayerInGame) {
          return "Waiting for opponent's move";
        } else {
          return `${game.currentTurn}'s turn`;
        }
      case 'completed':
        if (game.winner === 'draw') {
          return 'Game ended in a draw';
        } else if (game.winner === playerSymbol) {
          return 'You won! 🎉';
        } else if (isPlayerInGame) {
          return 'You lost 😢';
        } else {
          return `${game.winner} won the game`;
        }
      default:
        return 'Unknown game status';
    }
  };

  const getWinnerMessage = () => {
    if (game.status !== 'completed') return null;

    if (game.winner === 'draw') {
      return (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700">
            {game.betAmount > 0 
              ? 'Bets have been returned to both players.' 
              : 'No one wins this round.'
            }
          </p>
        </div>
      );
    }

    const isWinner = game.winner === playerSymbol;
    const winnerIsPlayer1 = game.winner === 'X';
    
    return (
      <div className={clsx(
        'mt-3 p-3 border rounded-md',
        isWinner 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      )}>
        <p className={clsx(
          'text-sm font-medium',
          isWinner ? 'text-green-800' : 'text-red-800'
        )}>
          {isWinner ? 'Congratulations!' : 'Better luck next time!'}
        </p>
        {game.betAmount > 0 && (
          <p className={clsx(
            'text-xs mt-1',
            isWinner ? 'text-green-700' : 'text-red-700'
          )}>
            {isWinner 
              ? `You won ${(game.betAmount * 2 / 1e9).toFixed(4)} SOL!`
              : `${winnerIsPlayer1 ? 'Player 1' : 'Player 2'} won ${(game.betAmount * 2 / 1e9).toFixed(4)} SOL.`
            }
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Status</h3>
      
      <div className={clsx(
        'flex items-center p-3 border rounded-md',
        getStatusColor()
      )}>
        {getStatusIcon()}
        <span className="ml-3 font-medium">{getStatusMessage()}</span>
      </div>

      {getWinnerMessage()}

      {/* Game progress indicator */}
      {game.status === 'active' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Move {game.board.filter(cell => cell !== null).length + 1} of 9</span>
            <span>Turn: {game.currentTurn}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(game.board.filter(cell => cell !== null).length / 9) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}