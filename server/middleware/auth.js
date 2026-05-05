const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Verifies the JWT from Authorization: Bearer header.
 * Attaches req.user = { id, email, displayName, photoUrl }
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists in DB
    const { rows } = await pool.query(
      'SELECT id, email, display_name, photo_url FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];
    req.user = {
      id:          user.id,
      email:       user.email,
      displayName: user.display_name,
      photoUrl:    user.photo_url,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
