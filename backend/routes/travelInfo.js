import express from 'express';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || '31223650-6e2e2e2e2e2e2e2e2e2e2e2e2'; // demo key

  // Helper: get city coordinates from Wikipedia GeoSearch
async function getCityCoords(city) {
  // Use Wikipedia API to get coordinates for the city
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(city)}&format=json&origin=*`;
  try {
    const searchRes = await axios.get(url);
    const searchResults = searchRes.data.query.search;
    // Log search results for debugging
    console.log('Wikipedia search results for', city, searchResults);
    for (const result of searchResults) {
      const pageTitle = result.title;
      const coordUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=coordinates&format=json&origin=*`;
      const coordRes = await axios.get(coordUrl);
      const pages = coordRes.data.query.pages;
      const page = Object.values(pages)[0];
      if (page.coordinates && page.coordinates.length > 0) {
        return { lat: page.coordinates[0].lat, lon: page.coordinates[0].lon };
      }
    }
    // If no coordinates found in any result
    return { lat: 41.0082, lon: 28.9784 };
  } catch (err) {
    // fallback: Istanbul coords
    return { lat: 41.0082, lon: 28.9784 };
  }
}

// Helper: get attractions from Wikipedia GeoSearch
async function getAttractions(lat, lon) {
  // Wikipedia GeoSearch for attractions
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=${lat}|${lon}&gslimit=10&format=json&origin=*`;
  try {
    const res = await axios.get(wikiUrl);
    return (res.data.query.geosearch || []).map(item => ({
      name: item.title,
      dist: item.dist,
      xid: item.pageid,
      kinds: 'wikipedia'
    }));
  } catch {
    // Dummy fallback
    return [
      { name: 'Main Square', dist: 100, xid: 'dummy1', kinds: 'sight' },
      { name: 'City Museum', dist: 500, xid: 'dummy2', kinds: 'museum' }
    ];
  }
}

// Helper: get photos from Unsplash
async function getPhotos(city, country) {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (!UNSPLASH_ACCESS_KEY) return [];
  const query = country ? `${city}, ${country}` : city;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
  try {
    const res = await axios.get(url);
    return (res.data.results || []).map(photo => ({
      url: photo.urls.regular,
      alt: photo.alt_description || query
    }));
  } catch {
    // Dummy fallback
    return [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80', alt: query },
      { url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80', alt: query }
    ];
  }
}

// Helper: get photo for a specific place from Unsplash
async function getPlacePhoto(placeName, city) {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (!UNSPLASH_ACCESS_KEY) return null;
  
  try {
    // Search for the specific place name
    const query = `${placeName}, ${city}`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
    const res = await axios.get(url);
    
    if (res.data.results && res.data.results.length > 0) {
      return res.data.results[0].urls.regular;
    }
    
    // If no specific photo found, try just the place name
    const fallbackUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
    const fallbackRes = await axios.get(fallbackUrl);
    
    if (fallbackRes.data.results && fallbackRes.data.results.length > 0) {
      return fallbackRes.data.results[0].urls.regular;
    }
    
    return null;
  } catch (err) {
    console.error('Error fetching place photo:', err);
    return null;
  }
}

// Helper: get cultural tips from local JSON
async function getCulturalTips(city) {
  const tipsPath = path.join(__dirname, '../culturalTips.json');
  try {
    const data = await fs.readFile(tipsPath, 'utf-8');
    const tips = JSON.parse(data);
    return tips[city.toLowerCase()] || [];
  } catch {
    return [];
  }
}

// Helper: get popular and recommended places from Foursquare Places API
async function getFoursquarePlaces(lat, lon) {
  const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;
  if (!FOURSQUARE_API_KEY) return [];
  const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&sort=POPULARITY&limit=10`;
  try {
    const res = await axios.get(url, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json'
      }
    });
    // Map results to a simple structure
    return (res.data.results || []).map(place => ({
      name: place.name,
      categories: place.categories?.map(c => c.name) || [],
      address: place.location?.formatted_address || '',
      distance: place.distance,
      fsq_id: place.fsq_id,
      link: place.website || '',
      geocodes: place.geocodes?.main || null,
      rating: place.rating || null
    }));
  } catch (err) {
    console.error('Foursquare API error:', err.response?.data || err.message);
    return [];
  }
}

// Helper: get restaurants, cafes, and bars from Yelp Fusion API
async function getYelpPlaces(city, country, categories) {
  const YELP_API_KEY = process.env.YELP_API_KEY;
  if (!YELP_API_KEY) return [];
  const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(city + ', ' + country)}&categories=${categories}&limit=10&sort_by=rating`;
  try {
    const res = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
        'Accept': 'application/json',
      }
    });
    return (res.data.businesses || []).map(place => ({
      name: place.name,
      categories: place.categories?.map(c => c.title) || [],
      address: place.location?.display_address?.join(', ') || '',
      rating: place.rating,
      review_count: place.review_count,
      url: place.url,
      phone: place.display_phone,
      id: place.id,
      image_url: place.image_url,
      coordinates: place.coordinates || {},
      price: place.price || '',
    }));
  } catch (err) {
    console.error('Yelp API error:', err.response?.data || err.message);
    return [];
  }
}

// Helper: get country info from REST Countries API
async function getCountryInfo(country) {
  if (!country) return null;
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`;
  try {
    const res = await axios.get(url);
    const data = res.data && res.data[0];
    if (!data) return null;
    return {
      name: data.name?.common || country,
      official: data.name?.official || '',
      flag: data.flags?.svg || data.flags?.png || '',
      capital: data.capital?.[0] || '',
      region: data.region || '',
      subregion: data.subregion || '',
      population: data.population || '',
      area: data.area || '',
      languages: data.languages ? Object.values(data.languages).join(', ') : '',
      currencies: data.currencies ? Object.values(data.currencies).map(c => c.name).join(', ') : '',
      maps: data.maps?.googleMaps || '',
      coatOfArms: data.coatOfArms?.svg || '',
      timezones: data.timezones || [],
      demonyms: data.demonyms?.eng?.m || ''
    };
  } catch (err) {
    console.error('REST Countries API error:', err.response?.data || err.message);
    return null;
  }
}

// Helper: get city summary from Wikipedia API
async function getCitySummary(city) {
  if (!city) return '';
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`;
  try {
    const res = await axios.get(url);
    return res.data.extract || '';
  } catch (err) {
    console.error('Wikipedia summary API error:', err.response?.data || err.message);
    return '';
  }
}

// Helper: format categories for better display
function formatCategories(categories) {
  if (!categories || !Array.isArray(categories)) return '';
  
  const categoryMap = {
    'building.historic': 'Historic Building',
    'building.place_of_worship': 'Place of Worship',
    'religion.place_of_worship.christianity': 'Church',
    'tourism.sights.place_of_worship': 'Religious Site',
    'tourism.sights.place_of_worship.church': 'Church',
    'tourism.sights': 'Tourist Attraction',
    'tourism.museum': 'Museum',
    'tourism.gallery': 'Gallery',
    'tourism.artwork': 'Artwork',
    'tourism.viewpoint': 'Viewpoint',
    'tourism.attraction': 'Attraction',
    'historic.castle': 'Castle',
    'historic.palace': 'Palace',
    'historic.monument': 'Monument',
    'historic.memorial': 'Memorial',
    'historic.archaeological_site': 'Archaeological Site',
    'leisure.park': 'Park',
    'leisure.garden': 'Garden',
    'amenity.restaurant': 'Restaurant',
    'amenity.cafe': 'Cafe',
    'amenity.bar': 'Bar',
    'amenity.hotel': 'Hotel',
    'shop.mall': 'Shopping Mall',
    'shop.department_store': 'Department Store'
  };
  
  // Get the most relevant category
  const relevantCategory = categories.find(cat => categoryMap[cat]) || categories[0];
  return categoryMap[relevantCategory] || relevantCategory?.split('.').pop()?.replace(/_/g, ' ') || 'Tourist Site';
}

// Helper: get tourist places from Geoapify Places API
async function getGeoapifyPlaces(lat, lon, city) {
  const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
  if (!GEOAPIFY_API_KEY) return [];
  const radius = 5000; // meters
  const limit = 10;
  const url = `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lon},${lat},${radius}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;
  try {
    const res = await axios.get(url);
    const places = res.data.features || [];
    
    // Get photos for each place
    const placesWithPhotos = await Promise.all(places.map(async (f) => {
      const p = f.properties;
      const placeName = p.name || p.address_line1 || '';
      
      // Try to get photo for this place
      let photoUrl = p.datasource?.raw?.image || '';
      if (!photoUrl && placeName) {
        photoUrl = await getPlacePhoto(placeName, city);
      }
      
      return {
        name: placeName,
        address: p.formatted || '',
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        category: formatCategories(p.categories),
        kinds: p.datasource?.raw?.kinds || '',
        description: p.datasource?.raw?.description || '',
        image: photoUrl,
        website: p.website || '',
        osm_id: p.osm_id || '',
        place_id: p.place_id || '',
      };
    }));
    
    return placesWithPhotos;
  } catch (err) {
    console.error('Geoapify Places API error:', err.response?.data || err.message);
    return [];
  }
}

router.get('/', async (req, res) => {
  const rawCity = req.query.city;
  console.log('TRAVEL INFO REQUEST:', { city: rawCity });
  if (!rawCity) return res.status(400).json({ error: 'City is required' });
  const city = rawCity.split(':')[0].trim();
  const country = req.query.country || '';
  try {
    const coords = await getCityCoords(city);
    if (!coords) return res.status(404).json({ error: 'City not found' });
    const [attractions, photos, culturalTips, foursquare, countryInfo, citySummary, yelpRestaurants, yelpCafes, yelpBars, geoapifyPlaces] = await Promise.all([
      getAttractions(coords.lat, coords.lon),
      getPhotos(city, country),
      getCulturalTips(city),
      getFoursquarePlaces(coords.lat, coords.lon),
      getCountryInfo(country),
      getCitySummary(city),
      getYelpPlaces(city, country, 'restaurants'),
      getYelpPlaces(city, country, 'cafes'),
      getYelpPlaces(city, country, 'bars'),
      getGeoapifyPlaces(coords.lat, coords.lon, city),
    ]);
    res.json({ attractions, photos, culturalTips, foursquare, countryInfo, citySummary, yelpRestaurants, yelpCafes, yelpBars, geoapifyPlaces });
  } catch (err) {
    console.error('Travel info error for city:', city);
    console.error(err.stack || err);
    res.status(500).json({ error: 'Failed to fetch travel info', details: err.message });
  }
});

export default router; 