import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whib';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Place model (basit versiyon)
const PlaceSchema = new mongoose.Schema({
  userId: String,
  title: String,
  description: String,
  country: String,
  city: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  visitedAt: Date,
  photoUrl: String,
  wishlist: Boolean,
  category: String,
  notes: String
});

const Place = mongoose.model('Place', PlaceSchema);

async function migrateToCloudinary() {
  try {
    console.log('Starting migration to Cloudinary...');
    
    // Mevcut local fotoğrafları bul
    const places = await Place.find({ 
      photoUrl: { $regex: /^\/uploads\// } 
    });
    
    console.log(`Found ${places.length} places with local photos to migrate`);
    
    for (const place of places) {
      try {
        const localPath = path.join(__dirname, 'uploads', place.photoUrl.replace('/uploads/', ''));
        
        if (fs.existsSync(localPath)) {
          console.log(`Uploading ${localPath} to Cloudinary...`);
          
          // Cloudinary'ye yükle
          const result = await cloudinary.uploader.upload(localPath, {
            folder: 'uploads',
            transformation: [{ width: 800, height: 600, crop: 'limit' }]
          });
          
          // Database'i güncelle
          await Place.updateOne(
            { _id: place._id },
            { $set: { photoUrl: result.secure_url } }
          );
          
          console.log(`✅ Migrated: ${place.title} -> ${result.secure_url}`);
        } else {
          console.log(`❌ File not found: ${localPath}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating ${place.title}:`, error.message);
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

migrateToCloudinary();
