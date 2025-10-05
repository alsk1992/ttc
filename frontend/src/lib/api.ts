import { GameState, GameListItem, PlayerStats, CreateGameRequest, JoinGameRequest, MakeMoveRequest } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new ApiError(response.status, errorData.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Game management
  createGame: async (data: CreateGameRequest): Promise<{ game: GameState }> => {
    return apiRequest('/games/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getGame: async (gameId: string): Promise<{ game: GameState }> => {
    return apiRequest(`/games/${gameId}`);
  },

  getActiveGames: async (): Promise<{ games: GameListItem[] }> => {
    return apiRequest('/games/active');
  },

  joinGame: async (gameId: string, data: JoinGameRequest): Promise<{ game: GameState }> => {
    return apiRequest(`/games/${gameId}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  makeMove: async (gameId: string, data: MakeMoveRequest): Promise<{ game: GameState }> => {
    return apiRequest(`/games/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPlayerGames: async (walletAddress: string): Promise<{ games: GameState[]; stats: PlayerStats }> => {
    return apiRequest(`/games/player/${walletAddress}`);
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest('/health', { method: 'GET' });
  },
};

export { ApiError };