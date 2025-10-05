import { useEffect, useCallback } from 'react';
import { websocketManager } from '@/lib/websocket';
import { WebSocketEvents } from '@/types';

export function useWebSocket() {
  useEffect(() => {
    const socket = websocketManager.connect();

    return () => {
      // Don't disconnect on unmount as other components might be using it
      // The WebSocket will be reused across the app
    };
  }, []);

  const joinGame = useCallback((gameId: string) => {
    websocketManager.joinGame(gameId);
  }, []);

  const leaveGame = useCallback((gameId: string) => {
    websocketManager.leaveGame(gameId);
  }, []);

  const on = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ) => {
    websocketManager.on(event, callback);
  }, []);

  const off = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ) => {
    websocketManager.off(event, callback);
  }, []);

  const isConnected = useCallback(() => {
    return websocketManager.isSocketConnected();
  }, []);

  return {
    joinGame,
    leaveGame,
    on,
    off,
    isConnected,
  };
}