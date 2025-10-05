'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowLeft, Users, Coins, Clock, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

import { api, ApiError } from '@/lib/api';
import { formatSol, shortenAddress } from '@/lib/solana';
import { useWebSocket } from '@/hooks/useWebSocket';
import { GameState } from '@/types';
import { GameBoard } from '@/components/GameBoard';
import { GameStatus } from '@/components/GameStatus';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { joinGame, leaveGame, on, off } = useWebSocket();
  
  const gameId = params.id as string;
  const [game, setGame] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getGame(gameId);
      setGame(response.game);
    } catch (err) {
      console.error('Error fetching game:', err);
      if (err instanceof ApiError && err.status === 404) {
        setError('Game not found');
      } else {
        setError('Failed to load game');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!gameId) return;
    
    fetchGame();

    // Join WebSocket room for real-time updates
    joinGame(gameId);

    // Set up WebSocket event listeners
    const handleGameUpdate = (updatedGame: GameState) => {
      setGame(updatedGame);
    };

    const handlePlayerJoined = (data: { gameId: string; player: string }) => {
      if (data.gameId === gameId) {
        toast.success('Player joined the game!');
        fetchGame(); // Refresh to get latest state
      }
    };

    const handleMoveMade = (data: { player: string; position: number; gameState: GameState }) => {
      setGame(data.gameState);
    };

    const handleGameCompleted = (data: { winner?: string; gameState: GameState }) => {
      setGame(data.gameState);
      
      if (data.winner === 'draw') {
        toast.success('Game ended in a draw!');
      } else {
        const isWinner = 
          (data.winner === 'X' && data.gameState.player1 === publicKey?.toString()) ||
          (data.winner === 'O' && data.gameState.player2 === publicKey?.toString());
        
        if (isWinner) {
          toast.success('Congratulations! You won!');
        } else {
          toast.error('Game over. Better luck next time!');
        }
      }
    };

    on('game-updated', handleGameUpdate);
    on('player-joined', handlePlayerJoined);
    on('move-made', handleMoveMade);
    on('game-completed', handleGameCompleted);

    return () => {
      leaveGame(gameId);
      off('game-updated', handleGameUpdate);
      off('player-joined', handlePlayerJoined);
      off('move-made', handleMoveMade);
      off('game-completed', handleGameCompleted);
    };
  }, [gameId, publicKey, joinGame, leaveGame, on, off]);

  const handleMakeMove = async (position: number) => {
    if (!game || !publicKey) return;

    try {
      await api.makeMove(gameId, {
        player: publicKey.toString(),
        position,
      });
    } catch (error) {
      console.error('Error making move:', error);
      
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to make move');
      }
    }
  };

  const handleJoinGame = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      await api.joinGame(gameId, {
        player2: publicKey.toString(),
      });
      toast.success('Successfully joined game!');
    } catch (error) {
      console.error('Error joining game:', error);
      
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to join game');
      }
    }
  };

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">You need to connect your wallet to view this game.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="btn-secondary flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Game not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The game you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const isPlayer1 = game.player1 === publicKey?.toString();
  const isPlayer2 = game.player2 === publicKey?.toString();
  const isPlayerInGame = isPlayer1 || isPlayer2;
  const canJoin = game.status === 'waiting' && !isPlayerInGame;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="btn-secondary flex items-center gap-2 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Tic-Tac-Toe Game</h1>
            
            <GameBoard
              board={game.board}
              onCellClick={handleMakeMove}
              disabled={!isPlayerInGame || game.status !== 'active'}
              currentTurn={game.currentTurn}
              playerSymbol={isPlayer1 ? 'X' : isPlayer2 ? 'O' : null}
            />
          </div>
        </div>

        {/* Game Info */}
        <div className="space-y-6">
          {/* Game Status */}
          <GameStatus
            game={game}
            isPlayerInGame={isPlayerInGame}
            playerSymbol={isPlayer1 ? 'X' : isPlayer2 ? 'O' : null}
          />

          {/* Players */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Players
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    X
                  </div>
                  <span className="text-sm font-mono">
                    {shortenAddress(game.player1)}
                    {isPlayer1 && <span className="text-green-600 ml-2">(You)</span>}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    O
                  </div>
                  {game.player2 ? (
                    <span className="text-sm font-mono">
                      {shortenAddress(game.player2)}
                      {isPlayer2 && <span className="text-green-600 ml-2">(You)</span>}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Waiting for player...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Game ID:</span>
                <span className="font-mono text-xs">{game.id.slice(0, 8)}...</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="capitalize font-medium">{game.status}</span>
              </div>
              
              {game.betAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bet Amount:</span>
                  <div className="flex items-center text-primary-600 font-medium">
                    <Coins className="h-3 w-3 mr-1" />
                    {formatSol(game.betAmount, 4)} SOL
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(game.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Join Game Button */}
          {canJoin && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Join Game</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click below to join this game as Player 2 (O).
              </p>
              {game.betAmount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    This game requires a bet of {formatSol(game.betAmount, 4)} SOL. 
                    You'll need to deposit this amount to join.
                  </p>
                </div>
              )}
              <button
                onClick={handleJoinGame}
                className="btn-primary w-full"
              >
                Join Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}