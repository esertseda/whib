import express from 'express';
import Place from '../models/Place.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const places = await Place.find({ userId: req.userId });
    const total = places.length;
    const countryCounts = {};
    places.forEach(place => {
      countryCounts[place.country] = (countryCounts[place.country] || 0) + 1;
    });
    const countries = Object.keys(countryCounts).length;
    res.json({
      total,
      countries,
      countryCounts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 