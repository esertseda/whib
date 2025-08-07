import express from 'express';
import upload from '../config/cloudinary.js'; // .js uzantısını ESM'de eklemek şart
// Cloudinary'den gelen URL'yi döndürüyoruz
const router = express.Router();

router.post('/image', upload.single('image'), (req, res) => {
  try {
    // req.file.path, Cloudinary’deki gerçek görsel URL'sidir
    res.json({ imageUrl: req.file.path });
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

export default router;