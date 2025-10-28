/**
 * Socket.io Server Handler
 * Manages real-time connections and broadcasts
 * Note: This is for custom server setup (optional for advanced use)
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function initSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Track active viewers per match
  const matchRooms = new Map<string, Set<string>>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join match room
    socket.on('match:join', ({ matchId }) => {
      socket.join(`match:${matchId}`);

      // Track viewer count
      if (!matchRooms.has(matchId)) {
        matchRooms.set(matchId, new Set());
      }
      matchRooms.get(matchId)?.add(socket.id);

      // Broadcast updated viewer count
      const viewerCount = matchRooms.get(matchId)?.size || 0;
      io.to(`match:${matchId}`).emit('viewers:update', {
        matchId,
        count: viewerCount,
      });

      console.log(`Socket ${socket.id} joined match ${matchId}, viewers: ${viewerCount}`);
    });

    // Leave match room
    socket.on('match:leave', ({ matchId }) => {
      socket.leave(`match:${matchId}`);

      // Update viewer count
      matchRooms.get(matchId)?.delete(socket.id);
      const viewerCount = matchRooms.get(matchId)?.size || 0;

      io.to(`match:${matchId}`).emit('viewers:update', {
        matchId,
        count: viewerCount,
      });

      console.log(`Socket ${socket.id} left match ${matchId}, viewers: ${viewerCount}`);
    });

    // Handle chat messages
    socket.on('chat:send', (data) => {
      // Broadcast to all users in the match room
      io.to(`match:${data.matchId}`).emit('chat:message', data);
    });

    // Handle reactions
    socket.on('chat:react', (data) => {
      // Broadcast to all users in the match room
      io.to(`match:${data.matchId}`).emit('chat:reaction', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Remove from all match rooms
      matchRooms.forEach((viewers, matchId) => {
        if (viewers.has(socket.id)) {
          viewers.delete(socket.id);
          const viewerCount = viewers.size;

          io.to(`match:${matchId}`).emit('viewers:update', {
            matchId,
            count: viewerCount,
          });
        }
      });
    });
  });

  console.log('✅ Socket.io server initialized');

  return io;
}

/**
 * Helper function to broadcast match updates
 */
export function broadcastMatchUpdate(io: SocketIOServer, matchId: string, update: any) {
  io.to(`match:${matchId}`).emit('match:update', update);
}

/**
 * Helper function to broadcast score updates
 */
export function broadcastScoreUpdate(io: SocketIOServer, matchId: string, scores: any) {
  io.to(`match:${matchId}`).emit('match:score', scores);
}

/**
 * Helper function to broadcast player events
 */
export function broadcastPlayerEvent(io: SocketIOServer, matchId: string, event: any) {
  io.to(`match:${matchId}`).emit('player:event', event);
}
