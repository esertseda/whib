<template>
  <div class="city-map-container">
    <div class="map-controls">
      <select v-model="routeProfile" class="route-profile-select">
        <option value="driving">🚗 Car</option>
        <option value="walking">🚶 Walking</option>
        <option value="cycling">🚴 Bicycle</option>
      </select>
      <button 
        @click="optimizeRoute" 
        :disabled="isLoading || places.length < 2"
        class="optimize-btn"
      >
        {{ isLoading ? 'Calculating Route...' : 'Optimize Route' }}
      </button>
      <button @click="clearRoute" class="clear-btn">Clear Route</button>
    </div>
    
    <div id="map" class="map-container"></div>
    
    <div class="route-optimization-note">
      <p>💡 <strong>Route Optimization:</strong> Uses the nearest neighbor algorithm to calculate the shortest route.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for Leaflet default icon path
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const props = defineProps({
  cityName: {
    type: String,
    required: true
  },
  places: {
    type: Array,
    default: () => []
  },
  cityCoordinates: {
    type: Object,
    default: () => ({ lat: 41.9028, lng: 12.4964 }) // Default to Rome
  }
})

const emit = defineEmits(['routeOptimized'])

let map = null
const routeProfile = ref('driving')
const isLoading = ref(false)

// Backend proxy configuration
const API_BASE_URL = '/api/geocoding'

const initMap = () => {
  if (map) {
    map.remove()
  }

  // Fix Leaflet marker icons for production
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  map = L.map('map').setView([props.cityCoordinates.lat, props.cityCoordinates.lng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // Add places to map after a short delay
  setTimeout(async () => {
    await addPlacesToMap()
  }, 100)
}

const addPlacesToMap = async () => {
  if (!map || !props.places.length) return

  clearMarkers()

  const bounds = L.latLngBounds()
  let addedPlaces = 0

  for (const place of props.places) {
    let lat = place.lat
    let lng = place.lng

    // If no coordinates, try to geocode
    if (!lat || !lng) {
      console.log(`Geocoding: ${place.name}`)
      const coords = await geocodePlace(place)
      if (coords) {
        lat = coords.lat
        lng = coords.lng
        // Update the place object with coordinates
        place.lat = lat
        place.lng = lng
      }
    }

    if (lat && lng) {
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${getMarkerColor(place.category)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map)

      const popupContent = `
        <div class="marker-popup">
          <h4>${place.name}</h4>
          <p><strong>Category:</strong> ${place.category || 'General'}</p>
          ${place.address ? `<p><strong>Address:</strong> ${place.address}</p>` : ''}
          ${place.rating ? `<p><strong>Rating:</strong> ⭐ ${place.rating}${place.review_count ? ` (${place.review_count} reviews)` : ''}</p>` : ''}
          ${place.description ? `<p><strong>Description:</strong> ${place.description}</p>` : ''}
          ${place.website ? `<p><strong>Website:</strong> <a href="${place.website}" target="_blank">Visit</a></p>` : ''}
          ${place.url ? `<p><strong>Yelp:</strong> <a href="${place.url}" target="_blank">View on Yelp</a></p>` : ''}
        </div>
      `
      marker.bindPopup(popupContent)
      marker._place = place
      marker._isMarker = true

      bounds.extend([lat, lng])
      addedPlaces++
    }
  }

  if (addedPlaces > 0) {
    map.fitBounds(bounds, { padding: [20, 20] })
  }

  console.log(`Added ${addedPlaces} places to map out of ${props.places.length} total`)
}

const geocodePlace = async (place) => {
  try {
    console.log(`Geocoding: ${place.name}`)
    
    const response = await fetch(`${API_BASE_URL}/geocode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        place: place,
        cityName: props.cityName
      })
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.success) {
        console.log(`Geocoded "${place.name}" to: ${data.coordinates.lat}, ${data.coordinates.lng}`)
        return data.coordinates
      } else {
        console.warn(`Could not geocode: ${place.name} - ${data.error}`)
      }
    } else {
      console.error(`Geocoding request failed for ${place.name}:`, response.status)
    }

    return null
  } catch (error) {
    console.error(`Geocoding error for ${place.name}:`, error)
    return null
  }
}

const getMarkerColor = (category) => {
  const colors = {
    'restaurant': '#FF6B6B',
    'cafe': '#4ECDC4',
    'bar': '#45B7D1',
    'tourist': '#96CEB4',
    'attraction': '#96CEB4',
    'museum': '#FFEAA7',
    'shopping': '#DDA0DD',
    'hotel': '#98D8C8',
    'park': '#F7DC6F'
  }
  return colors[category] || '#6C5CE7'
}

const clearMarkers = () => {
  if (!map) return
  
  map.eachLayer((layer) => {
    if (layer._isMarker) {
      map.removeLayer(layer)
    }
  })
}

const clearRoute = () => {
  if (!map) return
  
  map.eachLayer((layer) => {
    if (layer._routeLayer) {
      map.removeLayer(layer)
    }
  })
}

const optimizeRoute = async () => {
  if (!map || props.places.length < 2) {
    alert('At least 2 places are required to create a route.')
    return
  }

  isLoading.value = true
  clearRoute()

  try {
    // Get places with coordinates
    const placesWithCoords = props.places.filter(place => place.lat && place.lng)
    
    if (placesWithCoords.length < 2) {
      alert('At least 2 places with coordinates are required to create a route. Some places could not be geocoded.')
      return
    }

    // Use nearest neighbor algorithm to optimize route
    const optimizedPlaces = nearestNeighborOptimization(placesWithCoords)
    
    // Create waypoints string for OSRM
    const waypoints = optimizedPlaces.map(place => `${place.lng},${place.lat}`).join(';')
    
    // Get route from OSRM
    const profile = routeProfile.value
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/${waypoints}?overview=full&geometries=geojson`
    )

    if (response.ok) {
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        
        // Add route to map
        const routeLayer = L.geoJSON(route.geometry, {
          style: {
            color: '#FF6B6B',
            weight: 4,
            opacity: 0.8
          }
        }).addTo(map)
        
        routeLayer._routeLayer = true

        // Add route info
        const distance = (route.distance / 1000).toFixed(2)
        const duration = Math.round(route.duration / 60)
        
        // Emit route results to parent component
        emit('routeOptimized', {
          success: true,
          distance: distance,
          duration: duration,
          stops: optimizedPlaces.length,
          route: route,
          optimizedPlaces: optimizedPlaces,
          profile: routeProfile.value
        })
      }
    } else {
      throw new Error('Route calculation failed')
    }
  } catch (error) {
    console.error('Route optimization error:', error)
    emit('routeOptimized', {
      success: false,
      error: 'An error occurred while creating the route. Please try again.'
    })
  } finally {
    isLoading.value = false
  }
}

const nearestNeighborOptimization = (places) => {
  if (places.length <= 2) return places

  const optimized = []
  const unvisited = [...places]
  
  // Start with the first place
  let current = unvisited.shift()
  optimized.push(current)

  while (unvisited.length > 0) {
    // Find nearest neighbor
    let nearest = unvisited[0]
    let minDistance = haversineDistance(current, nearest)

    for (const place of unvisited) {
      const distance = haversineDistance(current, place)
      if (distance < minDistance) {
        minDistance = distance
        nearest = place
      }
    }

    // Move to nearest neighbor
    optimized.push(nearest)
    unvisited.splice(unvisited.indexOf(nearest), 1)
    current = nearest
  }

  return optimized
}

const haversineDistance = (place1, place2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (place2.lat - place1.lat) * Math.PI / 180
  const dLon = (place2.lng - place1.lng) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(place1.lat * Math.PI / 180) * Math.cos(place2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Watch for changes in places
watch(() => props.places, async () => {
  if (map) {
    await addPlacesToMap()
  }
}, { deep: true })

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.city-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.route-profile-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.optimize-btn, .clear-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.optimize-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.optimize-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.optimize-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.clear-btn {
  background: #ff6b6b;
  color: white;
}

.clear-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.map-container {
  flex: 1;
  min-height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.route-optimization-note {
  margin-top: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 8px;
  font-size: 14px;
}

.route-optimization-note p {
  margin: 0;
}

/* Debug Panel Styles */
.debug-info {
  margin-top: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
}

.debug-info summary {
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 600;
  color: #495057;
  background: #e9ecef;
  border-radius: 8px 8px 0 0;
}

.debug-info summary:hover {
  background: #dee2e6;
}

.debug-content {
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.debug-place {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.debug-place:last-child {
  border-bottom: none;
}

.place-name {
  font-weight: 500;
  color: #495057;
}

.place-coords {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.has-coords {
  background: #d4edda;
  color: #155724;
}

.no-coords {
  background: #f8d7da;
  color: #721c24;
}

/* Marker Popup Styles */
:deep(.marker-popup) {
  text-align: center;
}

:deep(.marker-popup h4) {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

:deep(.marker-popup p) {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

:deep(.marker-popup strong) {
  color: #333;
}
</style> 