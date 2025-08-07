<template>
  <div class="travel-list-root">
    <!-- Cities List View -->
    <div v-if="!selectedCity" class="cities-view">
      <header class="travel-list-header">
        <div class="header-content">
          <h1 class="travel-list-title">My Travel Lists</h1>
          <p class="travel-list-subtitle">Select a city to view your travel list</p>
        </div>
        <div class="header-actions">
          <button @click="clearAllSelections" class="clear-all-btn">Clear All</button>
        </div>
      </header>

      <!-- Summary Stats -->
      <div v-if="totalSelectedPlaces > 0" class="summary-section">
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-number">{{ totalSelectedPlaces }}</div>
            <div class="stat-label">Total Places</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ citiesWithPlaces.length }}</div>
            <div class="stat-label">Cities</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ totalCategories }}</div>
            <div class="stat-label">Categories</div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="totalSelectedPlaces === 0" class="empty-state">
        <div class="empty-icon">🗺️</div>
        <h3>No places selected yet</h3>
        <p>Go to the Wishlist page to search for a city and select places for your travel list.</p>
        <router-link to="/wishlist" class="go-to-wishlist-btn">Go to Wishlist</router-link>
      </div>

      <!-- Cities Grid -->
      <div v-else class="cities-grid">
        <div 
          v-for="city in citiesWithPlaces" 
          :key="city.name" 
          class="city-card"
          @click="selectCity(city)"
        >
          <div class="city-header">
            <h3 class="city-name">{{ city.name }}</h3>
            <span class="city-country">{{ city.country }}</span>
          </div>
          <div class="city-stats">
            <div class="city-stat">
              <span class="stat-icon">📍</span>
              <span class="stat-text">{{ city.placeCount }} places</span>
            </div>
            <div class="city-stat">
              <span class="stat-icon">🏷️</span>
              <span class="stat-text">{{ city.categoryCount }} categories</span>
            </div>
          </div>
          <div class="city-categories">
            <span 
              v-for="category in city.categories" 
              :key="category.name"
              class="category-pill"
              :style="{ backgroundColor: getCategoryColor(category.name) }"
            >
              {{ category.name }} ({{ category.count }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- City Details View -->
    <div v-else class="city-details-view">
      <header class="city-header-detail">
        <div class="header-content">
          <button @click="backToCities" class="back-btn">← Back to Cities</button>
          <h1 class="city-title">{{ selectedCity.name }}, {{ selectedCity.country }}</h1>
          <p class="city-subtitle">Travel List</p>
        </div>
        <div class="header-actions">
          <button @click="exportAsPDF" class="export-pdf-btn">Export as PDF</button>
          <button @click="clearCitySelections" class="clear-city-btn">Clear City</button>
        </div>
      </header>

      <!-- City Summary -->
      <div class="city-summary">
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-number">{{ cityPlaces.length }}</div>
            <div class="stat-label">Total Places</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ Object.keys(groupedPlaces).filter(key => groupedPlaces[key].length > 0).length }}</div>
            <div class="stat-label">Categories</div>
          </div>
        </div>
      </div>

      <!-- City Map -->
      <div class="map-section">
        <h2 class="map-title">🗺️ {{ selectedCity.name }} Haritası</h2>
        <div class="map-legend">
          <h3 class="legend-title">Harita Açıklaması:</h3>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-color" style="background-color: #96CEB4;"></span>
              <span>🏛️ Tourist Attractions</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #FF6B6B;"></span>
              <span>🍽️ Restoranlar</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #4ECDC4;"></span>
              <span>☕ Kafeler</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #45B7D1;"></span>
              <span>🍸 Barlar</span>
            </div>
          </div>
        </div>
        <div class="map-info">
          <p class="map-description">
            {{ mapPlaces.length }} places marked on the map. Includes tourist attractions, Yelp restaurants, cafes, and bars. You can use the map controls for route optimization.
          </p>
          <div class="map-stats">
            <span class="map-stat">
              📍 {{ mapPlaces.length }} places
            </span>
            <span class="map-stat">
              🏷️ {{ new Set(mapPlaces.map(p => p.category)).size }} categories
            </span>
            <span class="map-stat">
              🍽️ {{ mapPlaces.filter(p => p.category === 'restaurant').length }} restaurants
            </span>
            <span class="map-stat">
              ☕ {{ mapPlaces.filter(p => p.category === 'cafe').length }} cafes
            </span>
            <span class="map-stat">
              🍸 {{ mapPlaces.filter(p => p.category === 'bar').length }} bars
            </span>
            <span class="map-stat">
              🏛️ {{ mapPlaces.filter(p => p.category === 'tourist').length }} tourist attractions
            </span>
          </div>
        </div>
        <div class="map-container">
          <CityMap 
            :city-name="selectedCity.name"
            :places="mapPlaces"
            :city-coordinates="getCityCoordinates()"
            @route-optimized="handleRouteOptimized"
          />
        </div>
      </div>

      <!-- Route Results -->
      <div v-if="routeResults" class="route-results-section">
        <div v-if="routeResults.success" class="route-success">
          <h3 class="route-title">🗺️ Route Optimization Completed</h3>
          <div class="route-stats">
            <div class="route-stat">
              <span class="route-stat-icon">📏</span>
              <span class="route-stat-label">Total Distance</span>
              <span class="route-stat-value">{{ routeResults.distance }} km</span>
            </div>
            <div class="route-stat">
              <span class="route-stat-icon">⏱️</span>
              <span class="route-stat-label">Estimated Time</span>
              <span class="route-stat-value">{{ routeResults.duration }} minutes</span>
            </div>
            <div class="route-stat">
              <span class="route-stat-icon">📍</span>
              <span class="route-stat-label">Number of Stops</span>
              <span class="route-stat-value">{{ routeResults.stops }} places</span>
            </div>
            <div class="route-stat">
              <span class="route-stat-icon">🚗</span>
              <span class="route-stat-label">Transport Type</span>
              <span class="route-stat-value">{{ getTransportType(routeResults.profile) }}</span>
            </div>
          </div>
          <div class="route-places">
            <h4 class="route-places-title">Optimized Route Order:</h4>
            <div class="route-places-list">
              <div v-for="(place, index) in routeResults.optimizedPlaces" :key="index" class="route-place-item">
                <span class="route-place-number">{{ index + 1 }}</span>
                <span class="route-place-name">{{ place.name }}</span>
                <span class="route-place-category">{{ place.category }}</span>
              </div>
            </div>
          </div>
          <button @click="routeResults = null" class="close-route-btn">Close Route Results</button>
        </div>
        <div v-else class="route-error">
          <h3 class="route-title">❌ Route Optimization Failed</h3>
          <p class="route-error-message">{{ routeResults.error }}</p>
          <button @click="routeResults = null" class="close-route-btn">Close</button>
        </div>
      </div>

      <!-- Travel List by Categories -->
      <div v-if="cityPlaces.length === 0" class="empty-city-state">
        <div class="empty-icon">🏙️</div>
        <h3>No places in travel list for {{ selectedCity.name }}</h3>
        <p>Go to the Wishlist page to search for {{ selectedCity.name }} and add places to your travel list.</p>
        <router-link to="/wishlist" class="go-to-wishlist-btn">Go to Wishlist</router-link>
      </div>
      
      <div v-else class="travel-categories" ref="travelListRef">
        <!-- Tourist Attractions -->
        <div v-if="groupedPlaces.tourist.length" class="category-section">
          <h2 class="category-title">
            🏛️ Tourist Attractions ({{ groupedPlaces.tourist.length }})
          </h2>
          <div class="places-grid">
            <div v-for="place in groupedPlaces.tourist" :key="place.id" class="place-card">
              <div class="place-image-container" v-if="place.image">
                <img :src="place.image" :alt="place.name" class="place-image" />
              </div>
              <div class="place-content">
                <h3 class="place-name">{{ place.name }}</h3>
                <div class="place-category">
                  <span class="category-badge">{{ place.category }}</span>
                </div>
                <p class="place-address">{{ place.address }}</p>
                <div class="place-actions">
                  <button @click="removeFromSelection(place)" class="remove-btn">Remove</button>
                  <a v-if="place.website" :href="place.website" target="_blank" class="website-btn">Website</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Restaurants -->
        <div v-if="groupedPlaces.restaurant.length" class="category-section">
          <h2 class="category-title">
            🍽️ Restaurants ({{ groupedPlaces.restaurant.length }})
          </h2>
          <div class="places-grid">
            <div v-for="place in groupedPlaces.restaurant" :key="place.id" class="place-card">
              <div class="place-image-container" v-if="place.image">
                <img :src="place.image" :alt="place.name" class="place-image" />
              </div>
              <div class="place-content">
                <h3 class="place-name">{{ place.name }}</h3>
                <div class="place-category">
                  <span class="category-badge restaurant">{{ place.category }}</span>
                </div>
                <p class="place-address">{{ place.address }}</p>
                <div v-if="place.rating" class="place-rating">
                  ⭐ {{ place.rating }} ({{ place.review_count }} reviews)
                </div>
                <div class="place-actions">
                  <button @click="removeFromSelection(place)" class="remove-btn">Remove</button>
                  <a v-if="place.url" :href="place.url" target="_blank" class="website-btn">Yelp</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cafes -->
        <div v-if="groupedPlaces.cafe.length" class="category-section">
          <h2 class="category-title">
            ☕ Cafes ({{ groupedPlaces.cafe.length }})
          </h2>
          <div class="places-grid">
            <div v-for="place in groupedPlaces.cafe" :key="place.id" class="place-card">
              <div class="place-image-container" v-if="place.image">
                <img :src="place.image" :alt="place.name" class="place-image" />
              </div>
              <div class="place-content">
                <h3 class="place-name">{{ place.name }}</h3>
                <div class="place-category">
                  <span class="category-badge cafe">{{ place.category }}</span>
                </div>
                <p class="place-address">{{ place.address }}</p>
                <div v-if="place.rating" class="place-rating">
                  ⭐ {{ place.rating }} ({{ place.review_count }} reviews)
                </div>
                <div class="place-actions">
                  <button @click="removeFromSelection(place)" class="remove-btn">Remove</button>
                  <a v-if="place.url" :href="place.url" target="_blank" class="website-btn">Yelp</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bars -->
        <div v-if="groupedPlaces.bar.length" class="category-section">
          <h2 class="category-title">
            🍸 Bars ({{ groupedPlaces.bar.length }})
          </h2>
          <div class="places-grid">
            <div v-for="place in groupedPlaces.bar" :key="place.id" class="place-card">
              <div class="place-image-container" v-if="place.image">
                <img :src="place.image" :alt="place.name" class="place-image" />
              </div>
              <div class="place-content">
                <h3 class="place-name">{{ place.name }}</h3>
                <div class="place-category">
                  <span class="category-badge bar">{{ place.category }}</span>
                </div>
                <p class="place-address">{{ place.address }}</p>
                <div v-if="place.rating" class="place-rating">
                  ⭐ {{ place.rating }} ({{ place.review_count }} reviews)
                </div>
                <div class="place-actions">
                  <button @click="removeFromSelection(place)" class="remove-btn">Remove</button>
                  <a v-if="place.url" :href="place.url" target="_blank" class="website-btn">Yelp</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Museums -->
        <div v-if="groupedPlaces.museum.length" class="category-section">
          <h2 class="category-title">
            🏛️ Museums ({{ groupedPlaces.museum.length }})
          </h2>
          <div class="places-grid">
            <div v-for="place in groupedPlaces.museum" :key="place.id" class="place-card">
              <div class="place-image-container" v-if="place.image">
                <img :src="place.image" :alt="place.name" class="place-image" />
              </div>
              <div class="place-content">
                <h3 class="place-name">{{ place.name }}</h3>
                <div class="place-category">
                  <span class="category-badge museum">{{ place.category }}</span>
                </div>
                <p class="place-address">{{ place.address }}</p>
                <div class="place-actions">
                  <button @click="removeFromSelection(place)" class="remove-btn">Remove</button>
                  <a v-if="place.website" :href="place.website" target="_blank" class="website-btn">Website</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shopping -->
        <div v-if="groupedPlaces.shopping.length" class="category-section">
          <h2 class="category-title">
            🛍️ Shopping ({{ groupedPlaces.shopping.length }})
          </h2>
          <div class="places-grid">
            <div v-for="place in groupedPlaces.shopping" :key="place.id" class="place-card">
              <div class="place-image-container" v-if="place.image">
                <img :src="place.image" :alt="place.name" class="place-image" />
              </div>
              <div class="place-content">
                <h3 class="place-name">{{ place.name }}</h3>
                <div class="place-category">
                  <span class="category-badge shopping">{{ place.category }}</span>
                </div>
                <p class="place-address">{{ place.address }}</p>
                <div class="place-actions">
                  <button @click="removeFromSelection(place)" class="remove-btn">Remove</button>
                  <a v-if="place.website" :href="place.website" target="_blank" class="website-btn">Website</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Other -->
        <div v-if="groupedPlaces.other.length" class="category-section">
          <h2 class="category-title">
            🏷️ Other Places ({{ groupedPlaces.other.length }})
          </h2>
          <div class="places-grid">
            <div v-for="place in groupedPlaces.other" :key="place.id" class="place-card">
              <div class="place-image-container" v-if="place.image">
                <img :src="place.image" :alt="place.name" class="place-image" />
              </div>
              <div class="place-content">
                <h3 class="place-name">{{ place.name }}</h3>
                <div class="place-category">
                  <span class="category-badge other">{{ place.category || place.type || 'Other' }}</span>
                </div>
                <p class="place-address">{{ place.address }}</p>
                <div class="place-actions">
                  <button @click="removeFromSelection(place)" class="remove-btn">Remove</button>
                  <a v-if="place.website" :href="place.website" target="_blank" class="website-btn">Website</a>
                  <a v-if="place.url" :href="place.url" target="_blank" class="website-btn">Yelp</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CityMap from '../components/CityMap.vue';
import axios from 'axios';

// Reactive data
const selectedPlaces = ref([]);
const selectedCity = ref(null);
const travelListRef = ref(null);
const mapPlaces = ref([]);
const routeResults = ref(null);

// Computed properties
const totalSelectedPlaces = computed(() => {
  return selectedPlaces.value.length;
});

const citiesWithPlaces = computed(() => {
  const cityMap = new Map();
  
  selectedPlaces.value.forEach(place => {
    const cityKey = `${place.city}-${place.country}`;
    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, {
        name: place.city,
        country: place.country,
        places: [],
        categories: new Map()
      });
    }
    
    const city = cityMap.get(cityKey);
    city.places.push(place);
    
    // Count categories
    const categoryName = place.category || place.type || 'Other';
    if (!city.categories.has(categoryName)) {
      city.categories.set(categoryName, 0);
    }
    city.categories.set(categoryName, city.categories.get(categoryName) + 1);
  });
  
  return Array.from(cityMap.values()).map(city => ({
    ...city,
    placeCount: city.places.length,
    categoryCount: city.categories.size,
    categories: Array.from(city.categories.entries()).map(([name, count]) => ({ name, count }))
  }));
});

const cityPlaces = computed(() => {
  if (!selectedCity.value) return [];
  return selectedPlaces.value.filter(place => 
    place.city === selectedCity.value.name && place.country === selectedCity.value.country
  );
});

const groupedPlaces = computed(() => {
  const groups = {
    tourist: [],
    restaurant: [],
    cafe: [],
    bar: [],
    museum: [],
    shopping: [],
    other: []
  };

  cityPlaces.value.forEach(place => {
    console.log('Processing place:', place.name, 'with category:', place.category, 'and type:', place.type);
    
    if (place.category === 'tourist' || place.category === 'Tourist Attraction' || place.type === 'tourist') {
      groups.tourist.push(place);
    } else if (place.category === 'restaurant' || place.category === 'Restaurant' || place.type === 'restaurant') {
      groups.restaurant.push(place);
    } else if (place.category === 'cafe' || place.category === 'Cafe' || place.type === 'cafe') {
      groups.cafe.push(place);
    } else if (place.category === 'bar' || place.category === 'Bar' || place.type === 'bar') {
      groups.bar.push(place);
    } else if (place.category === 'museum' || place.category === 'Museum') {
      groups.museum.push(place);
    } else if (place.category === 'shopping' || place.category === 'Shopping') {
      groups.shopping.push(place);
    } else {
      console.log('Place not categorized, adding to other:', place.name);
      groups.other.push(place);
    }
  });

  return groups;
});

const totalCategories = computed(() => {
  const allCategories = new Set();
  selectedPlaces.value.forEach(place => {
    const category = place.category || place.type || 'Other';
    allCategories.add(category);
  });
  return allCategories.size;
});

// Methods
async function geocodePlace(place, cityName) {
  try {
    console.log(`Geocoding place: ${place.name} in ${cityName}`);
    
    const response = await axios.post('/api/geocoding/geocode', {
      place: place,
      cityName: cityName
    });
    
    if (response.data.success) {
      console.log(`Successfully geocoded ${place.name}:`, response.data.coordinates);
      return response.data.coordinates;
    } else {
      console.warn(`Failed to geocode ${place.name}:`, response.data.error);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding ${place.name}:`, error);
    return null;
  }
}

function loadSelectedPlaces() {
  const saved = localStorage.getItem('selectedPlaces');
  if (saved) {
    selectedPlaces.value = JSON.parse(saved);
  }
}

function saveSelectedPlaces() {
  localStorage.setItem('selectedPlaces', JSON.stringify(selectedPlaces.value));
}

async function selectCity(city) {
  selectedCity.value = city;
  // Load places for map
  mapPlaces.value = await getPlacesForMap();
  
  // Auto-run route optimization if we have enough places
  const placesWithCoords = mapPlaces.value.filter(place => place.lat && place.lng);
  if (placesWithCoords.length >= 2) {
    console.log('Auto-running route optimization for selected city');
    setTimeout(() => {
      runRouteOptimization();
    }, 1000); // Small delay to ensure map is loaded
  }
}

function backToCities() {
  selectedCity.value = null;
}

async function removeFromSelection(place) {
  const index = selectedPlaces.value.findIndex(p => p.id === place.id);
  if (index > -1) {
    selectedPlaces.value.splice(index, 1);
    saveSelectedPlaces();
    // Update map places
    if (selectedCity.value) {
      mapPlaces.value = await getPlacesForMap();
    }
  }
}

function clearAllSelections() {
  if (confirm('Are you sure you want to clear all selected places?')) {
    selectedPlaces.value = [];
    saveSelectedPlaces();
    mapPlaces.value = [];
  }
}

function handleRouteOptimized(results) {
  console.log('handleRouteOptimized called with:', results);
  routeResults.value = results;
  console.log('routeResults.value after setting:', routeResults.value);
}

async function runRouteOptimization() {
  console.log('Running route optimization automatically');
  
  try {
    // Get places with coordinates
    const placesWithCoords = mapPlaces.value.filter(place => place.lat && place.lng);
    console.log('Places with coordinates for optimization:', placesWithCoords);
    
    if (placesWithCoords.length < 2) {
      console.log('Not enough places with coordinates for route optimization');
      routeResults.value = {
        success: false,
        error: 'At least 2 places with coordinates are needed for route optimization.'
      };
      return;
    }

    // Use nearest neighbor algorithm to optimize route
    const optimizedPlaces = nearestNeighborOptimization(placesWithCoords);
    console.log('Optimized places order:', optimizedPlaces.map(p => p.name));
    
    // Create waypoints string for OSRM
    const waypoints = optimizedPlaces.map(place => `${place.lng},${place.lat}`).join(';');
    console.log('OSRM waypoints:', waypoints);
    
    // Get route from OSRM (using driving profile as default)
    const profile = 'driving';
    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${waypoints}?overview=full&geometries=geojson`;
    console.log('OSRM URL:', osrmUrl);
    
    const response = await fetch(osrmUrl);

    if (response.ok) {
      const data = await response.json();
      console.log('OSRM response:', data);
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Add route info
        const distance = (route.distance / 1000).toFixed(2);
        const duration = Math.round(route.duration / 60);
        
        // Set route results
        routeResults.value = {
          success: true,
          distance: distance,
          duration: duration,
          stops: optimizedPlaces.length,
          route: route,
          optimizedPlaces: optimizedPlaces,
          profile: profile
        };
        
        console.log('Route optimization completed successfully:', routeResults.value);
      } else {
        throw new Error('No routes returned from OSRM');
      }
    } else {
      const errorText = await response.text();
      console.error('OSRM API error:', response.status, errorText);
      throw new Error(`Route calculation failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Route optimization error:', error);
    routeResults.value = {
      success: false,
      error: `An error occurred while creating the route: ${error.message}`
    };
  }
}

// Nearest neighbor optimization algorithm
function nearestNeighborOptimization(places) {
  if (places.length <= 2) return places;

  const optimized = [];
  const unvisited = [...places];
  
  // Start with the first place
  let current = unvisited.shift();
  optimized.push(current);

  while (unvisited.length > 0) {
    // Find nearest neighbor
    let nearest = unvisited[0];
    let minDistance = haversineDistance(current, nearest);

    for (const place of unvisited) {
      const distance = haversineDistance(current, place);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = place;
      }
    }

    // Remove nearest from unvisited and add to optimized
    const nearestIndex = unvisited.indexOf(nearest);
    unvisited.splice(nearestIndex, 1);
    optimized.push(nearest);
    current = nearest;
  }

  return optimized;
}

// Haversine distance calculation
function haversineDistance(place1, place2) {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = parseFloat(place1.lat) * Math.PI / 180;
  const lat2 = parseFloat(place2.lat) * Math.PI / 180;
  const deltaLat = (parseFloat(place2.lat) - parseFloat(place1.lat)) * Math.PI / 180;
  const deltaLng = (parseFloat(place2.lng) - parseFloat(place1.lng)) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getTransportType(profile) {
  const types = {
    'driving': 'Car',
    'walking': 'Walking',
    'cycling': 'Bicycle'
  };
  return types[profile] || profile;
}

async function clearCitySelections() {
  if (!selectedCity.value) return;
  
  if (confirm(`Are you sure you want to clear all places for ${selectedCity.value.name}?`)) {
    selectedPlaces.value = selectedPlaces.value.filter(place => 
      !(place.city === selectedCity.value.name && place.country === selectedCity.value.country)
    );
    saveSelectedPlaces();
    mapPlaces.value = [];
    backToCities();
  }
}

function getCategoryColor(categoryName) {
  const colors = {
    'tourist': '#388e7d',
    'restaurant': '#e53e3e',
    'cafe': '#38a169',
    'bar': '#d69e2e',
    'museum': '#7c3aed',
    'shopping': '#f472b6',
    'Other': '#6b7280'
  };
  return colors[categoryName] || '#6b7280';
}

async function getPlacesForMap() {
  const places = [];
  
  console.log('cityPlaces.value:', cityPlaces.value);
  console.log('Total places in cityPlaces:', cityPlaces.value.length);
  
  // Process all places from the travel list
  for (let index = 0; index < cityPlaces.value.length; index++) {
    const place = cityPlaces.value[index];
    console.log(`Processing place ${index + 1}:`, place);
    console.log(`Place has coordinates: lat=${place.lat}, lng=${place.lng}`);
    
    // Check if place has coordinates
    const hasCoordinates = place.lat && place.lng;
    const hasValidCoordinates = hasCoordinates && 
      !isNaN(parseFloat(place.lat)) && 
      !isNaN(parseFloat(place.lng)) &&
      parseFloat(place.lat) !== 0 && 
      parseFloat(place.lng) !== 0;
    
    if (hasValidCoordinates) {
      // Determine the correct category based on the place data
      let category = place.category || place.type || 'other';
      
      // Handle Yelp places specifically
      if (place.id && place.id.includes('yelp-')) {
        if (place.id.includes('yelp-rest-')) {
          category = 'restaurant';
        } else if (place.id.includes('yelp-cafe-')) {
          category = 'cafe';
        } else if (place.id.includes('yelp-bar-')) {
          category = 'bar';
        }
      }
      
      // Handle tourist attractions
      if (place.id && (place.id.includes('geoapify-') || place.id.includes('attraction-'))) {
        category = 'tourist';
      }
      
      // Handle other specific categories
      if (place.id && place.id.includes('museum-')) {
        category = 'museum';
      } else if (place.id && place.id.includes('shopping-')) {
        category = 'shopping';
      } else if (place.id && place.id.includes('cafe-')) {
        category = 'cafe';
      } else if (place.id && place.id.includes('bar-')) {
        category = 'bar';
      }
      
      const mapPlace = {
        name: place.name,
        address: place.address || '',
        category: category,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lng),
        rating: place.rating,
        image: place.image,
        website: place.website,
        url: place.url,
        review_count: place.review_count,
        description: place.description
      };
      
      places.push(mapPlace);
      console.log(`Added place to map:`, mapPlace);
    } else {
      console.log(`Place ${place.name} has no valid coordinates, attempting geocoding...`);
      
      // Try to geocode the place
      if (selectedCity.value) {
        const coords = await geocodePlace(place, selectedCity.value.name);
        if (coords) {
          // Determine the correct category based on the place data
          let category = place.category || place.type || 'other';
          
          // Handle Yelp places specifically
          if (place.id && place.id.includes('yelp-')) {
            if (place.id.includes('yelp-rest-')) {
              category = 'restaurant';
            } else if (place.id.includes('yelp-cafe-')) {
              category = 'cafe';
            } else if (place.id.includes('yelp-bar-')) {
              category = 'bar';
            }
          }
          
          // Handle tourist attractions
          if (place.id && (place.id.includes('geoapify-') || place.id.includes('attraction-'))) {
            category = 'tourist';
          }
          
          // Handle other specific categories
          if (place.id && place.id.includes('museum-')) {
            category = 'museum';
          } else if (place.id && place.id.includes('shopping-')) {
            category = 'shopping';
          } else if (place.id && place.id.includes('cafe-')) {
            category = 'cafe';
          } else if (place.id && place.id.includes('bar-')) {
            category = 'bar';
          }
          
          const mapPlace = {
            name: place.name,
            address: place.address || '',
            category: category,
            lat: coords.lat,
            lng: coords.lng,
            rating: place.rating,
            image: place.image,
            website: place.website,
            url: place.url,
            review_count: place.review_count,
            description: place.description
          };
          
          places.push(mapPlace);
          console.log(`Added geocoded place to map:`, mapPlace);
        } else {
          console.log(`Failed to geocode ${place.name}`);
        }
      } else {
        console.log(`Skipping place ${place.name} - no selected city`);
      }
    }
  }
  
  console.log('Final places for map:', places);
  console.log('Total places with coordinates:', places.length);
  return places;
}

function getCityCoordinates() {
  // Try to get coordinates from the first place with coordinates
  const placeWithCoords = cityPlaces.value.find(place => place.lat && place.lng);
  if (placeWithCoords) {
    return {
      lat: parseFloat(placeWithCoords.lat),
      lng: parseFloat(placeWithCoords.lng)
    };
  }
  
  // Fallback coordinates (you can set default coordinates for major cities)
  const defaultCoords = {
    'Istanbul': { lat: 41.0082, lng: 28.9784 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Rome': { lat: 41.9028, lng: 12.4964 },
    'Barcelona': { lat: 41.3851, lng: 2.1734 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Prague': { lat: 50.0755, lng: 14.4378 }
  };
  
  return defaultCoords[selectedCity.value.name] || { lat: 0, lng: 0 };
}

async function exportAsPDF() {
  const element = travelListRef.value;
  if (!element) return;

  try {
    const city = selectedCity.value;
    if (!city) {
      alert('Please select a city first');
      return;
    }

    // If no route optimization has been done yet, run it automatically
    if (!routeResults.value || !routeResults.value.success) {
      console.log('PDF Generation - No route optimization found, running it automatically');
      
      // Check if we have enough places for route optimization
      const placesWithCoords = mapPlaces.value.filter(place => place.lat && place.lng);
      console.log('PDF Generation - Places with coordinates:', placesWithCoords.length);
      
      if (placesWithCoords.length >= 2) {
        try {
          // Show loading message to user
          const loadingMessage = document.createElement('div');
          loadingMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
          `;
          loadingMessage.textContent = 'Generating route optimization for PDF...';
          document.body.appendChild(loadingMessage);
          
          // Run route optimization automatically
          await runRouteOptimization();
          console.log('PDF Generation - Route optimization completed automatically');
          console.log('PDF Generation - routeResults after optimization:', routeResults.value);
          
          // Wait a bit more to ensure routeResults is properly set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Remove loading message
          document.body.removeChild(loadingMessage);
        } catch (error) {
          console.log('PDF Generation - Automatic route optimization failed:', error);
          // Remove loading message if it exists
          const loadingMessage = document.querySelector('div[style*="position: fixed"]');
          if (loadingMessage) {
            document.body.removeChild(loadingMessage);
          }
        }
      } else {
        console.log('PDF Generation - Not enough places with coordinates for route optimization');
        console.log('PDF Generation - mapPlaces.value:', mapPlaces.value);
      }
    }

    // PDF için geçici container
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      width: 800px;
      padding: 20px;
      font-family: 'Arial', 'Helvetica', sans-serif;
      color: #333;
      background: white;
      font-size: 12px;
      line-height: 1.4;
    `;

    // Başlık
    let pdfContent = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #388e7d; font-size: 24px; margin: 0 0 10px 0; font-family: 'Arial', 'Helvetica', sans-serif;">${city.name}, ${city.country}</h1>
        <h2 style="color: #666; font-size: 18px; margin: 0 0 20px 0; font-family: 'Arial', 'Helvetica', sans-serif;">Travel List</h2>
        <p style="color: #999; font-size: 12px; margin: 0; font-family: 'Arial', 'Helvetica', sans-serif;">Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
    `;

    // Route Optimization Section (always show, with content or placeholder)
    console.log('PDF Generation - routeResults.value:', routeResults.value);
    console.log('PDF Generation - routeResults.value?.success:', routeResults.value?.success);
    
    pdfContent += `
      <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;">
        <h3 style="font-size: 18px; margin: 0 0 15px 0; font-family: 'Arial', 'Helvetica', sans-serif; text-align: center;">Route Optimization Results</h3>
    `;
    
    if (routeResults.value && routeResults.value.success) {
      console.log('PDF Generation - Adding route optimization content');
      pdfContent += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">Total Distance</div>
            <div style="font-size: 16px;">${routeResults.value.distance} km</div>
          </div>
          <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">Estimated Time</div>
            <div style="font-size: 16px;">${routeResults.value.duration} minutes</div>
          </div>
          <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">Number of Stops</div>
            <div style="font-size: 16px;">${routeResults.value.stops} places</div>
          </div>
          <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">Transport Type</div>
            <div style="font-size: 16px;">${getTransportType(routeResults.value.profile)}</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
          <h4 style="font-size: 16px; margin: 0 0 10px 0; font-family: 'Arial', 'Helvetica', sans-serif;">Optimized Route Order:</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
      `;

      routeResults.value.optimizedPlaces.forEach((place, index) => {
        pdfContent += `
          <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 5px;">
            <span style="background: white; color: #667eea; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">${index + 1}</span>
            <span style="font-weight: bold; font-size: 13px;">${place.name}</span>
            <span style="font-size: 11px; opacity: 0.8;">${place.category}</span>
          </div>
        `;
      });

      pdfContent += `
          </div>
        </div>
      `;
    } else {
      console.log('PDF Generation - Route optimization section added with placeholder because:', {
        routeResultsExists: !!routeResults.value,
        routeResultsSuccess: routeResults.value?.success,
        routeResultsValue: routeResults.value
      });
      
      // Show placeholder content
      const placesWithCoords = mapPlaces.value.filter(place => place.lat && place.lng);
      if (placesWithCoords.length >= 2) {
        pdfContent += `
          <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <p style="font-size: 14px; margin: 0;">Route optimization is being calculated...</p>
            <p style="font-size: 12px; margin: 10px 0 0 0; opacity: 0.8;">Please wait while we generate the optimal route for your ${placesWithCoords.length} places.</p>
          </div>
        `;
      } else {
        pdfContent += `
          <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <p style="font-size: 14px; margin: 0;">Route optimization not available</p>
            <p style="font-size: 12px; margin: 10px 0 0 0; opacity: 0.8;">At least 2 places with coordinates are needed for route optimization.</p>
          </div>
        `;
      }
    }
    
    pdfContent += `
      </div>
    `;

    // Map Image Section
    let mapImageData = null;
    try {
      const mapElement = document.querySelector('#map');
      if (mapElement && mapElement.offsetWidth > 0) {
        // Capture map as image
        const canvas = await html2canvas(mapElement, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: mapElement.offsetWidth,
          height: mapElement.offsetHeight
        });
        
        mapImageData = canvas.toDataURL('image/png');
        
        pdfContent += `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #388e7d; font-size: 18px; margin: 0 0 15px 0; font-family: 'Arial', 'Helvetica', sans-serif; text-align: center;">Map View</h3>
            <div style="text-align: center;">
              <img src="${mapImageData}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Map View" />
            </div>
          </div>
        `;
      } else {
        pdfContent += `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #388e7d; font-size: 18px; margin: 0 0 15px 0; font-family: 'Arial', 'Helvetica', sans-serif; text-align: center;">Map View</h3>
            <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 10px; border: 2px dashed #e0e0e0;">
              <p style="font-size: 14px; color: #666; margin: 0;">Map not available for capture</p>
            </div>
          </div>
        `;
      }
    } catch (mapErr) {
      console.log('Map capture not available:', mapErr);
      pdfContent += `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #388e7d; font-size: 18px; margin: 0 0 15px 0; font-family: 'Arial', 'Helvetica', sans-serif; text-align: center;">Map View</h3>
          <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 10px; border: 2px dashed #e0e0e0;">
            <p style="font-size: 14px; color: #666; margin: 0;">Map capture failed</p>
          </div>
        </div>
      `;
    }

    // Kategoriler ve isimleri
    const categories = ['restaurant', 'cafe', 'bar', 'tourist', 'museum', 'shopping', 'other'];
    const categoryNames = {
      restaurant: 'Restoranlar',
      cafe: 'Kafeler',
      bar: 'Barlar',
      tourist: 'Turistik Yerler',
      museum: 'Müzeler',
      shopping: 'Alışveriş',
      other: 'Diğer Yerler'
    };

    // Burada groupedPlaces Vue ref/computed olduğundan .value kullanıyoruz
    const grouped = groupedPlaces.value;

    let totalPlaces = 0;
    categories.forEach(category => {
      const places = grouped[category] || [];
      if (places.length > 0) {
        totalPlaces += places.length;
        pdfContent += `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #388e7d; font-size: 16px; margin: 0 0 10px 0; border-bottom: 2px solid #e0f2f1; padding-bottom: 5px; font-family: 'Arial', 'Helvetica', sans-serif;">
              ${categoryNames[category]} (${places.length})
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        `;

        places.forEach(place => {
          // Adres bilgisini temizle (gereksiz prefix'leri kaldır)
          let cleanAddress = place.address || '';
          if (cleanAddress.startsWith('Ø=')) {
            cleanAddress = cleanAddress.substring(2);
          }
          
          pdfContent += `
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border-left: 4px solid #388e7d; font-family: 'Arial', 'Helvetica', sans-serif;">
              <div style="font-weight: bold; font-size: 13px; margin-bottom: 5px; word-wrap: break-word;">${place.name}</div>
              ${cleanAddress ? `<div style="font-size: 11px; color: #666; margin-bottom: 3px; word-wrap: break-word;">${cleanAddress}</div>` : ''}
              ${place.description ? `<div style="font-size: 11px; color: #888; margin-bottom: 3px; word-wrap: break-word;">${place.description}</div>` : ''}
              ${place.rating ? `<div style="font-size: 11px; color: #f59e42;">Rating: ${place.rating}</div>` : ''}
            </div>
          `;
        });

        pdfContent += `
            </div>
          </div>
        `;
      }
    });

    if (totalPlaces > 0) {
      pdfContent += `
        <div style="margin-top: 30px; padding: 15px; background: #e0f2f1; border-radius: 10px; text-align: center;">
          <h3 style="color: #388e7d; font-size: 16px; margin: 0 0 10px 0;">Summary</h3>
          <p style="font-size: 14px; margin: 0; color: #666;">
            Total ${totalPlaces} places selected • ${categories.filter(cat => (grouped[cat]?.length || 0) > 0).length} categories
          </p>
        </div>
      `;
    } else {
      pdfContent += `
        <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 10px; text-align: center;">
          <p style="font-size: 16px; color: #666; margin: 0;">No places selected yet.</p>
        </div>
      `;
    }

    pdfContent += `
      <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #e0f2f1;">
        <p style="font-size: 12px; color: #999; margin: 0;">Generated by My Travel Map</p>
      </div>
    `;

    tempContainer.innerHTML = pdfContent;
    document.body.appendChild(tempContainer);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    await pdf.html(tempContainer, {
      callback: () => {
        pdf.save(`${city.name}-travel-list.pdf`);
        document.body.removeChild(tempContainer);
      },
      margin: [40, 40, 40, 40],
      autoPaging: 'text',
      html2canvas: { 
        scale: 0.8, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true
      }
    });

  } catch (err) {
    console.error('Error generating PDF:', err);
    alert('Failed to generate PDF. Please try again.');
  }

  // Debug amaçlı konsola yazdırma (dilersen kaldırabilirsin)
  console.log('groupedPlaces:', groupedPlaces.value);
  console.log('tourist places:', groupedPlaces.value.tourist);
}



// Lifecycle
onMounted(() => {
  loadSelectedPlaces();
  
  // Check if there's a pre-selected city from wishlist
  const selectedCityForPlanner = localStorage.getItem('selectedCityForPlanner');
  if (selectedCityForPlanner) {
    try {
      const cityData = JSON.parse(selectedCityForPlanner);
      // Find the city in our cities list
      const city = citiesWithPlaces.value.find(c => 
        c.name === cityData.name && c.country === cityData.country
      );
      
      if (city) {
        // Auto-select the city
        selectCity(city);
      } else {
        // If city doesn't exist in travel list, show a message
        console.log(`No travel list found for ${cityData.name}, ${cityData.country}. User will need to add places first.`);
      }
      
      // Clear the stored city data
      localStorage.removeItem('selectedCityForPlanner');
    } catch (error) {
      console.error('Error parsing selected city data:', error);
      localStorage.removeItem('selectedCityForPlanner');
    }
  }
});
</script>

<style scoped>
.travel-list-root {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Cities View Styles */
.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.city-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.city-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #388e7d;
}

.city-header {
  margin-bottom: 1rem;
}

.city-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.city-country {
  color: #666;
  font-size: 1rem;
}

.city-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.city-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.stat-icon {
  font-size: 1rem;
}

.city-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

/* City Details View Styles */
.city-header-detail {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.back-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #4b5563;
}

.city-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #388e7d;
  margin: 0 0 0.5rem 0;
}

.city-subtitle {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

.clear-city-btn {
  background: linear-gradient(90deg, #e57373 0%, #ef5350 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-city-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.city-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
}

.map-section {
  margin-bottom: 3rem;
}

.map-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 1rem;
  text-align: center;
}

.map-container {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 500px;
}

.map-legend {
  background: #f8fafc;
  border-radius: 0.8rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.legend-title {
  font-size: 1rem;
  font-weight: 600;
  color: #388e7d;
  margin: 0 0 0.8rem 0;
  text-align: center;
}

.legend-items {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
}

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .route-results-section {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 2px solid #e2e8f0;
  }

  .route-success {
    border-left: 4px solid #10b981;
  }

  .route-error {
    border-left: 4px solid #ef4444;
  }

  .route-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #388e7d;
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  .route-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .route-stat {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
    border-radius: 0.8rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .route-stat-icon {
    font-size: 1.5rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .route-stat-label {
    display: block;
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.3rem;
  }

  .route-stat-value {
    display: block;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .route-places {
    margin-bottom: 1.5rem;
  }

  .route-places-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #388e7d;
    margin: 0 0 1rem 0;
  }

  .route-places-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .route-place-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border-left: 3px solid #388e7d;
  }

  .route-place-number {
    background: #388e7d;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .route-place-name {
    flex: 1;
    font-weight: 600;
    color: #2d3748;
  }

  .route-place-category {
    background: #e2e8f0;
    color: #4a5568;
    padding: 0.3rem 0.6rem;
    border-radius: 0.3rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .close-route-btn {
    background: linear-gradient(90deg, #6b7280 0%, #4b5563 100%);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: block;
    margin: 0 auto;
  }

  .close-route-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .route-error-message {
    color: #ef4444;
    text-align: center;
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

.map-info {
  text-align: center;
  margin-bottom: 1rem;
}

.map-description {
  color: #666;
  font-size: 1rem;
  margin: 0 0 1rem 0;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  display: inline-block;
}

.map-stats {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.map-stat {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Common Styles */
.travel-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #388e7d;
  margin: 0;
}

.travel-list-subtitle {
  color: #666;
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.export-pdf-btn, .clear-all-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 0.8rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.export-pdf-btn {
  background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%);
  color: white;
}

.clear-all-btn {
  background: linear-gradient(90deg, #e57373 0%, #ef5350 100%);
  color: white;
}

.export-pdf-btn:hover, .clear-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.summary-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
}

.stat-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 0.8rem;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.empty-state, .empty-city-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8fafc;
  border-radius: 1rem;
  margin: 2rem 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #388e7d;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
}

.go-to-wishlist-btn {
  display: inline-block;
  background: linear-gradient(90deg, #6ee7b7 0%, #a7c7e7 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.8rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.go-to-wishlist-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-section {
  margin-bottom: 3rem;
}

.category-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.place-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.place-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.place-image-container {
  height: 200px;
  overflow: hidden;
}

.place-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.place-card:hover .place-image {
  transform: scale(1.05);
}

.place-content {
  padding: 1.5rem;
}

.place-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.place-category {
  margin-bottom: 0.5rem;
}

.category-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
  background: linear-gradient(90deg, #388e7d 0%, #2d5a4e 100%);
}

.category-badge.restaurant {
  background: linear-gradient(90deg, #e53e3e 0%, #c53030 100%);
}

.category-badge.cafe {
  background: linear-gradient(90deg, #38a169 0%, #2f855a 100%);
}

.category-badge.bar {
  background: linear-gradient(90deg, #d69e2e 0%, #b7791f 100%);
}

.category-badge.museum {
  background: linear-gradient(90deg, #7c3aed 0%, #6b21a8 100%);
}

.category-badge.shopping {
  background: linear-gradient(90deg, #f472b6 0%, #ec4899 100%);
}

.category-badge.other {
  background: linear-gradient(90deg, #6b7280 0%, #4b5563 100%);
}

.place-address {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.place-rating {
  color: #d69e2e;
  font-weight: 600;
  margin-bottom: 1rem;
}

.place-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.remove-btn, .website-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.remove-btn {
  background: #e53e3e;
  color: white;
}

.website-btn {
  background: #3182ce;
  color: white;
}

.remove-btn:hover, .website-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .travel-list-header, .city-header-detail {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-content h1, .city-title {
    font-size: 2rem;
  }

  .summary-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .places-grid, .cities-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .city-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .map-stats {
    gap: 0.5rem;
  }

  .map-stat {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .map-description {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }

  .map-legend {
    padding: 0.8rem;
  }

  .legend-items {
    gap: 0.5rem;
  }

  .legend-item {
    font-size: 0.8rem;
  }

  .legend-color {
    width: 12px;
    height: 12px;
  }

  .route-results-section {
    padding: 1rem;
  }

  .route-stats {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .route-stat {
    padding: 0.8rem;
  }

  .route-place-item {
    padding: 0.6rem;
    gap: 0.8rem;
  }

  .route-place-number {
    width: 20px;
    height: 20px;
    font-size: 0.8rem;
  }
}
</style> 