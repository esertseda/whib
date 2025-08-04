import axios from 'axios';

export async function getWishlist() {
  const res = await axios.get('/api/places?wishlist=true');
  return res.data;
}

export async function addWishlistPlace(data) {
  console.log('addWishlistPlace called with data:', data);
  
  const fd = new FormData();
  fd.append('title', data.title);
  fd.append('country', data.country);
  fd.append('city', data.city);
  fd.append('lat', data.lat);
  fd.append('lng', data.lng);
  fd.append('wishlist', 'true');
  if (data.category) fd.append('category', data.category);
  if (data.notes) fd.append('notes', data.notes);
  if (data.photo) fd.append('photo', data.photo);
  
  // Log FormData contents
  for (let [key, value] of fd.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  // No visitedAt for wishlist
  try {
    console.log('Making POST request to /api/places');
    const res = await axios.post('/api/places', fd);
    console.log('Response received:', res.data);
    return res.data;
  } catch (err) {
    console.error('Error in addWishlistPlace:', err);
    console.error('Error response:', err.response);
    console.error('Error status:', err.response?.status);
    console.error('Error data:', err.response?.data);
    
    if (err.response && err.response.status === 409) {
      // Duplicate city, do not throw
      console.log('Duplicate city detected, returning null');
      return null;
    }
    throw err;
  }
}

export async function removeWishlistCity(id) {
  await axios.delete(`/api/places/${id}`);
}

export async function updateWishlistPlace(id, data) {
  const fd = new FormData();
  if (data.title) fd.append('title', data.title);
  if (data.country) fd.append('country', data.country);
  if (data.city) fd.append('city', data.city);
  if (data.lat) fd.append('lat', data.lat);
  if (data.lng) fd.append('lng', data.lng);
  if (data.category) fd.append('category', data.category);
  if (data.notes !== undefined) fd.append('notes', data.notes);
  if (data.photo) fd.append('photo', data.photo);
  
  try {
    const res = await axios.put(`/api/places/${id}`, fd);
    return res.data;
  } catch (err) {
    throw err;
  }
} 