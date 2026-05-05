require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const passport = require('passport');

// ─── Routes ────────────────────────────────────────
const authRoutes          = require('./routes/auth');
const userRoutes          = require('./routes/users');
const tripRoutes          = require('./routes/trips');
const entryRoutes         = require('./routes/entries');
const activityRoutes      = require('./routes/activities');
const photoRoutes         = require('./routes/photos');
const collaborationRoutes = require('./routes/collaboration');

// ─── Passport strategy setup ───────────────────────
require('./routes/auth'); // registers passport strategy

const app    = express();
const server = http.createServer(app);

// ─── Socket.io ─────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to every request so routes can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  if (userId) {
    socket.join(`user:${userId}`);
  }

  // Join / leave trip rooms
  socket.on('join_trip', (tripId) => {
    if (tripId) socket.join(`trip:${tripId}`);
  });
  socket.on('leave_trip', (tripId) => {
    if (tripId) socket.leave(`trip:${tripId}`);
  });

  socket.on('disconnect', () => {});
});

// ─── Middleware ─────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ─── API Routes ─────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/trips',         tripRoutes);
app.use('/api',               entryRoutes);
app.use('/api',               activityRoutes);
app.use('/api',               photoRoutes);
app.use('/api',               collaborationRoutes);

// ─── Health check ───────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── 404 ────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Global error handler ───────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 JourneyStack server running on http://localhost:${PORT}`);
});
