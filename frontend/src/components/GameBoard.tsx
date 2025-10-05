'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface GameBoardProps {
  board: (string | null)[];
  onCellClick: (position: number) => void;
  disabled: boolean;
  currentTurn: 'X' | 'O';
  playerSymbol: 'X' | 'O' | null;
}

export function GameBoard({ board, onCellClick, disabled, currentTurn, playerSymbol }: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const isMyTurn = playerSymbol === currentTurn;
  const canMakeMove = !disabled && isMyTurn;

  const handleCellClick = (position: number) => {
    if (board[position] !== null || !canMakeMove) return;
    onCellClick(position);
  };

  const getCellContent = (position: number) => {
    const value = board[position];
    if (value) return value;
    
    // Show preview of move on hover
    if (hoveredCell === position && canMakeMove) {
      return currentTurn;
    }
    
    return '';
  };

  const getCellClasses = (position: number) => {
    const value = board[position];
    const isHovered = hoveredCell === position;
    
    return clsx(
      'game-cell',
      {
        'occupied': value !== null,
        'x': value === 'X',
        'o': value === 'O',
        'cursor-pointer hover:bg-primary-50': canMakeMove && value === null,
        'cursor-not-allowed': !canMakeMove || value !== null,
        'opacity-50': isHovered && canMakeMove && value === null,
      }
    );
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Turn indicator */}
      <div className="text-center">
        {disabled ? (
          <p className="text-lg text-gray-500">Game not active</p>
        ) : isMyTurn ? (
          <p className="text-lg font-semibold text-green-600">Your turn ({playerSymbol})</p>
        ) : (
          <p className="text-lg text-gray-600">
            Waiting for opponent ({currentTurn})
          </p>
        )}
      </div>

      {/* Game board */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-gray-100 rounded-lg">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            onMouseEnter={() => canMakeMove && setHoveredCell(index)}
            onMouseLeave={() => setHoveredCell(null)}
            className={getCellClasses(index)}
            disabled={!canMakeMove || cell !== null}
          >
            <span className={clsx(
              'text-3xl font-bold transition-all duration-200',
              {
                'animate-bounce-in': cell !== null,
                'opacity-40': hoveredCell === index && canMakeMove && cell === null,
              }
            )}>
              {getCellContent(index)}
            </span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 max-w-md">
        {playerSymbol ? (
          <>
            You are playing as <strong>{playerSymbol}</strong>. 
            {canMakeMove ? ' Click on an empty cell to make your move.' : ' Wait for your turn.'}
          </>
        ) : (
          'You are spectating this game.'
        )}
      </div>
    </div>
  );
}