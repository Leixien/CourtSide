/**
 * Socket.io Client Utilities
 * Provides WebSocket connection for real-time updates
 */

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface SocketEvents {
  // Match events
  'match:update': (data: any) => void;
  'match:score': (data: any) => void;
  'match:status': (data: any) => void;

  // Chat events
  'chat:message': (data: any) => void;
  'chat:reaction': (data: any) => void;

  // Player events
  'player:event': (data: any) => void;

  // Viewer tracking
  'viewers:update': (data: { matchId: string; count: number }) => void;
}

/**
 * Initialize Socket.io connection
 */
export function initSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  // For development, connect to Next.js dev server
  // For production, this will connect to the deployed URL
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

  socket = io(socketUrl, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Join a match room
 */
export function joinMatchRoom(matchId: string): void {
  if (socket) {
    socket.emit('match:join', { matchId });
  }
}

/**
 * Leave a match room
 */
export function leaveMatchRoom(matchId: string): void {
  if (socket) {
    socket.emit('match:leave', { matchId });
  }
}

/**
 * Send chat message via socket
 */
export function sendChatMessage(matchId: string, message: string, parentMessageId?: string): void {
  if (socket) {
    socket.emit('chat:send', { matchId, message, parentMessageId });
  }
}

/**
 * Send reaction via socket
 */
export function sendReaction(messageId: string, emoji: string): void {
  if (socket) {
    socket.emit('chat:react', { messageId, emoji });
  }
}
