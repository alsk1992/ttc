'use client';

import { useState, useEffect, useCallback } from 'react';
import { Brain, RotateCcw, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import { getAIMove, getAIThinkingTime, Difficulty } from '@/lib/ai-player';

interface PracticeGameProps {
  difficulty: Difficulty;
}

export function PracticeGame({ difficulty }: PracticeGameProps) {
  const router = useRouter();
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X');
  const [gameStatus, setGameStatus] = useState<'active' | 'won' | 'draw'>('active');
  const [winner, setWinner] = useState<'X' | 'O' | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [playerSymbol] = useState<'X' | 'O'>('X'); // Human is always X
  const [aiSymbol] = useState<'X' | 'O'>('O'); // AI is always O
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = useCallback((board: (string | null)[]): { winner: 'X' | 'O' | null; line: number[] | null } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a] as 'X' | 'O', line };
      }
    }

    return { winner: null, line: null };
  }, []);

  const isBoardFull = useCallback((board: (string | null)[]): boolean => {
    return board.every(cell => cell !== null);
  }, []);

  const makeMove = useCallback((position: number) => {
    if (gameStatus !== 'active' || board[position] !== null || currentTurn !== playerSymbol || isAIThinking) {
      return;
    }

    const newBoard = [...board];
    newBoard[position] = currentTurn;
    setBoard(newBoard);

    const { winner, line } = checkWinner(newBoard);
    if (winner) {
      setGameStatus('won');
      setWinner(winner);
      setWinningLine(line);
      if (winner === playerSymbol) {
        toast.success('Congratulations! You won! 🎉');
      } else {
        toast.error('AI wins! Try again! 🤖');
      }
    } else if (isBoardFull(newBoard)) {
      setGameStatus('draw');
      toast('It\'s a draw! Well played! 🤝');
    } else {
      setCurrentTurn(aiSymbol);
    }
  }, [board, currentTurn, gameStatus, playerSymbol, aiSymbol, isAIThinking, checkWinner, isBoardFull]);

  // AI makes its move
  useEffect(() => {
    if (currentTurn === aiSymbol && gameStatus === 'active' && !isAIThinking) {
      setIsAIThinking(true);
      
      const thinkingTime = getAIThinkingTime(difficulty);
      
      setTimeout(() => {
        try {
          const aiMove = getAIMove(board, aiSymbol, difficulty);
          const newBoard = [...board];
          newBoard[aiMove] = aiSymbol;
          setBoard(newBoard);

          const { winner, line } = checkWinner(newBoard);
          if (winner) {
            setGameStatus('won');
            setWinner(winner);
            setWinningLine(line);
            if (winner === aiSymbol) {
              toast.error('AI wins! Try again! 🤖');
            }
          } else if (isBoardFull(newBoard)) {
            setGameStatus('draw');
            toast('It\'s a draw! Well played! 🤝');
          } else {
            setCurrentTurn(playerSymbol);
          }
        } catch (error) {
          console.error('AI move error:', error);
          toast.error('AI error! Please restart the game.');
        } finally {
          setIsAIThinking(false);
        }
      }, thinkingTime);
    }
  }, [currentTurn, aiSymbol, gameStatus, board, difficulty, playerSymbol, checkWinner, isBoardFull, isAIThinking]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentTurn('X');
    setGameStatus('active');
    setWinner(null);
    setWinningLine(null);
    setIsAIThinking(false);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getDifficultyEmoji = () => {
    switch (difficulty) {
      case 'easy':
        return '😊';
      case 'medium':
        return '🤔';
      case 'hard':
        return '😈';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Lobby
        </button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Practice Mode
          </h1>
          
          <div className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2',
            getDifficultyColor()
          )}>
            <span>{getDifficultyEmoji()}</span>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} AI
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">You are</p>
            <p className="text-2xl font-bold text-blue-600">X</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">AI is</p>
            <p className="text-2xl font-bold text-red-600">O</p>
          </div>
        </div>

        <div className={clsx(
          'p-3 rounded-lg text-center',
          isAIThinking ? 'bg-yellow-50 border border-yellow-200' : 
          gameStatus === 'active' && currentTurn === playerSymbol ? 'bg-blue-50 border border-blue-200' :
          gameStatus === 'won' && winner === playerSymbol ? 'bg-green-50 border border-green-200' :
          gameStatus === 'won' && winner === aiSymbol ? 'bg-red-50 border border-red-200' :
          'bg-gray-50 border border-gray-200'
        )}>
          <p className="font-medium">
            {isAIThinking ? '🤖 AI is thinking...' :
             gameStatus === 'active' && currentTurn === playerSymbol ? 'Your turn!' :
             gameStatus === 'active' && currentTurn === aiSymbol ? 'AI\'s turn' :
             gameStatus === 'won' && winner === playerSymbol ? '🎉 You won!' :
             gameStatus === 'won' && winner === aiSymbol ? '🤖 AI wins!' :
             '🤝 It\'s a draw!'}
          </p>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-6 mb-6">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            const isClickable = gameStatus === 'active' && cell === null && currentTurn === playerSymbol && !isAIThinking;
            
            return (
              <button
                key={idx}
                onClick={() => makeMove(idx)}
                disabled={!isClickable}
                className={clsx(
                  'h-20 w-20 border-2 flex items-center justify-center text-3xl font-bold rounded-lg transition-all',
                  isWinningCell ? 'bg-green-100 border-green-400' :
                  cell === 'X' ? 'bg-blue-50 border-blue-300 text-blue-600' :
                  cell === 'O' ? 'bg-red-50 border-red-300 text-red-600' :
                  isClickable ? 'bg-white hover:bg-gray-50 hover:border-gray-400 border-gray-300 cursor-pointer' :
                  'bg-gray-50 border-gray-200 cursor-not-allowed'
                )}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={resetGame}
          className="btn btn-primary flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          New Game
        </button>
      </div>

      {/* Practice Mode Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Practice Mode:</strong> Play against AI to improve your skills. No SOL required!
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Ready for real games? Head back to the lobby to play against other players and bet SOL.
        </p>
      </div>
    </div>
  );
}