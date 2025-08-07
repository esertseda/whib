import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Place from './models/Place.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whib';

async function fixPhotoUrls() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const places = await Place.find({ photoUrl: { $exists: true, $ne: '' } });
    console.log(`Found ${places.length} places with photos`);

    let updatedCount = 0;
    for (const place of places) {
      if (place.photoUrl && place.photoUrl.startsWith('/uploads/')) {
        // URL zaten doğru formatta, değişiklik gerekmez
        console.log(`Place ${place.title}: URL already correct`);
        continue;
      }

      if (place.photoUrl && !place.photoUrl.startsWith('http')) {
        // Relative path'i absolute path'e çevir
        const newPhotoUrl = `/uploads/${place.photoUrl.split('/').pop()}`;
        await Place.updateOne(
          { _id: place._id },
          { $set: { photoUrl: newPhotoUrl } }
        );
        console.log(`Updated ${place.title}: ${place.photoUrl} -> ${newPhotoUrl}`);
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} photo URLs`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPhotoUrls();
