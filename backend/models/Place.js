import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  country: { type: String, required: true },
  city: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  visitedAt: { type: Date },
  photoUrl: { type: String },
  wishlist: { type: Boolean, default: false },
  category: { type: String },
  notes: { type: String },
});

export default mongoose.model('Place', placeSchema); 