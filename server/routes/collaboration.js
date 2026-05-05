const express  = require('express');
const pool     = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireTripAccess, requireAdmin, requireOwner } = require('../middleware/tripAccess');

const router = express.Router();

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/trips/:id/collaborators
// Returns owner + all collaborators with profile info and roles
// ──────────────────────────────────────────────────────────────────────────────

router.get('/trips/:id/collaborators', authenticate, requireTripAccess, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.owner_id,
              u.id, u.display_name, u.photo_url, u.email,
              CASE WHEN t.owner_id = u.id THEN 'owner' ELSE tc.role::text END AS role,
              tc.added_at
       FROM trips t
       JOIN users u ON (u.id = t.owner_id OR u.id IN (
         SELECT user_id FROM trip_collaborators WHERE trip_id = t.id
       ))
       LEFT JOIN trip_collaborators tc ON tc.trip_id = t.id AND tc.user_id = u.id
       WHERE t.id = $1
       ORDER BY (CASE WHEN t.owner_id = u.id THEN 0 ELSE 1 END), tc.added_at ASC`,
      [req.params.id]
    );

    const collaborators = rows.map(r => ({
      id:          r.id,
      displayName: r.display_name,
      photoUrl:    r.photo_url,
      email:       r.email,
      role:        r.role,
      addedAt:     r.added_at,
    }));

    res.json({ collaborators, myRole: req.tripRole });
  } catch (err) {
    console.error('GET collaborators error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/trips/:id/invite
// Look up invitee by email → create invitation → notify via socket
// ──────────────────────────────────────────────────────────────────────────────

router.post('/trips/:id/invite', authenticate, requireTripAccess, requireAdmin, async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!['editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be editor or admin' });
    }

    // Look up invitee
    const inviteeResult = await pool.query(
      'SELECT id, email, display_name, photo_url FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (inviteeResult.rows.length === 0) {
      return res.status(404).json({ error: 'No user found with that email. They must sign up first.' });
    }

    const invitee = inviteeResult.rows[0];

    if (invitee.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot invite yourself' });
    }

    // Check not already a collaborator or owner
    const tripCheck = await pool.query('SELECT owner_id FROM trips WHERE id = $1', [req.params.id]);
    if (tripCheck.rows[0].owner_id === invitee.id) {
      return res.status(400).json({ error: 'This user is already the trip owner' });
    }

    const existingCollab = await pool.query(
      'SELECT 1 FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
      [req.params.id, invitee.id]
    );
    if (existingCollab.rows.length > 0) {
      return res.status(400).json({ error: 'This user is already a collaborator' });
    }

    // Check for existing pending invite
    const existingInvite = await pool.query(
      `SELECT id FROM invitations WHERE trip_id = $1 AND invitee_uid = $2 AND status = 'pending'`,
      [req.params.id, invitee.id]
    );
    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ error: 'A pending invite already exists for this user' });
    }

    // Get trip title for notification
    const tripResult = await pool.query('SELECT title FROM trips WHERE id = $1', [req.params.id]);
    const tripTitle  = tripResult.rows[0].title;

    // Create invitation
    const { rows } = await pool.query(
      `INSERT INTO invitations (trip_id, invited_by_uid, invitee_uid, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, req.user.id, invitee.id, role]
    );

    const invitation = rows[0];

    // Notify invitee via socket (their personal room)
    req.io?.to(`user:${invitee.id}`).emit('invite:new', {
      invitationId: invitation.id,
      tripId:       req.params.id,
      tripTitle,
      invitedByName: req.user.displayName,
      role,
    });

    res.status(201).json({
      invitation: {
        id:           invitation.id,
        tripId:       invitation.trip_id,
        inviteeEmail: invitee.email,
        inviteeName:  invitee.display_name,
        role:         invitation.role,
        status:       invitation.status,
        createdAt:    invitation.created_at,
      },
    });
  } catch (err) {
    console.error('POST invite error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/invitations  — list my pending + history invitations
// ──────────────────────────────────────────────────────────────────────────────

router.get('/invitations', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         i.*,
         t.title AS trip_title,
         t.cover_image AS trip_cover,
         t.destination AS trip_destination,
         inviter.display_name AS invited_by_name,
         inviter.photo_url AS invited_by_photo
       FROM invitations i
       JOIN trips t ON t.id = i.trip_id
       JOIN users inviter ON inviter.id = i.invited_by_uid
       WHERE i.invitee_uid = $1
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );

    const invitations = rows.map(r => ({
      id:             r.id,
      tripId:         r.trip_id,
      tripTitle:      r.trip_title,
      tripCover:      r.trip_cover,
      tripDestination: r.trip_destination,
      invitedByName:  r.invited_by_name,
      invitedByPhoto: r.invited_by_photo,
      role:           r.role,
      status:         r.status,
      createdAt:      r.created_at,
      respondedAt:    r.responded_at,
    }));

    res.json({ invitations });
  } catch (err) {
    console.error('GET invitations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/invitations/count  — pending invite count for badge
// ──────────────────────────────────────────────────────────────────────────────

router.get('/invitations/count', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM invitations WHERE invitee_uid = $1 AND status = 'pending'`,
      [req.user.id]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    console.error('GET invite count error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/invitations/:id/accept
// ──────────────────────────────────────────────────────────────────────────────

router.patch('/invitations/:id/accept', authenticate, async (req, res) => {
  try {
    const invResult = await pool.query(
      `SELECT * FROM invitations WHERE id = $1 AND invitee_uid = $2 AND status = 'pending'`,
      [req.params.id, req.user.id]
    );

    if (invResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found or already responded' });
    }

    const inv = invResult.rows[0];

    // Add to trip_collaborators
    await pool.query(
      `INSERT INTO trip_collaborators (trip_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (trip_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
      [inv.trip_id, req.user.id, inv.role, inv.invited_by_uid]
    );

    // Update invitation status
    await pool.query(
      `UPDATE invitations SET status = 'accepted', responded_at = NOW() WHERE id = $1`,
      [req.params.id]
    );

    // Notify the trip room that a new collaborator joined
    req.io?.to(`trip:${inv.trip_id}`).emit('trip:collaborator_added', {
      tripId: inv.trip_id,
      user: {
        id:          req.user.id,
        displayName: req.user.displayName,
        photoUrl:    req.user.photoUrl,
        role:        inv.role,
      },
    });

    // Also notify the inviter
    req.io?.to(`user:${inv.invited_by_uid}`).emit('invite:accepted', {
      tripId:  inv.trip_id,
      byName:  req.user.displayName,
    });

    res.json({ message: 'Invitation accepted', tripId: inv.trip_id, role: inv.role });
  } catch (err) {
    console.error('accept invite error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/invitations/:id/decline
// ──────────────────────────────────────────────────────────────────────────────

router.patch('/invitations/:id/decline', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE invitations SET status = 'declined', responded_at = NOW()
       WHERE id = $1 AND invitee_uid = $2 AND status = 'pending'
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found or already responded' });
    }

    res.json({ message: 'Invitation declined' });
  } catch (err) {
    console.error('decline invite error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// DELETE /api/trips/:id/collaborators/:uid  — remove a collaborator
// ──────────────────────────────────────────────────────────────────────────────

router.delete('/trips/:id/collaborators/:uid', authenticate, requireTripAccess, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;

    // Cannot remove the owner
    if (uid === req.tripOwnerId) {
      return res.status(400).json({ error: 'Cannot remove the trip owner' });
    }

    // Non-owners cannot remove admins (only the owner can remove admins)
    if (req.tripRole !== 'owner') {
      const target = await pool.query(
        'SELECT role FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
        [req.params.id, uid]
      );
      if (target.rows[0]?.role === 'admin') {
        return res.status(403).json({ error: 'Only the trip owner can remove admins' });
      }
    }

    const result = await pool.query(
      'DELETE FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    // Notify removed user's personal room
    req.io?.to(`user:${uid}`).emit('trip:access_revoked', { tripId: req.params.id });

    // Notify trip room
    req.io?.to(`trip:${req.params.id}`).emit('trip:collaborator_removed', {
      tripId: req.params.id,
      userId: uid,
    });

    res.json({ message: 'Collaborator removed' });
  } catch (err) {
    console.error('remove collaborator error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// DELETE /api/trips/:id/leave  — collaborator leaves a trip
// ──────────────────────────────────────────────────────────────────────────────

router.delete('/trips/:id/leave', authenticate, requireTripAccess, async (req, res) => {
  try {
    if (req.tripRole === 'owner') {
      return res.status(400).json({ error: 'Trip owner cannot leave — delete the trip instead' });
    }

    await pool.query(
      'DELETE FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    req.io?.to(`trip:${req.params.id}`).emit('trip:collaborator_removed', {
      tripId: req.params.id,
      userId: req.user.id,
    });

    res.json({ message: 'Left trip successfully' });
  } catch (err) {
    console.error('leave trip error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/trips/:id/collaborators/:uid/role  — change a collaborator's role
// ──────────────────────────────────────────────────────────────────────────────

router.patch('/trips/:id/collaborators/:uid/role', authenticate, requireTripAccess, requireOwner, async (req, res) => {
  try {
    const { role } = req.body;
    const { uid }  = req.params;

    if (!['editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be editor or admin' });
    }

    const result = await pool.query(
      `UPDATE trip_collaborators SET role = $1 WHERE trip_id = $2 AND user_id = $3 RETURNING *`,
      [role, req.params.id, uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    req.io?.to(`user:${uid}`).emit('trip:role_changed', { tripId: req.params.id, newRole: role });

    res.json({ message: 'Role updated', role });
  } catch (err) {
    console.error('change role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
