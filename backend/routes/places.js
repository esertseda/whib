import express from 'express';
import multer from 'multer';
import Place from '../models/Place.js';
import auth from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinaryUpload from '../config/cloudinary.js';

const router = express.Router();

// Use Cloudinary for photo uploads
const upload = cloudinaryUpload;

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
    
    const photoUrl = req.file ? req.file.path : '';
    
    const placeData = {
      userId: req.userId,
      title,
      description,
      country,
      city,
      coordinates: { lat, lng },
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
      coordinates: { lat, lng },
      visitedAt,
      notes,
    };
    if (req.file) {
      updateData.photoUrl = req.file.path;
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

export default router; 