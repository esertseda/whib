import express from 'express';
import multer from 'multer';
import Place from '../models/Place.js';
import auth from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Temporary local storage configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const router = express.Router();

// Get all places for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.wishlist === 'true') {
      filter.wishlist = true;
    } else if (req.query.wishlist === 'false') {
      filter.wishlist = false;
    }
    const places = await Place.find(filter);
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new place
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    console.log('POST /api/places - Request body:', req.body);
    console.log('POST /api/places - User ID:', req.userId);
    console.log('POST /api/places - File:', req.file);
    
    const { title, description, country, city, lat, lng, visitedAt, wishlist, category, notes } = req.body;
    
    console.log('Parsed data:', { title, description, country, city, lat, lng, visitedAt, wishlist, category, notes });
    
    // Prevent duplicate city in wishlist for the same user
    if (wishlist === 'true' || wishlist === true) {
      if (category === 'city') {
        const exists = await Place.findOne({ userId: req.userId, city, category: 'city', wishlist: true });
        if (exists) {
          console.log('Duplicate city detected');
          return res.status(409).json({ message: 'City already in wishlist' });
        }
      }
    }
    
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.photoUrl || '');
    
    const placeData = {
      userId: req.userId,
      title,
      description,
      country,
      city,
      coordinates: { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 },
      visitedAt,
      photoUrl,
      wishlist: wishlist === 'true' || wishlist === true,
      category,
      notes,
    };
    
    console.log('Creating place with data:', placeData);
    
    const place = new Place(placeData);
    await place.save();
    
    console.log('Place saved successfully:', place);
    res.status(201).json(place);
  } catch (err) {
    console.error('Error in POST /api/places:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a place
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, country, city, lat, lng, visitedAt, notes } = req.body;
    const updateData = {
      title,
      description,
      country,
      city,
      coordinates: { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 },
      visitedAt,
      notes,
    };
    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    }
    const place = await Place.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a place
router.delete('/:id', auth, async (req, res) => {
  try {
    const place = await Place.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json({ message: 'Place deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Temporary endpoint to fix existing photo URLs
router.get('/fix-photos', auth, async (req, res) => {
  try {
    const places = await Place.find({ userId: req.userId, photoUrl: { $exists: true, $ne: '' } });
    let fixedCount = 0;
    
    for (const place of places) {
      if (place.photoUrl && place.photoUrl.startsWith('/uploads/')) {
        // Convert local path to production URL
        const newPhotoUrl = `https://whib.onrender.com${place.photoUrl}`;
        await Place.updateOne(
          { _id: place._id },
          { $set: { photoUrl: newPhotoUrl } }
        );
        fixedCount++;
      }
    }
    
    res.json({ 
      message: `Fixed ${fixedCount} photo URLs`,
      fixedCount 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Migration endpoint to move photos to Cloudinary
router.post('/migrate-to-cloudinary', auth, async (req, res) => {
  try {
    const places = await Place.find({ userId: req.userId, photoUrl: { $exists: true, $ne: '' } });
    let migratedCount = 0;
    
    for (const place of places) {
      if (place.photoUrl && place.photoUrl.startsWith('https://whib.onrender.com/uploads/')) {
        // Extract filename from URL
        const filename = place.photoUrl.split('/').pop();
        const localPath = `./uploads/${filename}`;
        
        try {
          // Upload to Cloudinary
          const cloudinary = require('cloudinary').v2;
          const result = await cloudinary.uploader.upload(localPath, {
            folder: 'whib-uploads'
          });
          
          // Update place with Cloudinary URL
          await Place.updateOne(
            { _id: place._id },
            { $set: { photoUrl: result.secure_url } }
          );
          
          migratedCount++;
        } catch (uploadError) {
          console.error(`Failed to upload ${filename}:`, uploadError);
        }
      }
    }
    
    res.json({ 
      message: `Migrated ${migratedCount} photos to Cloudinary`,
      migratedCount 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 