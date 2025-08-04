import axios from 'axios';

export async function getPlaces() {
  const res = await axios.get('/api/places');
  return res.data;
} 