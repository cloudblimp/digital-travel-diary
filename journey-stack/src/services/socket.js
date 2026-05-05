import { io } from 'socket.io-client';

// In production, empty string tells socket.io to use the current host (the Render URL).
const SOCKET_URL = import.meta.env.PROD 
  ? '' 
  : (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001');

let socket = null;

/**
 * Connect to the Socket.io server, authenticated with the current user's JWT.
 * Safe to call multiple times — returns existing socket if already connected.
 */
export function connectSocket() {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem('accessToken');
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  return socket;
}

/**
 * Disconnect and clear the socket instance (call on logout).
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get the current socket instance (may be null if not connected).
 */
export function getSocket() {
  return socket;
}

/**
 * Join a trip's real-time room.
 */
export function joinTripRoom(tripId) {
  if (socket && tripId) socket.emit('join_trip', tripId);
}

/**
 * Leave a trip's real-time room.
 */
export function leaveTripRoom(tripId) {
  if (socket && tripId) socket.emit('leave_trip', tripId);
}

export default { connectSocket, disconnectSocket, getSocket, joinTripRoom, leaveTripRoom };
