import axios from 'axios';

export async function getCityDetails(id) {
  const res = await axios.get(`/api/places/${id}`);
  return res.data;
}



export async function getTravelInfo(city, country = '') {
  try {
    const res = await axios.get(`/api/travel-info?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching travel info:', error);
    return {
      attractions: [],
      culturalTips: [],
      photos: [],
      foursquare: [],
      countryInfo: {},
      citySummary: '',
      yelpRestaurants: [],
      yelpCafes: [],
      yelpBars: [],
      geoapifyPlaces: []
    };
  }
}

// Use OpenStreetMap Nominatim for global place search (Turkish + English)
export async function searchCities(query) {
  if (!query || query.length < 2) return [];
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&featuretype=city`;
    
    const response = await axios.get(url, { 
      headers: { 
        'Accept-Language': 'tr,en'
      } 
    });

    // Filter and process results
    const cities = response.data
      .filter(item => {
        // Prefer cities and towns
        const type = item.type || '';
        const category = item.class || '';
        return type === 'city' || type === 'town' || category === 'place';
      })
      .map(item => ({
        name: item.display_name.split(',')[0],
        country: item.address?.country || '',
        state: item.address?.state || '',
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        },
        displayName: item.display_name
      }))
      .slice(0, 8); // Limit to 8 results

    return cities;
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
} 