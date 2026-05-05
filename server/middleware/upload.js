const multer = require('multer');
const CloudinaryStorage = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Create a multer instance that uploads to a given Cloudinary folder.
 * @param {string} folder  — e.g. 'trip-covers', 'entry-photos', 'trip-gallery', 'profile-pictures'
 * @param {number} [maxMB] — file size limit in MB (default 10)
 */
function makeUploader(folder, maxMB = 10) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         `journeystack/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  });
}

// Pre-built uploaders for each use case
const uploadTripCover    = makeUploader('trip-covers').single('coverImage');
const uploadEntryPhoto   = makeUploader('entry-photos').single('photo');
const uploadGalleryPhoto = makeUploader('trip-gallery').array('photos', 20);
const uploadProfilePhoto = makeUploader('profile-pictures', 5).single('photo');

/**
 * Wraps a multer handler so errors return JSON instead of crashing.
 */
function handleUpload(multerFn) {
  return (req, res, next) => {
    multerFn(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      next();
    });
  };
}

module.exports = {
  uploadTripCover:    handleUpload(uploadTripCover),
  uploadEntryPhoto:   handleUpload(uploadEntryPhoto),
  uploadGalleryPhoto: handleUpload(uploadGalleryPhoto),
  uploadProfilePhoto: handleUpload(uploadProfilePhoto),
};
