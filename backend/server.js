import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import fs from 'fs';


import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import placesRoutes from './routes/places.js';
import statsRoutes from './routes/stats.js';
import travelInfoRoutes from './routes/travelInfo.js';
import geocodingRoutes from './routes/geocoding.js';



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whib';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
import uploadRoutes from './routes/upload.js';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 saniye timeout
  socketTimeoutMS: 45000, // 45 saniye socket timeout
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  if (err.message.includes('Atlas cluster')) {
    console.log('MongoDB Atlas IP whitelist issue detected.');
    console.log('Please add your current IP to MongoDB Atlas whitelist:');
    console.log('1. Go to MongoDB Atlas dashboard');
    console.log('2. Click on "Network Access"');
    console.log('3. Click "Add IP Address"');
    console.log('4. Add your current IP or use "0.0.0.0/0" for all IPs (not recommended for production)');
  } else {
    console.log('Please make sure MongoDB is running on your system');
  }
});

// Routes placeholder
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/travel-info', travelInfoRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Where Have I Been? API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 

console.log("Current working directory:", process.cwd());
