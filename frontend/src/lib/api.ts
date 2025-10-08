import { GameState, GameListItem, PlayerStats, CreateGameRequest, JoinGameRequest, MakeMoveRequest } from '@/types';

// Determine API URL based on environment
const getApiUrl = () => {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production, warn about missing configuration
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.warn('⚠️ NEXT_PUBLIC_API_URL not set for production. Please configure your backend URL.');
    // Try common Railway pattern - replace 'frontend' with 'backend' in URL
    const currentUrl = window.location.origin;
    if (currentUrl.includes('railway.app')) {
      const backendUrl = currentUrl.replace('-frontend-', '-backend-').replace(/:\d+$/, '');
      console.log('Attempting to use backend URL:', backendUrl);
      return backendUrl;
    }
  }
  
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiUrl();

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error(`❌ API Error (${response.status}):`, errorData);
      
      // Provide helpful error messages for common issues
      if (response.status === 404) {
        console.error('🔍 Backend API endpoint not found. Is the backend server running?');
      }
      
      throw new ApiError(response.status, errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Response:`, data);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('❌ Network error:', error);
    console.error('🔍 Check if backend is running and CORS is configured correctly');
    throw new ApiError(0, 'Network error - backend may be offline');
  }
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