const pool = require('../config/db');

/**
 * Verifies that req.user is either the trip owner or a collaborator.
 * Attaches req.tripRole = 'owner' | 'admin' | 'editor'
 *
 * Must be used after authenticate middleware.
 * Expects req.params.tripId or req.params.id (for trip routes).
 */
async function requireTripAccess(req, res, next) {
  try {
    const tripId = req.params.tripId || req.params.id;
    const userId = req.user.id;

    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    // Check ownership first
    const tripResult = await pool.query(
      'SELECT id, owner_id FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = tripResult.rows[0];

    if (trip.owner_id === userId) {
      req.tripRole = 'owner';
      req.tripOwnerId = trip.owner_id;
      return next();
    }

    // Check collaborator
    const collabResult = await pool.query(
      'SELECT role FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
      [tripId, userId]
    );

    if (collabResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.tripRole = collabResult.rows[0].role; // 'editor' | 'admin'
    req.tripOwnerId = trip.owner_id;
    next();
  } catch (err) {
    console.error('tripAccess error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Requires tripRole to be 'owner' or 'admin'.
 * Must be used after requireTripAccess.
 */
function requireAdmin(req, res, next) {
  if (req.tripRole !== 'owner' && req.tripRole !== 'admin') {
    return res.status(403).json({ error: 'Admin or owner access required' });
  }
  next();
}

/**
 * Requires tripRole to be 'owner' only.
 */
function requireOwner(req, res, next) {
  if (req.tripRole !== 'owner') {
    return res.status(403).json({ error: 'Only the trip owner can perform this action' });
  }
  next();
}

module.exports = { requireTripAccess, requireAdmin, requireOwner };
