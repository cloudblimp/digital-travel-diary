const express  = require('express');
const pool     = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireTripAccess } = require('../middleware/tripAccess');

const router = express.Router();

function formatActivity(row) {
  return {
    id:          row.id,
    tripId:      row.trip_id,
    authorId:    row.author_id,
    authorName:  row.author_name,
    title:       row.title,
    dateTime:    row.date_time,
    location:    row.location,
    description: row.description,
    type:        row.type,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// ─── GET /api/trips/:tripId/activities ───────────────────────────────────────

router.get('/trips/:tripId/activities', authenticate, requireTripAccess, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.display_name AS author_name
       FROM activities a
       JOIN users u ON u.id = a.author_id
       WHERE a.trip_id = $1
       ORDER BY a.date_time ASC`,
      [req.params.tripId]
    );
    res.json({ activities: rows.map(formatActivity) });
  } catch (err) {
    console.error('GET activities error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/trips/:tripId/activities ──────────────────────────────────────

router.post('/trips/:tripId/activities', authenticate, requireTripAccess, async (req, res) => {
  try {
    const { title, dateTime, location, description, type } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { rows } = await pool.query(
      `INSERT INTO activities (trip_id, author_id, title, date_time, location, description, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.params.tripId, req.user.id, title, dateTime || null, location, description, type || 'Activity']
    );

    const activity = rows[0];

    req.io?.to(`trip:${req.params.tripId}`).emit('trip:activity_added', {
      tripId:   req.params.tripId,
      activity: { ...activity, authorName: req.user.displayName },
    });

    res.status(201).json({ activity: formatActivity({ ...activity, author_name: req.user.displayName }) });
  } catch (err) {
    console.error('POST activity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/activities/:id ────────────────────────────────────────────────

router.patch('/activities/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, t.owner_id AS trip_owner_id FROM activities a JOIN trips t ON t.id = a.trip_id WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Activity not found' });

    const a      = result.rows[0];
    const userId = req.user.id;

    const isAuthor = a.author_id === userId;
    const isOwner  = a.trip_owner_id === userId;

    if (!isAuthor && !isOwner) {
      const collab = await pool.query(
        'SELECT role FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
        [a.trip_id, userId]
      );
      if (collab.rows.length === 0 || collab.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Only the author or a trip admin can edit this activity' });
      }
    }

    const { title, dateTime, location, description, type } = req.body;

    const updates = [];
    const values  = [];
    let   idx     = 1;

    if (title       !== undefined) { updates.push(`title = $${idx++}`);       values.push(title); }
    if (dateTime    !== undefined) { updates.push(`date_time = $${idx++}`);   values.push(dateTime || null); }
    if (location    !== undefined) { updates.push(`location = $${idx++}`);    values.push(location); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
    if (type        !== undefined) { updates.push(`type = $${idx++}`);        values.push(type); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    updates.push('updated_at = NOW()');
    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE activities SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING *, (SELECT display_name FROM users WHERE id = author_id) AS author_name`,
      values
    );

    req.io?.to(`trip:${a.trip_id}`).emit('trip:activity_updated', { tripId: a.trip_id, activity: formatActivity(rows[0]) });

    res.json({ activity: formatActivity(rows[0]) });
  } catch (err) {
    console.error('PATCH activity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/activities/:id ───────────────────────────────────────────────

router.delete('/activities/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, t.owner_id AS trip_owner_id FROM activities a JOIN trips t ON t.id = a.trip_id WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Activity not found' });

    const a      = result.rows[0];
    const userId = req.user.id;

    const isAuthor = a.author_id === userId;
    const isOwner  = a.trip_owner_id === userId;

    if (!isAuthor && !isOwner) {
      const collab = await pool.query(
        'SELECT role FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
        [a.trip_id, userId]
      );
      if (collab.rows.length === 0 || collab.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Only the author or a trip admin can delete this activity' });
      }
    }

    await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id]);

    req.io?.to(`trip:${a.trip_id}`).emit('trip:activity_deleted', { tripId: a.trip_id, activityId: req.params.id });

    res.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error('DELETE activity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
