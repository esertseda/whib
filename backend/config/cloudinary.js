import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary configuration with error handling
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary configuration missing:');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName ? 'set' : 'missing');
  console.error('CLOUDINARY_API_KEY:', apiKey ? 'set' : 'missing');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? 'set' : 'missing');
  throw new Error('Cloudinary environment variables are not properly configured');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

console.log('Cloudinary configured successfully with cloud_name:', cloudName);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Cloudinary içinde klasör ismi
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const upload = multer({ storage });

export default upload;
