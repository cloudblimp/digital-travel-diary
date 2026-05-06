const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const pool     = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

async function saveRefreshToken(userId, token) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hash, expires]
  );
  return hash;
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function formatUser(row) {
  return {
    id:          row.id,
    email:       row.email,
    displayName: row.display_name,
    photoUrl:    row.photo_url,
    provider:    row.provider,
  };
}

async function createMailer() {
  // Use 'gmail' service shorthand — handles host, port, and TLS automatically
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── Passport Google Strategy ─────────────────────────────────────────────────

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID     || 'TODO_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'TODO_GOOGLE_CLIENT_SECRET',
    callbackURL:  `${process.env.SERVER_URL || 'http://localhost:5001'}/api/auth/google/callback`,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email   = profile.emails?.[0]?.value;
      const name    = profile.displayName;
      const photo   = profile.photos?.[0]?.value;
      const googleId = profile.id;

      // Upsert user
      const { rows } = await pool.query(
        `INSERT INTO users (email, display_name, photo_url, provider, google_id)
         VALUES ($1, $2, $3, 'google', $4)
         ON CONFLICT (email) DO UPDATE
           SET google_id    = EXCLUDED.google_id,
               photo_url    = COALESCE(users.photo_url, EXCLUDED.photo_url),
               display_name = COALESCE(users.display_name, EXCLUDED.display_name),
               updated_at   = NOW()
         RETURNING *`,
        [email, name, photo, googleId]
      );

      done(null, rows[0]);
    } catch (err) {
      done(err);
    }
  }
));

// ─── POST /api/auth/signup ────────────────────────────────────────────────────

router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, display_name, provider)
       VALUES ($1, $2, $3, 'email')
       RETURNING *`,
      [email, hash, displayName || email.split('@')[0]]
    );

    const user = rows[0];
    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ token: accessToken, user: formatUser(user) });
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    if (!user.password_hash) {
      return res.status(400).json({ error: 'This account uses Google login' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.json({ token: accessToken, user: formatUser(user) });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────────

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('logout error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/refresh ──────────────────────────────────────────────────

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const { rows } = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
      [hash]
    );

    if (rows.length === 0) return res.status(401).json({ error: 'Invalid or expired refresh token' });

    const newAccessToken  = generateAccessToken(rows[0].user_id);
    const newRefreshToken = generateRefreshToken();

    // Rotate: delete old, save new
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]);
    await saveRefreshToken(rows[0].user_id, newRefreshToken);
    setRefreshCookie(res, newRefreshToken);

    res.json({ token: newAccessToken });
  } catch (err) {
    console.error('refresh error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────

router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, display_name, photo_url, provider FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: formatUser(rows[0]) });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/auth/change-password ────────────────────────────────────────

router.patch('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = rows[0];

    if (!user.password_hash) {
      return res.status(400).json({ error: 'OAuth accounts cannot set a password this way' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user.id]
    );

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('change-password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/auth/change-email ────────────────────────────────────────────

router.patch('/change-email', authenticate, async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ error: 'New email and password are required' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = rows[0];

    if (!user.password_hash) {
      return res.status(400).json({ error: 'OAuth accounts cannot change email this way' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Password is incorrect' });

    // Check email not already taken
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail, req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    await pool.query(
      'UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2',
      [newEmail, req.user.id]
    );

    res.json({ message: 'Email updated' });
  } catch (err) {
    console.error('change-email error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    // Always return success to avoid email enumeration
    if (rows.length === 0) {
      return res.json({ message: 'If that email exists, a reset link was sent' });
    }

    const userId     = rows[0].id;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash  = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires    = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [tokenHash, expires, userId]
    );

    // In production monolith, the frontend is served from the same origin as the server
    const baseUrl = process.env.SERVER_URL || process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const mailer = await createMailer();
    await mailer.sendMail({
      from:    process.env.EMAIL_FROM || 'noreply@journeystack.app',
      to:      email,
      subject: 'JourneyStack — Reset your password',
      html:    `
        <p>You requested a password reset for your JourneyStack account.</p>
        <p><a href="${resetUrl}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `,
    });

    res.json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    console.error('forgot-password error:', err.message, err.code, err.response);
    res.status(500).json({ error: `Mail error: ${err.message}` });
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $2',
      [newHash, rows[0].id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken  = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      await saveRefreshToken(user.id, refreshToken);
      setRefreshCookie(res, refreshToken);

      // Redirect to frontend with token in query param
      // Using relative paths ensures it works on both localhost and live Railway URL automatically
      res.redirect(`/auth/callback?token=${accessToken}`);
    } catch (err) {
      console.error('google callback error:', err);
      res.redirect(`/login?error=server_error`);
    }
  }
);

module.exports = router;
