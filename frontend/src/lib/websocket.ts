import { io, Socket } from 'socket.io-client';
import { WebSocketEvents } from '@/types';

class WebSocketManager {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Socket {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinGame(gameId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-game', gameId);
    }
  }

  leaveGame(gameId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-game', gameId);
    }
  }

  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    if (this.socket) {
      this.socket.on(event as string, callback as any);
    }
  }

  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]): void {
    if (this.socket) {
      this.socket.off(event as string, callback as any);
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

// Singleton instance
export const websocketManager = new WebSocketManager();