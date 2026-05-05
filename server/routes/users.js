const express  = require('express');
const pool     = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { authenticate } = require('../middleware/auth');
const { uploadProfilePhoto } = require('../middleware/upload');

const router = express.Router();

// ─── GET /api/users/me ───────────────────────────────────────────────────────

router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, display_name, photo_url, provider, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const u = rows[0];
    res.json({
      user: {
        id:          u.id,
        email:       u.email,
        displayName: u.display_name,
        photoUrl:    u.photo_url,
        provider:    u.provider,
        createdAt:   u.created_at,
      },
    });
  } catch (err) {
    console.error('GET /users/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/users/me ─────────────────────────────────────────────────────

router.patch('/me', authenticate, uploadProfilePhoto, async (req, res) => {
  try {
    const { displayName } = req.body;
    let photoUrl = undefined;
    let photoPublicId = undefined;

    if (req.file) {
      photoUrl      = req.file.path || req.file.secure_url || req.file.url;
      photoPublicId = req.file.filename || req.file.public_id;
    }

    const updates = [];
    const values  = [];
    let   idx     = 1;

    if (displayName !== undefined) {
      updates.push(`display_name = $${idx++}`);
      values.push(displayName);
    }
    if (photoUrl) {
      updates.push(`photo_url = $${idx++}`);
      values.push(photoUrl);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    updates.push('updated_at = NOW()');
    values.push(req.user.id);

    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, display_name, photo_url`,
      values
    );

    const u = rows[0];
    res.json({
      user: {
        id:          u.id,
        email:       u.email,
        displayName: u.display_name,
        photoUrl:    u.photo_url,
      },
    });
  } catch (err) {
    console.error('PATCH /users/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/users/me/stats ─────────────────────────────────────────────────

router.get('/me/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [tripsOwned, tripsCollab, entriesWritten] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM trips WHERE owner_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM trip_collaborators WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM entries WHERE author_id = $1', [userId]),
    ]);

    res.json({
      stats: {
        tripsOwned:    parseInt(tripsOwned.rows[0].count),
        tripsShared:   parseInt(tripsCollab.rows[0].count),
        totalTrips:    parseInt(tripsOwned.rows[0].count) + parseInt(tripsCollab.rows[0].count),
        entriesWritten: parseInt(entriesWritten.rows[0].count),
      },
    });
  } catch (err) {
    console.error('stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/users/search?email= ───────────────────────────────────────────
// Used by invite flow to look up a user by email

router.get('/search', authenticate, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email query param required' });

    const { rows } = await pool.query(
      'SELECT id, email, display_name, photo_url FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No user found with that email' });
    }

    const u = rows[0];
    // Don't expose own profile in search (can't invite yourself)
    if (u.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot invite yourself' });
    }

    res.json({
      user: {
        id:          u.id,
        email:       u.email,
        displayName: u.display_name,
        photoUrl:    u.photo_url,
      },
    });
  } catch (err) {
    console.error('user search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/users/me ────────────────────────────────────────────────────

router.delete('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Gather all Cloudinary public_ids associated with this user
    const tripCovers = await pool.query(
      'SELECT cover_image_public_id AS public_id FROM trips WHERE owner_id = $1 AND cover_image_public_id IS NOT NULL',
      [userId]
    );
    const entryPhotos = await pool.query(
      'SELECT photo_public_id AS public_id FROM entries WHERE author_id = $1 AND photo_public_id IS NOT NULL',
      [userId]
    );
    const galleryPhotos = await pool.query(
      'SELECT public_id FROM trip_photos WHERE uploader_id = $1 AND public_id IS NOT NULL',
      [userId]
    );

    const publicIdsToDelete = [
      ...tripCovers.rows.map(r => r.public_id),
      ...entryPhotos.rows.map(r => r.public_id),
      ...galleryPhotos.rows.map(r => r.public_id),
    ];

    // Delete in chunks of 100 (Cloudinary API limit)
    if (publicIdsToDelete.length > 0) {
      for (let i = 0; i < publicIdsToDelete.length; i += 100) {
        const chunk = publicIdsToDelete.slice(i, i + 100);
        await cloudinary.v2.api.delete_resources(chunk).catch(err => console.error('Cloudinary bulk delete error:', err));
      }
    }

    // CASCADE deletes trips, entries, activities, photos, collaborators, invitations
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.clearCookie('refreshToken');
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('delete account error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
