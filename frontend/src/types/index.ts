export interface GameState {
  id: string;
  player1: string;
  player2?: string;
  currentTurn: 'X' | 'O';
  status: 'waiting' | 'active' | 'completed';
  winner?: 'X' | 'O' | 'draw';
  board: (string | null)[];
  betAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameListItem {
  id: string;
  player1: string;
  betAmount: number;
  createdAt: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDraw: number;
  totalEarnings: number;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WebSocketEvents {
  'game-updated': (gameState: GameState) => void;
  'player-joined': (data: { gameId: string; player: string }) => void;
  'move-made': (data: { player: string; position: number; gameState: GameState }) => void;
  'game-completed': (data: { winner?: string; gameState: GameState }) => void;
}