import express from 'express';
import axios from 'axios';
const router = express.Router();

// OpenStreetMap Nominatim Configuration (Free, no API key required)
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Geocode a single place
router.post('/geocode', async (req, res) => {
  try {
    const { place, cityName } = req.body;

    // No API key required for Nominatim

    // Try different query combinations for better results
    const queries = [
      `${place.name}, ${cityName}`,
      `${place.name}`,
      `${place.address}, ${cityName}`,
      `${place.address}`
    ];

    for (const query of queries) {
      if (!query.trim()) continue;

      try {
        const response = await axios.get(
          `${NOMINATIM_BASE_URL}/search`, {
            params: {
              q: query,
              format: 'json',
              limit: 1,
              addressdetails: 1
            },
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          console.log(`Geocoded "${query}" to: ${result.lat}, ${result.lon}`);
          
          return res.json({
            success: true,
            coordinates: {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon)
            },
            query: query
          });
        }
      } catch (error) {
        console.log(`Failed to geocode "${query}":`, error.response?.status);
        continue;
      }

      // Wait between requests to respect Nominatim rate limits (1 request per second)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return res.json({
      success: false,
      error: `Could not geocode: ${place.name}`
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ 
      error: 'Internal server error during geocoding' 
    });
  }
});

// Geocode multiple places
router.post('/geocode-batch', async (req, res) => {
  try {
    const { places, cityName } = req.body;

    // No API key required for Nominatim

    const results = [];
    
    for (const place of places) {
      // Skip if already has coordinates
      if (place.lat && place.lng) {
        results.push({
          place: place,
          success: true,
          coordinates: { lat: place.lat, lng: place.lng },
          message: 'Already has coordinates'
        });
        continue;
      }

      // Try different query combinations
      const queries = [
        `${place.name}, ${cityName}`,
        `${place.name}`,
        `${place.address}, ${cityName}`,
        `${place.address}`
      ];

      let geocoded = false;

      for (const query of queries) {
        if (!query.trim()) continue;

        try {
          const response = await axios.get(
            `${NOMINATIM_BASE_URL}/search`, {
              params: {
                q: query,
                format: 'json',
                limit: 1,
                addressdetails: 1
              },
              headers: {
                'Accept': 'application/json'
              }
            }
          );

          if (response.data && response.data.length > 0) {
            const result = response.data[0];
            console.log(`Geocoded "${query}" to: ${result.lat}, ${result.lon}`);
            
            results.push({
              place: place,
              success: true,
              coordinates: {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
              },
              query: query
            });
            
            geocoded = true;
            break;
          }
        } catch (error) {
          console.log(`Failed to geocode "${query}":`, error.response?.status);
          continue;
        }

        // Wait between requests to respect Nominatim rate limits (1 request per second)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!geocoded) {
        results.push({
          place: place,
          success: false,
          error: `Could not geocode: ${place.name}`
        });
      }
    }

    res.json({
      success: true,
      results: results,
      summary: {
        total: places.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Batch geocoding error:', error);
    res.status(500).json({ 
      error: 'Internal server error during batch geocoding' 
    });
  }
});

export default router; 