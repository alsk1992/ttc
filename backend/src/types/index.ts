export interface GameState {
  id: string;
  player1: string;
  player2?: string;
  currentTurn: 'X' | 'O';
  status: 'waiting' | 'active' | 'completed';
  winner?: 'X' | 'O' | 'draw';
  board: (string | null)[];
  betAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGameRequest {
  player1: string;
  betAmount: number;
}

export interface JoinGameRequest {
  player2: string;
}

export interface MakeMoveRequest {
  player: string;
  position: number;
}

export interface GameListItem {
  id: string;
  player1: string;
  betAmount: number;
  createdAt: Date;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDraw: number;
  totalEarnings: number;
}