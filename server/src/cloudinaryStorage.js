import { nanoid } from 'nanoid';
import cloudinary from './cloudinary.js';

// A minimal multer storage engine that streams uploads straight to
// Cloudinary instead of local disk. multer-storage-cloudinary was skipped
// here since its latest release still peer-depends on Cloudinary v1.
export function cloudinaryStorage({ folder, resourceType = 'auto' }) {
  return {
    _handleFile(req, file, cb) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, public_id: nanoid(16) },
        (err, result) => {
          if (err) return cb(err);
          cb(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
        }
      );
      file.stream.pipe(uploadStream);
    },
    _removeFile(req, file, cb) {
      cb(null);
    },
  };
}
