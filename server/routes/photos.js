const express  = require('express');
const pool     = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { authenticate } = require('../middleware/auth');
const { requireTripAccess } = require('../middleware/tripAccess');
const { uploadGalleryPhoto } = require('../middleware/upload');

const router = express.Router();

// ─── GET /api/trips/:tripId/photos ────────────────────────────────────────────

router.get('/trips/:tripId/photos', authenticate, requireTripAccess, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.display_name AS uploader_name
       FROM trip_photos p
       JOIN users u ON u.id = p.uploader_id
       WHERE p.trip_id = $1
       ORDER BY p.uploaded_at DESC`,
      [req.params.tripId]
    );

    const photos = rows.map(r => ({
      id:           r.id,
      tripId:       r.trip_id,
      uploaderId:   r.uploader_id,
      uploaderName: r.uploader_name,
      photoUrl:     r.photo_url,
      fileName:     r.file_name,
      caption:      r.caption,
      uploadedAt:   r.uploaded_at,
    }));

    res.json({ photos });
  } catch (err) {
    console.error('GET photos error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/trips/:tripId/photos ──────────────────────────────────────────

router.post('/trips/:tripId/photos', authenticate, requireTripAccess, uploadGalleryPhoto, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const inserted = [];

    for (const file of req.files) {
      const photoUrl = file.path || file.secure_url || file.url;
      const publicId = file.filename || file.public_id;
      
      const { rows } = await pool.query(
        `INSERT INTO trip_photos (trip_id, uploader_id, photo_url, public_id, file_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.params.tripId, req.user.id, photoUrl, publicId, file.originalname]
      );
      inserted.push({
        id:           rows[0].id,
        tripId:       rows[0].trip_id,
        uploaderId:   rows[0].uploader_id,
        uploaderName: req.user.displayName,
        photoUrl:     rows[0].photo_url,
        fileName:     rows[0].file_name,
        caption:      rows[0].caption,
        uploadedAt:   rows[0].uploaded_at,
      });
    }

    req.io?.to(`trip:${req.params.tripId}`).emit('trip:photos_added', {
      tripId: req.params.tripId,
      photos: inserted,
    });

    res.status(201).json({ photos: inserted });
  } catch (err) {
    console.error('POST photo error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/photos/:id ───────────────────────────────────────────────────

router.delete('/photos/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, t.owner_id AS trip_owner_id FROM trip_photos p JOIN trips t ON t.id = p.trip_id WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Photo not found' });

    const photo  = result.rows[0];
    const userId = req.user.id;

    const isUploader = photo.uploader_id === userId;
    const isOwner    = photo.trip_owner_id === userId;

    if (!isUploader && !isOwner) {
      const collab = await pool.query(
        'SELECT role FROM trip_collaborators WHERE trip_id = $1 AND user_id = $2',
        [photo.trip_id, userId]
      );
      if (collab.rows.length === 0 || collab.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Only the uploader or a trip admin can delete this photo' });
      }
    }

    if (photo.public_id) {
      await cloudinary.v2.uploader.destroy(photo.public_id).catch(() => {});
    }

    await pool.query('DELETE FROM trip_photos WHERE id = $1', [req.params.id]);

    req.io?.to(`trip:${photo.trip_id}`).emit('trip:photo_deleted', { tripId: photo.trip_id, photoId: req.params.id });

    res.json({ message: 'Photo deleted' });
  } catch (err) {
    console.error('DELETE photo error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
