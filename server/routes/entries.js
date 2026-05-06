const express  = require('express');
const pool     = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { authenticate } = require('../middleware/auth');
const { requireTripAccess } = require('../middleware/tripAccess');
const { uploadEntryPhoto } = require('../middleware/upload');

const router = express.Router();

function formatEntry(row) {
  return {
    id:          row.id,
    tripId:      row.trip_id,
    authorId:    row.author_id,
    authorName:  row.author_name,
    authorPhoto: row.author_photo,
    title:       row.title,
    dateTime:    row.date_time,
    location:    row.location,
    story:       row.story,
    type:        row.type,
    photoUrl:    row.photo_url,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// ─── GET /api/trips/:tripId/entries ──────────────────────────────────────────

router.get('/trips/:tripId/entries', authenticate, requireTripAccess, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.display_name AS author_name, u.photo_url AS author_photo
       FROM entries e
       JOIN users u ON u.id = e.author_id
       WHERE e.trip_id = $1
       ORDER BY e.date_time DESC`,
      [req.params.tripId]
    );
    res.json({ entries: rows.map(formatEntry) });
  } catch (err) {
    console.error('GET entries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/trips/:tripId/entries ─────────────────────────────────────────

router.post('/trips/:tripId/entries', authenticate, requireTripAccess, uploadEntryPhoto, async (req, res) => {
  try {
    const { title, dateTime, location, story, type } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    let photoUrl      = null;
    let photoPublicId = null;
    if (req.file) {
      photoUrl      = req.file.path || req.file.secure_url || req.file.url;
      photoPublicId = req.file.filename || req.file.public_id;
    }

    const { rows } = await pool.query(
      `INSERT INTO entries (trip_id, author_id, title, date_time, location, story, type, photo_url, photo_public_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.params.tripId, req.user.id, title, dateTime || null, location, story, type || 'Activity', photoUrl, photoPublicId]
    );

    const entry = rows[0];
    const formatted = formatEntry({ ...entry, author_name: req.user.displayName, author_photo: req.user.photoUrl });

    // Emit real-time event to trip room
    req.io?.to(`trip:${req.params.tripId}`).emit('trip:entry_added', {
      tripId: req.params.tripId,
      entry:  formatted,
    });

    res.status(201).json({ entry: formatted });
  } catch (err) {
    console.error('POST entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/entries/:id ───────────────────────────────────────────────────

router.patch('/entries/:id', authenticate, uploadEntryPhoto, async (req, res) => {
  try {
    // Check ownership: only author or trip owner/admin can edit
    const entry = await pool.query(
      `SELECT e.*, t.owner_id AS trip_owner_id FROM entries e JOIN trips t ON t.id = e.trip_id WHERE e.id = $1`,
      [req.params.id]
    );
    if (entry.rows.length === 0) return res.status(404).json({ error: 'Entry not found' });

    const e      = entry.rows[0];
    const userId = req.user.id;

    // Check if user is author, trip owner, or admin collaborator
    const isAuthor = e.author_id === userId;
    const isOwner  = e.trip_owner_id === userId;

    if (!isAuthor && !isOwner) {
      const collab = await pool.query(
        'SELECT role FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
        [e.trip_id, userId]
      );
      if (collab.rows.length === 0 || collab.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Only the entry author or a trip admin can edit this entry' });
      }
    }

    const { title, dateTime, location, story, type, photoUrl } = req.body;

    const updates = [];
    const values  = [];
    let   idx     = 1;

    // ── Handle photo upload (new file via multipart) ──────────────────────────
    if (req.file) {
      // Delete old photo from Cloudinary if it exists
      if (e.photo_public_id) {
        await cloudinary.v2.uploader.destroy(e.photo_public_id).catch(() => {});
      }
      updates.push(`photo_url = $${idx++}`);        values.push(req.file.path || req.file.secure_url || req.file.url);
      updates.push(`photo_public_id = $${idx++}`);  values.push(req.file.filename || req.file.public_id);
    } else if (photoUrl !== undefined) {
      // Plain URL passed (or empty string to clear the photo)
      updates.push(`photo_url = $${idx++}`);        values.push(photoUrl || null);
      if (photoUrl === '' || photoUrl === null) {
        if (e.photo_public_id) {
          await cloudinary.v2.uploader.destroy(e.photo_public_id).catch(() => {});
        }
        updates.push(`photo_public_id = $${idx++}`); values.push(null);
      }
    }

    if (title    !== undefined) { updates.push(`title = $${idx++}`);     values.push(title); }
    if (dateTime !== undefined) { updates.push(`date_time = $${idx++}`); values.push(dateTime || null); }
    if (location !== undefined) { updates.push(`location = $${idx++}`);  values.push(location); }
    if (story    !== undefined) { updates.push(`story = $${idx++}`);     values.push(story); }
    if (type     !== undefined) { updates.push(`type = $${idx++}`);      values.push(type); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    updates.push('updated_at = NOW()');
    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE entries SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING *, (SELECT display_name FROM users WHERE id = author_id) AS author_name,
                   (SELECT photo_url FROM users WHERE id = author_id) AS author_photo`,
      values
    );

    req.io?.to(`trip:${e.trip_id}`).emit('trip:entry_updated', { tripId: e.trip_id, entry: formatEntry(rows[0]) });

    res.json({ entry: formatEntry(rows[0]) });
  } catch (err) {
    console.error('PATCH entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/entries/:id ──────────────────────────────────────────────────

router.delete('/entries/:id', authenticate, async (req, res) => {
  try {
    const entry = await pool.query(
      `SELECT e.*, t.owner_id AS trip_owner_id FROM entries e JOIN trips t ON t.id = e.trip_id WHERE e.id = $1`,
      [req.params.id]
    );
    if (entry.rows.length === 0) return res.status(404).json({ error: 'Entry not found' });

    const e      = entry.rows[0];
    const userId = req.user.id;

    const isAuthor = e.author_id === userId;
    const isOwner  = e.trip_owner_id === userId;

    if (!isAuthor && !isOwner) {
      const collab = await pool.query(
        'SELECT role FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
        [e.trip_id, userId]
      );
      if (collab.rows.length === 0 || collab.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Only the entry author or a trip admin can delete this entry' });
      }
    }

    // Delete photo from Cloudinary if exists
    if (e.photo_public_id) {
      await cloudinary.v2.uploader.destroy(e.photo_public_id).catch(() => {});
    }

    await pool.query('DELETE FROM entries WHERE id = $1', [req.params.id]);

    req.io?.to(`trip:${e.trip_id}`).emit('trip:entry_deleted', { tripId: e.trip_id, entryId: req.params.id });

    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error('DELETE entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
