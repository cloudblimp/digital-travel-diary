const express  = require('express');
const pool     = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { authenticate } = require('../middleware/auth');
const { uploadTripCover } = require('../middleware/upload');
const { requireTripAccess, requireAdmin, requireOwner } = require('../middleware/tripAccess');

const router = express.Router();

// Helper: format a trip row for API response
function formatTrip(row, myRole = 'owner') {
  return {
    id:          row.id,
    ownerId:     row.owner_id,
    title:       row.title,
    destination: row.destination,
    startDate:   row.start_date,
    endDate:     row.end_date,
    description: row.description,
    coverImage:  row.cover_image,
    locations:   row.locations || [],
    isArchived:  row.is_archived,
    archivedAt:  row.archived_at,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
    myRole,
  };
}

// ─── GET /api/trips ───────────────────────────────────────────────────────────
// Returns owned trips + collaborated trips, each with myRole

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT t.*,
         CASE WHEN t.owner_id = $1 THEN 'owner' ELSE tc.role::text END AS my_role
       FROM trips t
       LEFT JOIN trip_collaborators tc ON tc.trip_id = t.id AND tc.user_id = $1
       WHERE t.owner_id = $1 OR tc.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json({ trips: rows.map(r => formatTrip(r, r.my_role)) });
  } catch (err) {
    console.error('GET /trips error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/trips ──────────────────────────────────────────────────────────

router.post('/', authenticate, uploadTripCover, async (req, res) => {
  try {
    const { title, destination, startDate, endDate, description, locations } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    let coverImage = null;
    let coverPublicId = null;

    if (req.file) {
      coverImage    = req.file.path || req.file.secure_url || req.file.url;
      coverPublicId = req.file.filename || req.file.public_id;
    }

    let parsedLocations = [];
    if (locations) {
      try {
        parsedLocations = typeof locations === 'string' ? JSON.parse(locations) : locations;
      } catch { parsedLocations = []; }
    }

    const { rows } = await pool.query(
      `INSERT INTO trips (owner_id, title, destination, start_date, end_date, description, cover_image, cover_image_public_id, locations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, title, destination, startDate || null, endDate || null, description, coverImage, coverPublicId, JSON.stringify(parsedLocations)]
    );

    const trip = rows[0];
    req.io?.emit('trip:created', { tripId: trip.id }); // optional broadcast

    res.status(201).json({ trip: formatTrip(trip, 'owner') });
  } catch (err) {
    console.error('POST /trips error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/trips/:id ───────────────────────────────────────────────────────

router.get('/:id', authenticate, requireTripAccess, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM trips WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Trip not found' });

    res.json({ trip: formatTrip(rows[0], req.tripRole) });
  } catch (err) {
    console.error('GET /trips/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/trips/:id ─────────────────────────────────────────────────────

router.patch('/:id', authenticate, requireTripAccess, requireAdmin, uploadTripCover, async (req, res) => {
  try {
    const { title, destination, startDate, endDate, description, locations } = req.body;

    const updates = [];
    const values  = [];
    let   idx     = 1;

    if (title       !== undefined) { updates.push(`title = $${idx++}`);       values.push(title); }
    if (destination !== undefined) { updates.push(`destination = $${idx++}`); values.push(destination); }
    if (startDate   !== undefined) { updates.push(`start_date = $${idx++}`);  values.push(startDate || null); }
    if (endDate     !== undefined) { updates.push(`end_date = $${idx++}`);    values.push(endDate || null); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
    if (locations   !== undefined) {
      let parsed = typeof locations === 'string' ? JSON.parse(locations) : locations;
      updates.push(`locations = $${idx++}`);
      values.push(JSON.stringify(parsed));
    }

    if (req.file) {
      // Delete old cover from Cloudinary
      const old = await pool.query('SELECT cover_image_public_id FROM trips WHERE id = $1', [req.params.id]);
      if (old.rows[0]?.cover_image_public_id) {
        await cloudinary.v2.uploader.destroy(old.rows[0].cover_image_public_id).catch(() => {});
      }
      updates.push(`cover_image = $${idx++}`);          values.push(req.file.path || req.file.secure_url || req.file.url);
      updates.push(`cover_image_public_id = $${idx++}`); values.push(req.file.filename || req.file.public_id);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    updates.push('updated_at = NOW()');
    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE trips SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    req.io?.to(`trip:${req.params.id}`).emit('trip:updated', { tripId: req.params.id });
    res.json({ trip: formatTrip(rows[0], req.tripRole) });
  } catch (err) {
    console.error('PATCH /trips/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/trips/:id ────────────────────────────────────────────────────

router.delete('/:id', authenticate, requireTripAccess, requireOwner, async (req, res) => {
  try {
    const tripId = req.params.id;

    // 1. Gather all Cloudinary public_ids associated with this trip
    const tripCover = await pool.query('SELECT cover_image_public_id AS public_id FROM trips WHERE id = $1 AND cover_image_public_id IS NOT NULL', [tripId]);
    const entryPhotos = await pool.query('SELECT photo_public_id AS public_id FROM entries WHERE trip_id = $1 AND photo_public_id IS NOT NULL', [tripId]);
    const galleryPhotos = await pool.query('SELECT public_id FROM trip_photos WHERE trip_id = $1 AND public_id IS NOT NULL', [tripId]);

    const publicIdsToDelete = [
      ...tripCover.rows.map(r => r.public_id),
      ...entryPhotos.rows.map(r => r.public_id),
      ...galleryPhotos.rows.map(r => r.public_id),
    ];

    // 2. Bulk delete from Cloudinary
    if (publicIdsToDelete.length > 0) {
      for (let i = 0; i < publicIdsToDelete.length; i += 100) {
        const chunk = publicIdsToDelete.slice(i, i + 100);
        await cloudinary.v2.api.delete_resources(chunk).catch(err => console.error('Cloudinary bulk delete error:', err));
      }
    }

    // 3. Delete from DB (CASCADE handles entries, activities, photos, etc.)
    await pool.query('DELETE FROM trips WHERE id = $1', [tripId]);

    req.io?.to(`trip:${tripId}`).emit('trip:deleted', { tripId });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error('DELETE /trips/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/trips/:id/archive ────────────────────────────────────────────

router.patch('/:id/archive', authenticate, requireTripAccess, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE trips SET is_archived = true, archived_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json({ trip: formatTrip(rows[0], req.tripRole) });
  } catch (err) {
    console.error('archive error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/trips/:id/unarchive ──────────────────────────────────────────

router.patch('/:id/unarchive', authenticate, requireTripAccess, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE trips SET is_archived = false, archived_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json({ trip: formatTrip(rows[0], req.tripRole) });
  } catch (err) {
    console.error('unarchive error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
