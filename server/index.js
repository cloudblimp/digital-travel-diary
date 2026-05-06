require('dotenv').config();
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');
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
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "blob:", "https://*.cloudinary.com", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org"],
      connectSrc: ["'self'", "https://nominatim.openstreetmap.org", "https://*.cloudinary.com", "https://api.cloudinary.com", "wss:", "ws:"],
      frameSrc:   ["'none'"],
    },
  },
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

// ─── Frontend Static Hosting (Production) ─────────────
// Serve the built React app statically from the journey-stack/dist folder
app.use(express.static(path.join(__dirname, '../journey-stack/dist')));

// ─── 404 (API routes) ───────────────────────────────
// Only return JSON 404 for paths starting with /api
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Catch-all for React Router ─────────────────────
// All other requests get the React index.html so frontend routing works
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../journey-stack/dist/index.html'));
});

// ─── Global error handler ───────────────────────────
// ─── Database Auto-Initialization ───────────────────
async function initDatabase() {
  try {
    // Check if the users table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('📦 Database is empty. Initializing schema...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema
      await pool.query(schemaSql);
      console.log('✅ Database schema initialized successfully');
    } else {
      console.log('📖 Database schema already exists');
    }
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    // Don't exit, maybe it's just a permissions issue
  }
}

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ──────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, async () => {
  console.log(`🚀 JourneyStack server running on http://localhost:${PORT}`);
  
  // Run auto-init
  await initDatabase();
});
