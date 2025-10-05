import { Server, Socket } from 'socket.io';

let io: Server;

export function initializeWebSocket(socketServer: Server) {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-game', (gameId: string) => {
      socket.join(gameId);
      console.log(`Socket ${socket.id} joined game ${gameId}`);
    });

    socket.on('leave-game', (gameId: string) => {
      socket.leave(gameId);
      console.log(`Socket ${socket.id} left game ${gameId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

export function emitGameUpdate(gameId: string, gameState: any) {
  if (io) {
    io.to(gameId).emit('game-updated', gameState);
  }
}

export function emitPlayerJoined(gameId: string, player: string) {
  if (io) {
    io.to(gameId).emit('player-joined', { gameId, player });
  }
}

export function emitMoveMade(gameId: string, move: { player: string; position: number; gameState: any }) {
  if (io) {
    io.to(gameId).emit('move-made', move);
  }
}

export function emitGameCompleted(gameId: string, result: { winner?: string; gameState: any }) {
  if (io) {
    io.to(gameId).emit('game-completed', result);
  }
}