import express from 'express';
import upload from '../config/cloudinary.js'; // .js uzantısını ESM'de eklemek şart

const router = express.Router();

router.post('/image', upload.single('image'), (req, res) => {
  res.json({ imageUrl: req.file.path });
});

export default router;
