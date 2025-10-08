'use client';

import { useState, useCallback, useEffect } from 'react';
import { Trophy, RotateCcw, Users, ArrowLeft } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useSound } from '@/hooks/useSound';

// Dynamically import 3D component to avoid SSR issues
const Board3D = dynamic(
  () => import('./Game3D/Board3D').then(mod => mod.Board3D),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading 3D board...</p>
        </div>
      </div>
    )
  }
);

interface Game4x4Props {
  mode: 'practice' | 'multiplayer';
  gameId?: string;
  betAmount?: number;
}

// Check winner for 4x4 board (need 4 in a row)
function checkWinner4x4(board: (string | null)[]): { winner: 'X' | 'O' | null; line: number[] | null } {
  const lines = [
    // Rows
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    // Columns
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    // Diagonals
    [0, 5, 10, 15], [3, 6, 9, 12]
  ];

  for (const line of lines) {
    const [a, b, c, d] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]) {
      return { winner: board[a] as 'X' | 'O', line };
    }
  }

  return { winner: null, line: null };
}

export function Game4x4({ mode, gameId, betAmount = 0 }: Game4x4Props) {
  const { publicKey } = useWallet();
  const [board, setBoard] = useState<(string | null)[]>(Array(16).fill(null));
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X');
  const [gameStatus, setGameStatus] = useState<'active' | 'won' | 'draw'>('active');
  const [winner, setWinner] = useState<'X' | 'O' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [playerSymbol] = useState<'X' | 'O'>('X');
  const { playSound } = useSound();
  
  const makeMove = useCallback((position: number) => {
    if (gameStatus !== 'active' || board[position] !== null) {
      return;
    }

    // In practice mode, human always plays as X
    if (mode === 'practice' && currentTurn !== playerSymbol) {
      return;
    }

    const newBoard = [...board];
    newBoard[position] = currentTurn;
    setBoard(newBoard);
    
    // Play move sound
    playSound('move');

    const { winner, line } = checkWinner4x4(newBoard);
    if (winner) {
      setGameStatus('won');
      setWinner(winner);
      setWinningLine(line);
      playSound('win');
      
      if (mode === 'practice') {
        if (winner === playerSymbol) {
          toast.success('Congratulations! You won the 4x4 game! 🎉');
        } else {
          toast.error('AI wins! Try again! 🤖');
        }
      } else {
        toast.success(`${winner} wins!`);
      }
    } else if (newBoard.every(cell => cell !== null)) {
      setGameStatus('draw');
      playSound('draw');
      toast('It\'s a draw!');
    } else {
      setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
    }
  }, [board, currentTurn, gameStatus, mode, playerSymbol, playSound]);

  // Simple AI for practice mode
  useEffect(() => {
    if (mode === 'practice' && currentTurn === 'O' && gameStatus === 'active') {
      const timer = setTimeout(() => {
        const emptyCells = board.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
        if (emptyCells.length > 0) {
          const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          makeMove(randomMove);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentTurn, board, gameStatus, mode, makeMove]);

  const resetGame = () => {
    setBoard(Array(16).fill(null));
    setCurrentTurn('X');
    setGameStatus('active');
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Back button */}
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lobby
        </a>
      </div>
      
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-500 animate-pulse" />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            3D 4x4 Tic-Tac-Toe
          </span>
          {mode === 'practice' && (
            <span className="text-2xl text-gray-500">(Practice)</span>
          )}
        </h1>
        <p className="text-gray-400 text-lg">Get 4 in a row to win in this 3D experience!</p>
      </div>

      {/* Game Info */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400">Current Turn</p>
            <p className="text-2xl font-bold text-white">{currentTurn}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-2xl font-bold text-white capitalize">{gameStatus}</p>
          </div>
          {mode === 'multiplayer' && (
            <>
              <div>
                <p className="text-sm text-gray-400">Players</p>
                <p className="text-2xl font-bold text-white flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Bet</p>
                <p className="text-2xl font-bold text-white">
                  {betAmount > 0 ? `${(betAmount / 1e9).toFixed(2)} SOL` : 'Free'}
                </p>
              </div>
            </>
          )}
        </div>

        {gameStatus !== 'active' && (
          <div className="mt-4 text-center">
            <p className="text-xl font-bold text-white mb-2">
              {gameStatus === 'won' ? `${winner} Wins!` : 'Draw!'}
            </p>
            <button
              onClick={resetGame}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="h-4 w-4" />
              New Game
            </button>
          </div>
        )}
      </div>

      {/* 3D Game Board */}
      <Board3D
        board={board}
        onCellClick={makeMove}
        disabled={gameStatus !== 'active'}
        winningLine={winningLine}
      />

      {/* Instructions */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>How to play:</strong> Click on any empty cell to place your piece. 
          Get 4 in a row (horizontal, vertical, or diagonal) to win! 
          Use your mouse to rotate the 3D board for a better view.
        </p>
      </div>
    </div>
  );
}