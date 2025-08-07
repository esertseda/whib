import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Place from './models/Place.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whib';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateToCloudinary() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const places = await Place.find({ photoUrl: { $exists: true, $ne: '' } });
    console.log(`Found ${places.length} places with photos`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const place of places) {
      if (!place.photoUrl) continue;

      // Eğer zaten Cloudinary URL'i ise, atla
      if (place.photoUrl.startsWith('http://') || place.photoUrl.startsWith('https://')) {
        console.log(`Place ${place.title}: Already Cloudinary URL, skipping`);
        skippedCount++;
        continue;
      }

      // Eğer uploads path ise, dosyayı Cloudinary'ye yükle
      if (place.photoUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, place.photoUrl);
        
        if (fs.existsSync(filePath)) {
          try {
            console.log(`Uploading ${place.title} photo to Cloudinary...`);
            
            const result = await cloudinary.uploader.upload(filePath, {
              folder: 'uploads',
              transformation: [{ width: 800, height: 600, crop: 'limit' }]
            });

            // Veritabanını güncelle
            await Place.updateOne(
              { _id: place._id },
              { $set: { photoUrl: result.secure_url } }
            );

            console.log(`✓ Migrated ${place.title}: ${place.photoUrl} -> ${result.secure_url}`);
            migratedCount++;

            // Dosyayı sil (opsiyonel)
            // fs.unlinkSync(filePath);
            // console.log(`Deleted local file: ${filePath}`);

          } catch (uploadError) {
            console.error(`✗ Failed to upload ${place.title}:`, uploadError.message);
          }
        } else {
          console.log(`✗ File not found: ${filePath}`);
        }
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Migrated: ${migratedCount} photos`);
    console.log(`- Skipped: ${skippedCount} photos (already Cloudinary)`);
    console.log(`- Total processed: ${places.length} places`);

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateToCloudinary();
