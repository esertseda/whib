<template>
  <div class="wishlist-root">
    <h2 class="wishlist-title">Travel Guide & Wishlist</h2>
    <CitySearch @select="handleCitySearch" />

    <div v-if="loading" class="loading-state">Loading travel info...</div>
    <div v-if="error" class="error-state">{{ error }}</div>

    <div v-if="travelInfo" class="travel-guide-container">
      <div class="travel-guide-header">
        <h3 class="travel-guide-title">Travel Guide for {{ currentCity?.name }}, {{ currentCity?.country }}</h3>
        <button @click="closeTravelGuide" class="close-travel-guide-btn">✕</button>
      </div>
      <!-- Top: Photos + About the City -->
      <div class="top-row">
        <PhotoGallery :photos="travelInfo.photos" :loading="loading" :error="error" />
        <div v-if="travelInfo.citySummary" class="city-summary-box vertical-city-summary">
          <h3 class="city-summary-title">About the City</h3>
          <p class="city-summary-text">{{ travelInfo.citySummary }}</p>
        </div>
      </div>
      <!-- Attractions Row -->
      <div class="attractions-row">
        <div class="info-card attractions-section main-attractions-section">
          <h3 class="info-title attractions-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="vertical-align:middle;margin-right:6px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 17c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#4e5d6c"/></svg>
            Popular Attractions
          </h3>
          <div class="scrollable-attractions-list">
            <AttractionsList :attractions="travelInfo.attractions" :loading="loading" :error="error" />
          </div>
        </div>
        <div v-if="travelInfo.geoapifyPlaces && travelInfo.geoapifyPlaces.length" class="info-card tourist-attractions-section geoapify-side-section">
          <h3 class="info-title tourist-attractions-title">
            🌍 Tourist Attractions (Select to add to Planner)
          </h3>
          <ul class="tourist-attractions-list scrollable-attractions-list">
            <li v-for="place in travelInfo.geoapifyPlaces" :key="place.place_id" class="tourist-attraction-item">
              <label class="tourist-checkbox-label">
                <input type="checkbox" :checked="selectedGeoapifyPlaces.some(a => a.place_id === place.place_id)" @change="() => toggleGeoapifyPlaceSelection(place)" />
                <span class="tourist-attraction-name">{{ place.name }}</span>
              </label>
              <span class="tourist-attraction-categories">
                <span class="category-badge">{{ place.category }}</span>
              </span>
              <span class="tourist-attraction-address">{{ place.address }}</span>
              <span v-if="place.description" class="tourist-attraction-desc">{{ place.description }}</span>
              <div v-if="place.image" class="tourist-attraction-image-container">
                <img :src="place.image" :alt="place.name" class="tourist-attraction-img" />
              </div>
              <a v-if="place.website" :href="place.website" target="_blank" class="tourist-attraction-link">Website</a>
            </li>
          </ul>
          <button v-if="selectedGeoapifyPlaces.length" @click="addSelectedGeoapifyPlacesToWishlist" class="add-selected-attractions-btn">Add Selected Tourist Attractions</button>
        </div>
      </div>
      <!-- Yelp Row -->
      <div class="yelp-row">
        <div v-if="travelInfo.yelpRestaurants && travelInfo.yelpRestaurants.length" class="info-card yelp-section yelp-col">
          <h3 class="info-title yelp-title">🍽️ Yelp Restaurants (Select to add to Planner)</h3>
          <ul class="tourist-attractions-list scrollable-attractions-list">
            <li v-for="rest in travelInfo.yelpRestaurants" :key="rest.id" class="tourist-attraction-item">
              <label class="tourist-checkbox-label">
                <input type="checkbox" :checked="selectedYelpRestaurants.some(a => a.id === rest.id)" @change="() => toggleYelpRestaurantSelection(rest)" />
                <span class="tourist-attraction-name">{{ rest.name }}</span>
              </label>
              <span class="tourist-attraction-categories">{{ rest.categories.join(', ') }}</span>
              <span class="tourist-attraction-address">{{ rest.address }}</span>
              <span v-if="rest.rating">⭐ {{ rest.rating }} ({{ rest.review_count }} reviews)</span>
              <a v-if="rest.url" :href="rest.url" target="_blank" class="tourist-attraction-link">Yelp</a>
            </li>
          </ul>
          <button v-if="selectedYelpRestaurants.length" @click="addSelectedYelpRestaurantsToWishlist" class="add-selected-attractions-btn">Add Selected Yelp Restaurants</button>
        </div>
        <div v-if="travelInfo.yelpCafes && travelInfo.yelpCafes.length" class="info-card yelp-section yelp-col">
          <h3 class="info-title yelp-title">☕ Yelp Cafes (Select to add to Planner)</h3>
          <ul class="tourist-attractions-list scrollable-attractions-list">
            <li v-for="cafe in travelInfo.yelpCafes" :key="cafe.id" class="tourist-attraction-item">
              <label class="tourist-checkbox-label">
                <input type="checkbox" :checked="selectedYelpCafes.some(a => a.id === cafe.id)" @change="() => toggleYelpCafeSelection(cafe)" />
                <span class="tourist-attraction-name">{{ cafe.name }}</span>
              </label>
              <span class="tourist-attraction-categories">{{ cafe.categories.join(', ') }}</span>
              <span class="tourist-attraction-address">{{ cafe.address }}</span>
              <span v-if="cafe.rating">⭐ {{ cafe.rating }} ({{ cafe.review_count }} reviews)</span>
              <a v-if="cafe.url" :href="cafe.url" target="_blank" class="tourist-attraction-link">Yelp</a>
            </li>
          </ul>
          <button v-if="selectedYelpCafes.length" @click="addSelectedYelpCafesToWishlist" class="add-selected-attractions-btn">Add Selected Yelp Cafes</button>
        </div>
        <div v-if="travelInfo.yelpBars && travelInfo.yelpBars.length" class="info-card yelp-section yelp-col">
          <h3 class="info-title yelp-title">🍸 Yelp Bars (Select to add to Planner)</h3>
          <ul class="tourist-attractions-list scrollable-attractions-list">
            <li v-for="bar in travelInfo.yelpBars" :key="bar.id" class="tourist-attraction-item">
              <label class="tourist-checkbox-label">
                <input type="checkbox" :checked="selectedYelpBars.some(a => a.id === bar.id)" @change="() => toggleYelpBarSelection(bar)" />
                <span class="tourist-attraction-name">{{ bar.name }}</span>
              </label>
              <span class="tourist-attraction-categories">{{ bar.categories.join(', ') }}</span>
              <span class="tourist-attraction-address">{{ bar.address }}</span>
              <span v-if="bar.rating">⭐ {{ bar.rating }} ({{ bar.review_count }} reviews)</span>
              <a v-if="bar.url" :href="bar.url" target="_blank" class="tourist-attraction-link">Yelp</a>
            </li>
          </ul>
          <button v-if="selectedYelpBars.length" @click="addSelectedYelpBarsToWishlist" class="add-selected-attractions-btn">Add Selected Yelp Bars</button>
        </div>
      </div>
      <!-- Country Info Sidebar -->
      <div class="sidebar-content">
        <div v-if="travelInfo.countryInfo" class="country-info-card">
          <div class="country-flag"><img :src="travelInfo.countryInfo.flag" :alt="travelInfo.countryInfo.name + ' flag'" /></div>
          <div class="country-info-details">
            <div class="country-name">{{ travelInfo.countryInfo.name }}</div>
            <div class="country-official">{{ travelInfo.countryInfo.official }}</div>
            <div class="country-meta">
              <span>Capital: <b>{{ travelInfo.countryInfo.capital }}</b></span>
              <span>Region: <b>{{ travelInfo.countryInfo.region }}</b></span>
              <span>Population: <b>{{ travelInfo.countryInfo.population.toLocaleString() }}</b></span>
              <span>Area: <b>{{ travelInfo.countryInfo.area.toLocaleString() }} km²</b></span>
            </div>
            <div class="country-meta">
              <span>Currency: <b>{{ travelInfo.countryInfo.currencies }}</b></span>
              <span>Languages: <b>{{ travelInfo.countryInfo.languages }}</b></span>
            </div>
            <div class="country-meta">
              <a :href="travelInfo.countryInfo.maps" target="_blank" class="country-map-link">View on Google Maps</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- City Map -->
      <div v-if="travelInfo && currentCity" class="map-section">
        <div class="map-header">
          <h3 class="map-title">🗺️ {{ currentCity.name }} Map</h3>
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-color" style="background-color: #96CEB4;"></span>
              <span>🏛️ Tourist Attractions</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #FF6B6B;"></span>
              <span>🍽️ Restaurants</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #4ECDC4;"></span>
              <span>☕ Cafes</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #45B7D1;"></span>
              <span>🍸 Bars</span>
            </div>
          </div>
        </div>
        <CityMap 
          :city-name="currentCity.name"
          :places="getPlacesForMap()"
          :city-coordinates="currentCity.coordinates"
          @route-optimized="handleRouteOptimized"
        />
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
    </div>
    <div v-if="travelInfo" class="action-buttons">
      <button @click="addToWishlist" class="add-to-wishlist-btn">Add to Wishlist</button>
      <router-link to="/travel-list" class="view-travel-list-btn">View Travel List</router-link>
    </div>
    <div v-if="!travelInfo && !loading && !currentCity" class="empty-state">
      Search for a city to get started and create your travel guide!
    </div>
    
    <!-- Wishlist Section -->
    <div class="wishlist-section" ref="plannerRef">
      <h3 class="wishlist-section-title">My Travel Planner</h3>
      
      <!-- Travel Guide Summary -->
      <div v-if="wishlist.length" class="travel-guide-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-number">{{ wishlist.length }}</span>
            <span class="stat-label">Total Places</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ Object.keys(groupedWishlist).filter(key => groupedWishlist[key].length > 0).length }}</span>
            <span class="stat-label">Categories</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ uniqueCities.length }}</span>
            <span class="stat-label">Cities</span>
          </div>
        </div>
      </div>

      <!-- Wishlist Content -->
      <div class="planner-group">
        <div class="planner-header">
          <h4 class="planner-group-title">
            🏙️ Wishlist ({{ filteredGroupedWishlist.city.length }})
          </h4>
          <div class="planner-actions">
            <div class="search-container">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search in wishlist..."
                class="wishlist-search-input"
              />
              <span class="search-icon">🔍</span>
            </div>
            <button class="clear-planner-btn" @click="clearPlanner" v-if="wishlist.length">Clear All</button>
          </div>
        </div>
        
        <!-- Wishlist Items -->
        <div v-if="filteredGroupedWishlist.city.length" class="planner-items-grid">
          <div v-for="item in filteredGroupedWishlist.city" :key="item._id" class="planner-item">
            <div class="item-content">
              <h5 class="item-title">{{ item.title }}</h5>
              <p v-if="item.city" class="item-location">{{ item.city }}, {{ item.country }}</p>
              <p v-if="item.description" class="item-description">{{ item.description }}</p>
              <div class="item-notes" v-if="item.notes">
                <strong>Notes:</strong> {{ item.notes }}
              </div>
            </div>
            <div class="item-actions">
              <button @click="createTravelPlanner(item)" class="travel-planner-btn" title="Load Travel Guide & Attractions for {{ item.city }}">🗺️</button>
              <button @click="removeFromWishlist(item._id)" class="remove-btn" title="Remove">🗑️</button>
            </div>
          </div>
        </div>
        
        <!-- Empty Wishlist Message -->
        <div v-else class="wishlist-empty-message">
          <div class="empty-icon">{{ searchQuery ? '🔍' : '📝' }}</div>
          <h5 class="empty-title">{{ searchQuery ? 'No Search Results Found' : 'Wishlist Empty' }}</h5>
          <p class="empty-description">
            {{ searchQuery 
              ? `No results found for "${searchQuery}". Try a different search term.` 
              : 'No places added yet. Search for a city and create a travel guide to add places to your wishlist.' 
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Notes Modal -->
    <div v-if="showNotesModal" class="modal-overlay" @click.self="closeNotesModal">
      <div class="modal-content notes-modal">
        <h3>Add Notes for {{ selectedItemForNotes?.title }}</h3>
        <textarea 
          v-model="notesText" 
          placeholder="Add your notes, tips, or reminders about this place..."
          class="notes-textarea"
          rows="4"
        ></textarea>
        <div class="modal-actions">
          <button @click="saveNotes" class="save-notes-btn">Save Notes</button>
          <button @click="closeNotesModal" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import CitySearch from '../components/CitySearch.vue';
import AttractionsList from '../components/AttractionsList.vue';
import PhotoGallery from '../components/PhotoGallery.vue';
import CulturalTips from '../components/CulturalTips.vue';
import CityMap from '../components/CityMap.vue';
import { getWishlist, addWishlistPlace, removeWishlistCity } from '../services/wishlist';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const travelInfo = ref(null);
const loading = ref(false);
const error = ref('');
const wishlist = ref([]);
const currentCity = ref(null);
const selectedAttractions = ref([]);
const selectedMuseums = ref([]);
const selectedShopping = ref([]);
const selectedCafes = ref([]);
const selectedBars = ref([]);
const selectedYelpRestaurants = ref([]);
const selectedYelpCafes = ref([]);
const selectedYelpBars = ref([]);
const plannerRef = ref(null);
const selectedTouristAttractions = ref([]);
const selectedGeoapifyPlaces = ref([]);
const showNotesModal = ref(false);
const selectedItemForNotes = ref(null);
const notesText = ref('');
const searchQuery = ref('');
const routeResults = ref(null);

const groupedWishlist = computed(() => {
  const groups = {
    tourist: [],
    restaurant: [],
    museum: [],
    shopping: [],
    cafe: [],
    bar: [],
    city: [],
    yelpRestaurant: [],
    yelpCafe: [],
    yelpBar: [],
    other: []
  };
  for (const item of wishlist.value) {
    if (item.category === 'museum') groups.museum.push(item);
    else if (item.category === 'shopping') groups.shopping.push(item);
    else if (item.category === 'restaurant') groups.restaurant.push(item);
    else if (item.category === 'tourist') groups.tourist.push(item);
    else if (item.category === 'cafe') groups.cafe.push(item);
    else if (item.category === 'bar') groups.bar.push(item);
    else if (item.category === 'city') groups.city.push(item);
    else if (item.category === 'yelpRestaurant') groups.yelpRestaurant.push(item);
    else if (item.category === 'yelpCafe') groups.yelpCafe.push(item);
    else if (item.category === 'yelpBar') groups.yelpBar.push(item);
    else groups.other.push(item);
  }
  return groups;
});

const uniqueCities = computed(() => {
  const cities = new Set();
  wishlist.value.forEach(item => {
    if (item.city) {
      cities.add(item.city);
    }
  });
  return Array.from(cities);
});

const filteredWishlist = computed(() => {
  if (!searchQuery.value.trim()) {
    return wishlist.value;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  return wishlist.value.filter(item => {
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.city && item.city.toLowerCase().includes(query)) ||
      (item.country && item.country.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.notes && item.notes.toLowerCase().includes(query))
    );
  });
});

const filteredGroupedWishlist = computed(() => {
  const groups = {
    tourist: [],
    restaurant: [],
    museum: [],
    shopping: [],
    cafe: [],
    bar: [],
    city: [],
    yelpRestaurant: [],
    yelpCafe: [],
    yelpBar: [],
    other: []
  };
  
  for (const item of filteredWishlist.value) {
    if (item.category === 'museum') groups.museum.push(item);
    else if (item.category === 'shopping') groups.shopping.push(item);
    else if (item.category === 'restaurant') groups.restaurant.push(item);
    else if (item.category === 'tourist') groups.tourist.push(item);
    else if (item.category === 'cafe') groups.cafe.push(item);
    else if (item.category === 'bar') groups.bar.push(item);
    else if (item.category === 'city') groups.city.push(item);
    else if (item.category === 'yelpRestaurant') groups.yelpRestaurant.push(item);
    else if (item.category === 'yelpCafe') groups.yelpCafe.push(item);
    else if (item.category === 'yelpBar') groups.yelpBar.push(item);
    else groups.other.push(item);
  }
  return groups;
});

async function fetchWishlist() {
  wishlist.value = await getWishlist();
}

onMounted(fetchWishlist);

async function handleCitySearch(city) {
  if (!city || !city.name) return;
  loading.value = true;
  error.value = '';
  travelInfo.value = null;
  currentCity.value = city;

  try {
    const res = await axios.get(`/api/travel-info?city=${encodeURIComponent(city.name)}`);
    travelInfo.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch travel info.';
  } finally {
    loading.value = false;
  }
}



async function addToWishlist() {
  if (!currentCity.value) return;
  // Prevent duplicate city in wishlist
  const alreadyExists = wishlist.value.some(
    item => item.city === currentCity.value.name && item.category === 'city'
  );
  if (alreadyExists) return;
  const placeData = {
    title: currentCity.value.name,
    city: currentCity.value.name,
    country: currentCity.value.country || '',
    lat: currentCity.value.coordinates.lat,
    lng: currentCity.value.coordinates.lng,
    wishlist: true,
    visitedAt: '',
    category: 'city',
  };
  const result = await addWishlistPlace(placeData);
  if (result) fetchWishlist();
}

async function removeFromWishlist(id) {
  await removeWishlistCity(id);
  fetchWishlist();
}

function toggleAttractionSelection(attraction) {
  const idx = selectedAttractions.value.findIndex(a => a.fsq_id === attraction.fsq_id);
  if (idx === -1) {
    selectedAttractions.value.push(attraction);
  } else {
    selectedAttractions.value.splice(idx, 1);
  }
}

async function addSelectedAttractionsToWishlist() {
  for (const attr of selectedAttractions.value) {
    await addWishlistPlace({
      title: attr.name,
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      lat: attr.geocodes?.latitude || '',
      lng: attr.geocodes?.longitude || '',
      wishlist: true,
      visitedAt: '',
      category: 'tourist',
    });
    
    // Also add to travel list
    addToTravelList({
      id: `attraction-${attr.fsq_id}`,
      name: attr.name,
      address: attr.address || '',
      category: 'tourist',
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      type: 'tourist',
      lat: attr.geocodes?.latitude || '',
      lng: attr.geocodes?.longitude || ''
    });
  }
  selectedAttractions.value = [];
  fetchWishlist();
}

function toggleMuseumSelection(museum) {
  const idx = selectedMuseums.value.findIndex(a => a.fsq_id === museum.fsq_id);
  if (idx === -1) {
    selectedMuseums.value.push(museum);
  } else {
    selectedMuseums.value.splice(idx, 1);
  }
}

function toggleShoppingSelection(shop) {
  const idx = selectedShopping.value.findIndex(a => a.fsq_id === shop.fsq_id);
  if (idx === -1) {
    selectedShopping.value.push(shop);
  } else {
    selectedShopping.value.splice(idx, 1);
  }
}

function toggleCafeSelection(cafe) {
  const idx = selectedCafes.value.findIndex(a => a.fsq_id === cafe.fsq_id);
  if (idx === -1) {
    selectedCafes.value.push(cafe);
  } else {
    selectedCafes.value.splice(idx, 1);
  }
}

function toggleBarSelection(bar) {
  const idx = selectedBars.value.findIndex(a => a.fsq_id === bar.fsq_id);
  if (idx === -1) {
    selectedBars.value.push(bar);
  } else {
    selectedBars.value.splice(idx, 1);
  }
}

async function addSelectedMuseumsToWishlist() {
  for (const museum of selectedMuseums.value) {
    await addWishlistPlace({
      title: museum.name,
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      lat: museum.geocodes?.latitude || '',
      lng: museum.geocodes?.longitude || '',
      wishlist: true,
      visitedAt: '',
      category: 'museum',
    });
    
    // Also add to travel list
    addToTravelList({
      id: `museum-${museum.fsq_id}`,
      name: museum.name,
      address: museum.address || '',
      category: 'museum',
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      type: 'museum',
      lat: museum.geocodes?.latitude || '',
      lng: museum.geocodes?.longitude || ''
    });
  }
  selectedMuseums.value = [];
  fetchWishlist();
}

async function addSelectedShoppingToWishlist() {
  for (const shop of selectedShopping.value) {
    await addWishlistPlace({
      title: shop.name,
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      lat: shop.geocodes?.latitude || '',
      lng: shop.geocodes?.longitude || '',
      wishlist: true,
      visitedAt: '',
      category: 'shopping',
    });
    
    // Also add to travel list
    addToTravelList({
      id: `shopping-${shop.fsq_id}`,
      name: shop.name,
      address: shop.address || '',
      category: 'shopping',
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      type: 'shopping',
      lat: shop.geocodes?.latitude || '',
      lng: shop.geocodes?.longitude || ''
    });
  }
  selectedShopping.value = [];
  fetchWishlist();
}

async function addSelectedCafesToWishlist() {
  for (const cafe of selectedCafes.value) {
    await addWishlistPlace({
      title: cafe.name,
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      lat: cafe.geocodes?.latitude || '',
      lng: cafe.geocodes?.longitude || '',
      wishlist: true,
      visitedAt: '',
      category: 'cafe',
    });
    
    // Also add to travel list
    addToTravelList({
      id: `cafe-${cafe.fsq_id}`,
      name: cafe.name,
      address: cafe.address || '',
      category: 'cafe',
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      type: 'cafe',
      lat: cafe.geocodes?.latitude || '',
      lng: cafe.geocodes?.longitude || ''
    });
  }
  selectedCafes.value = [];
  fetchWishlist();
}

async function addSelectedBarsToWishlist() {
  for (const bar of selectedBars.value) {
    await addWishlistPlace({
      title: bar.name,
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      lat: bar.geocodes?.latitude || '',
      lng: bar.geocodes?.longitude || '',
      wishlist: true,
      visitedAt: '',
      category: 'bar',
    });
    
    // Also add to travel list
    addToTravelList({
      id: `bar-${bar.fsq_id}`,
      name: bar.name,
      address: bar.address || '',
      category: 'bar',
      city: currentCity.value?.name || '',
      country: currentCity.value?.country || '',
      type: 'bar',
      lat: bar.geocodes?.latitude || '',
      lng: bar.geocodes?.longitude || ''
    });
  }
  selectedBars.value = [];
  fetchWishlist();
}

async function addSelectedYelpRestaurantsToWishlist() {
  console.log('addSelectedYelpRestaurantsToWishlist called');
  console.log('selectedYelpRestaurants:', selectedYelpRestaurants.value);
  
  if (selectedYelpRestaurants.value.length === 0) {
    alert('Please select at least one restaurant');
    return;
  }
  
  try {
    for (const rest of selectedYelpRestaurants.value) {
      console.log('Adding restaurant:', rest);
      
      await addWishlistPlace({
        title: rest.name,
        city: currentCity.value?.name || '',
        country: currentCity.value?.country || '',
        lat: rest.coordinates?.latitude || '',
        lng: rest.coordinates?.longitude || '',
        wishlist: true,
        visitedAt: '',
        category: 'yelpRestaurant',
      });
      
      // Also add to travel list
      addToTravelList({
        id: `yelp-rest-${rest.id}`,
        name: rest.name,
        address: rest.address,
        category: 'Restaurant',
        image: rest.image_url,
        url: rest.url,
        rating: rest.rating,
        review_count: rest.review_count,
        city: currentCity.value?.name || '',
        country: currentCity.value?.country || '',
        type: 'restaurant',
        lat: rest.coordinates?.latitude || '',
        lng: rest.coordinates?.longitude || ''
      });
    }
    
    selectedYelpRestaurants.value = [];
    await fetchWishlist();
    alert('Restaurants added successfully!');
  } catch (error) {
    console.error('Error adding restaurants:', error);
    alert('Failed to add restaurants. Please try again.');
  }
}
async function addSelectedYelpCafesToWishlist() {
  console.log('addSelectedYelpCafesToWishlist called');
  console.log('selectedYelpCafes:', selectedYelpCafes.value);
  
  if (selectedYelpCafes.value.length === 0) {
    alert('Please select at least one cafe');
    return;
  }
  
  try {
    for (const cafe of selectedYelpCafes.value) {
      console.log('Adding cafe:', cafe);
      
      await addWishlistPlace({
        title: cafe.name,
        city: currentCity.value?.name || '',
        country: currentCity.value?.country || '',
        lat: cafe.coordinates?.latitude || '',
        lng: cafe.coordinates?.longitude || '',
        wishlist: true,
        visitedAt: '',
        category: 'yelpCafe',
      });
      
      // Also add to travel list
      addToTravelList({
        id: `yelp-cafe-${cafe.id}`,
        name: cafe.name,
        address: cafe.address,
        category: 'Cafe',
        image: cafe.image_url,
        url: cafe.url,
        rating: cafe.rating,
        review_count: cafe.review_count,
        city: currentCity.value?.name || '',
        country: currentCity.value?.country || '',
        type: 'cafe',
        lat: cafe.coordinates?.latitude || '',
        lng: cafe.coordinates?.longitude || ''
      });
    }
    
    selectedYelpCafes.value = [];
    await fetchWishlist();
    alert('Cafes added successfully!');
  } catch (error) {
    console.error('Error adding cafes:', error);
    alert('Failed to add cafes. Please try again.');
  }
}
async function addSelectedYelpBarsToWishlist() {
  console.log('addSelectedYelpBarsToWishlist called');
  console.log('selectedYelpBars:', selectedYelpBars.value);
  
  if (selectedYelpBars.value.length === 0) {
    alert('Please select at least one bar');
    return;
  }
  
  try {
    for (const bar of selectedYelpBars.value) {
      console.log('Adding bar:', bar);
      
      await addWishlistPlace({
        title: bar.name,
        city: currentCity.value?.name || '',
        country: currentCity.value?.country || '',
        lat: bar.coordinates?.latitude || '',
        lng: bar.coordinates?.longitude || '',
        wishlist: true,
        visitedAt: '',
        category: 'yelpBar',
      });
      
      // Also add to travel list
      addToTravelList({
        id: `yelp-bar-${bar.id}`,
        name: bar.name,
        address: bar.address,
        category: 'Bar',
        image: bar.image_url,
        url: bar.url,
        rating: bar.rating,
        review_count: bar.review_count,
        city: currentCity.value?.name || '',
        country: currentCity.value?.country || '',
        type: 'bar',
        lat: bar.coordinates?.latitude || '',
        lng: bar.coordinates?.longitude || ''
      });
    }
    
    selectedYelpBars.value = [];
    await fetchWishlist();
    alert('Bars added successfully!');
  } catch (error) {
    console.error('Error adding bars:', error);
    alert('Failed to add bars. Please try again.');
  }
}

function toggleYelpRestaurantSelection(rest) {
  console.log('toggleYelpRestaurantSelection called with:', rest);
  const idx = selectedYelpRestaurants.value.findIndex(a => a.id === rest.id);
  if (idx === -1) {
    selectedYelpRestaurants.value.push(rest);
    console.log('Added restaurant to selection');
  } else {
    selectedYelpRestaurants.value.splice(idx, 1);
    console.log('Removed restaurant from selection');
  }
  console.log('Current selectedYelpRestaurants:', selectedYelpRestaurants.value);
}

function toggleYelpCafeSelection(cafe) {
  console.log('toggleYelpCafeSelection called with:', cafe);
  const idx = selectedYelpCafes.value.findIndex(a => a.id === cafe.id);
  if (idx === -1) {
    selectedYelpCafes.value.push(cafe);
    console.log('Added cafe to selection');
  } else {
    selectedYelpCafes.value.splice(idx, 1);
    console.log('Removed cafe from selection');
  }
  console.log('Current selectedYelpCafes:', selectedYelpCafes.value);
}

function toggleYelpBarSelection(bar) {
  console.log('toggleYelpBarSelection called with:', bar);
  const idx = selectedYelpBars.value.findIndex(a => a.id === bar.id);
  if (idx === -1) {
    selectedYelpBars.value.push(bar);
    console.log('Added bar to selection');
  } else {
    selectedYelpBars.value.splice(idx, 1);
    console.log('Removed bar from selection');
  }
  console.log('Current selectedYelpBars:', selectedYelpBars.value);
}

function toggleTouristAttractionSelection(attr) {
  const idx = selectedTouristAttractions.value.findIndex(a => a.fsq_id === attr.fsq_id);
  if (idx === -1) selectedTouristAttractions.value.push(attr);
  else selectedTouristAttractions.value.splice(idx, 1);
}

async function addSelectedTouristAttractionsToWishlist() {
  for (const attr of selectedTouristAttractions.value) {
    await addWishlistPlace({
      title: attr.name,
      city: travelInfo.value?.city || '',
      country: travelInfo.value?.country || '',
      lat: attr.geocodes?.latitude || '',
      lng: attr.geocodes?.longitude || '',
      wishlist: true,
      visitedAt: '',
      category: 'tourist',
    });
  }
  selectedTouristAttractions.value = [];
  fetchWishlist();
}

async function addSelectedGeoapifyPlacesToWishlist() {
  console.log('addSelectedGeoapifyPlacesToWishlist called');
  console.log('selectedGeoapifyPlaces:', selectedGeoapifyPlaces.value);
  
  if (selectedGeoapifyPlaces.value.length === 0) {
    alert('Please select at least one tourist attraction');
    return;
  }
  
  try {
    for (const place of selectedGeoapifyPlaces.value) {
      console.log('Adding place:', place);
      
      await addWishlistPlace({
        title: place.name,
        city: currentCity.value?.name || '',
        country: currentCity.value?.country || '',
        lat: place.lat || '',
        lng: place.lon || '',
        wishlist: true,
        visitedAt: '',
        category: 'tourist',
      });
      
      // Also add to travel list
      addToTravelList({
        id: `geoapify-${place.place_id}`,
        name: place.name,
        address: place.address,
        category: 'tourist',
        image: place.image,
        website: place.website,
        city: currentCity.value?.name || '',
        country: currentCity.value?.country || '',
        type: 'tourist',
        lat: place.lat || '',
        lng: place.lon || ''
      });
    }
    
    selectedGeoapifyPlaces.value = [];
    await fetchWishlist();
    alert('Tourist attractions added successfully!');
  } catch (error) {
    console.error('Error adding tourist attractions:', error);
    alert('Failed to add tourist attractions. Please try again.');
  }
}

function toggleGeoapifyPlaceSelection(place) {
  console.log('toggleGeoapifyPlaceSelection called with:', place);
  const idx = selectedGeoapifyPlaces.value.findIndex(a => a.place_id === place.place_id);
  if (idx === -1) {
    selectedGeoapifyPlaces.value.push(place);
    console.log('Added place to selection');
  } else {
    selectedGeoapifyPlaces.value.splice(idx, 1);
    console.log('Removed place from selection');
  }
  console.log('Current selectedGeoapifyPlaces:', selectedGeoapifyPlaces.value);
}

async function exportPlannerAsPDF() {
  const element = plannerRef.value;
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, { 
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 40;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Add title
    pdf.setFontSize(24);
    pdf.setTextColor(56, 142, 125); // Primary color
    const title = currentCity.value?.name ? `${currentCity.value.name} Travel Planner` : 'My Travel Planner';
    pdf.text(title, pageWidth / 2, 40, { align: 'center' });
    
    // Add date
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString();
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, 60, { align: 'center' });
    
    // Add image
    pdf.addImage(imgData, 'PNG', 20, 80, pdfWidth, pdfHeight);
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by My Travel Map', pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    const fileName = currentCity.value?.name ? `${currentCity.value.name}-travel-planner.pdf` : 'travel-planner.pdf';
    pdf.save(fileName);
  } catch (err) {
    console.error('Error generating PDF:', err);
    alert('Failed to generate PDF. Please try again.');
  }
}

async function createTravelPlanner(item) {
  // Set the current city and load travel info for this city
  currentCity.value = {
    name: item.city,
    country: item.country,
    coordinates: {
      lat: item.lat || 0,
      lng: item.lng || 0
    }
  };
  
  // Load travel info for this city
  loading.value = true;
  error.value = '';
  travelInfo.value = null;

  try {
    const res = await axios.get(`/api/travel-info?city=${encodeURIComponent(item.city)}`);
    travelInfo.value = res.data;
    
    // Scroll to the travel guide section
    setTimeout(() => {
      const travelGuideContainer = document.querySelector('.travel-guide-container');
      if (travelGuideContainer) {
        travelGuideContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch travel info for this city.';
  } finally {
    loading.value = false;
  }
}

function closeTravelGuide() {
  travelInfo.value = null;
  currentCity.value = null;
  error.value = '';
  // Clear all selections
  selectedAttractions.value = [];
  selectedMuseums.value = [];
  selectedShopping.value = [];
  selectedCafes.value = [];
  selectedBars.value = [];
  selectedYelpRestaurants.value = [];
  selectedYelpCafes.value = [];
  selectedYelpBars.value = [];
  selectedGeoapifyPlaces.value = [];
}

function getPlacesForMap() {
  const places = [];
  
  // Add attractions from travelInfo
  if (travelInfo.value?.attractions) {
    travelInfo.value.attractions.forEach(attr => {
      if (attr.geocodes?.latitude && attr.geocodes?.longitude) {
        places.push({
          name: attr.name,
          address: attr.address,
          category: 'tourist',
          lat: attr.geocodes.latitude,
          lng: attr.geocodes.longitude
        });
      }
    });
  }
  
  // Add geoapify places
  if (travelInfo.value?.geoapifyPlaces) {
    travelInfo.value.geoapifyPlaces.forEach(place => {
      if (place.lat && place.lon) {
        places.push({
          name: place.name,
          address: place.address,
          category: 'tourist',
          lat: place.lat,
          lng: place.lon
        });
      }
    });
  }
  
  // Add Yelp restaurants
  if (travelInfo.value?.yelpRestaurants) {
    travelInfo.value.yelpRestaurants.forEach(rest => {
      if (rest.coordinates?.latitude && rest.coordinates?.longitude) {
        places.push({
          name: rest.name,
          address: rest.address,
          category: 'restaurant',
          lat: rest.coordinates.latitude,
          lng: rest.coordinates.longitude,
          rating: rest.rating
        });
      }
    });
  }
  
  // Add Yelp cafes
  if (travelInfo.value?.yelpCafes) {
    travelInfo.value.yelpCafes.forEach(cafe => {
      if (cafe.coordinates?.latitude && cafe.coordinates?.longitude) {
        places.push({
          name: cafe.name,
          address: cafe.address,
          category: 'cafe',
          lat: cafe.coordinates.latitude,
          lng: cafe.coordinates.longitude,
          rating: cafe.rating
        });
      }
    });
  }
  
  // Add Yelp bars
  if (travelInfo.value?.yelpBars) {
    travelInfo.value.yelpBars.forEach(bar => {
      if (bar.coordinates?.latitude && bar.coordinates?.longitude) {
        places.push({
          name: bar.name,
          address: bar.address,
          category: 'bar',
          lat: bar.coordinates.latitude,
          lng: bar.coordinates.longitude,
          rating: bar.rating
        });
      }
    });
  }
  
  return places;
}

function editItemNotes(item) {
  selectedItemForNotes.value = item;
  notesText.value = item.notes || '';
  showNotesModal.value = true;
}

function closeNotesModal() {
  showNotesModal.value = false;
  selectedItemForNotes.value = null;
  notesText.value = '';
}

async function saveNotes() {
  if (!selectedItemForNotes.value) return;
  
  try {
    // Update the item with notes
    const updatedItem = { notes: notesText.value };
    await axios.put(`/api/places/${selectedItemForNotes.value._id}`, updatedItem);
    await fetchWishlist();
    closeNotesModal();
  } catch (err) {
    console.error('Error saving notes:', err);
    alert('Failed to save notes. Please try again.');
  }
}

async function clearPlanner() {
  if (confirm('Are you sure you want to clear all items from your travel planner?')) {
    try {
      // Remove all items one by one
      for (const item of wishlist.value) {
        await removeFromWishlist(item._id);
      }
      // Refresh the wishlist
      await fetchWishlist();
    } catch (err) {
      console.error('Error clearing planner:', err);
      alert('Failed to clear planner. Please try again.');
    }
  }
}

function addToTravelList(place) {
  const currentList = JSON.parse(localStorage.getItem('selectedPlaces') || '[]');
  const existingIndex = currentList.findIndex(p => p.id === place.id);
  
  if (existingIndex === -1) {
    currentList.push(place);
    localStorage.setItem('selectedPlaces', JSON.stringify(currentList));
  }
}

function handleRouteOptimized(results) {
  routeResults.value = results;
}

function getTransportType(profile) {
  const types = {
    'driving': 'Car',
    'walking': 'Walking',
    'cycling': 'Bicycle'
  };
  return types[profile] || profile;
}
</script>

<style scoped>
.wishlist-root {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.wishlist-title {
  font-size: 2.2rem;
  font-weight: 600;
  color: #388e7d;
  text-align: center;
  margin-bottom: 1.5rem;
}
.travel-guide-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.loading-state, .error-state, .empty-state {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  margin-top: 2rem;
}
.main-content, .sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.travel-guide-container {
  margin-top: 1.5rem;
  position: relative;
}

.travel-guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.travel-guide-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #388e7d;
  margin: 0;
}

.close-travel-guide-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.close-travel-guide-btn:hover {
  background: #c53030;
  transform: translateY(-1px);
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.add-to-wishlist-btn, .view-travel-list-btn {
  background: linear-gradient(90deg, #6ee7b7 0%, #a7c7e7 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.9rem 2.2rem;
  border-radius: 1.5rem;
  box-shadow: 0 2px 12px 0 rgba(60,60,60,0.10);
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s;
}

.view-travel-list-btn {
  background: linear-gradient(90deg, #f59e42 0%, #fbbf24 100%);
}

.add-to-wishlist-btn:hover, .view-travel-list-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(60,60,60,0.15);
}
.wishlist-section {
  margin-top: 2.5rem;
  background: #fff;
  border-radius: 1.2rem;
  padding: 1.2rem 1.5rem;
}
.wishlist-section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 0.7rem;
}
.wishlist-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.wishlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-radius: 0.7rem;
  padding: 0.6rem 1rem;
  font-size: 1rem;
}
.wishlist-item button {
  background: none;
  border: none;
  color: #e57373;
  cursor: pointer;
}
.wishlist-empty {
  color: #888;
}
.foursquare-section {
  background: #f4f8fb;
  border-radius: 1.1rem;
  padding: 1.1rem 1.3rem;
  margin-top: 1.2rem;
}
.foursquare-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1d3557;
  margin-bottom: 0.7rem;
}
.foursquare-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.foursquare-item {
  background: #fff;
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
  box-shadow: 0 1px 6px 0 rgba(60,60,60,0.06);
}
.foursquare-name {
  font-weight: 600;
  color: #388e7d;
  font-size: 1.08rem;
}
.foursquare-categories {
  color: #4e5d6c;
  font-size: 0.98rem;
  margin-top: 0.1rem;
}
.foursquare-address {
  color: #888;
  font-size: 0.95rem;
  margin-top: 0.1rem;
}
.foursquare-link {
  color: #1976d2;
  font-size: 0.95rem;
  margin-top: 0.2rem;
  display: inline-block;
}
.travel-guide-flex {
  display: flex;
  gap: 2.2rem;
  margin-top: 2.2rem;
  align-items: flex-start;
}
.main-content {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.main-attractions-section {
  margin-top: 1.2rem;
}
.vertical-city-summary {
  max-width: 340px;
  margin: 0 0 1.5rem 0;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.sidebar-content {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
}
.info-cards {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.info-card {
  background: #f8fafc;
  border-radius: 1.1rem;
  box-shadow: 0 1px 8px 0 rgba(60,60,60,0.07);
  padding: 1.1rem 1.3rem;
}
.info-title {
  font-size: 1.13rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.foursquare-section {
  border-left: 4px solid #1976d2;
}
.tips-section {
  border-left: 4px solid #388e7d;
}
.attractions-section {
  border-left: 4px solid #4e5d6c;
}
.restaurants-section {
  border-left: 4px solid #e57373;
}
.restaurants-title {
  color: #e57373;
}
.restaurants-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.restaurant-item {
  background: #fff;
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
  box-shadow: 0 1px 6px 0 rgba(60,60,60,0.06);
}
.restaurant-name {
  font-weight: 600;
  color: #e57373;
  font-size: 1.08rem;
}
.restaurant-categories {
  color: #4e5d6c;
  font-size: 0.98rem;
  margin-top: 0.1rem;
}
.restaurant-address {
  color: #888;
  font-size: 0.95rem;
  margin-top: 0.1rem;
}
.restaurant-link {
  color: #1976d2;
  font-size: 0.95rem;
  margin-top: 0.2rem;
  display: inline-block;
}
.country-info-card {
  display: flex;
  align-items: center;
  gap: 2.2rem;
  background: #f4f8fb;
  border-radius: 1.2rem;
  box-shadow: 0 2px 12px 0 rgba(60,60,60,0.08);
  padding: 1.5rem 2rem;
  margin-bottom: 2.2rem;
}
.country-flag img {
  width: 80px;
  height: 54px;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 1px 6px 0 rgba(60,60,60,0.10);
  background: #fff;
}
.country-info-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.country-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #388e7d;
}
.country-official {
  font-size: 1.05rem;
  color: #4e5d6c;
  margin-bottom: 0.2rem;
}
.country-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.98rem;
  color: #444;
  margin-bottom: 0.1rem;
}
.country-map-link {
  color: #1976d2;
  text-decoration: underline;
  font-size: 0.98rem;
  margin-top: 0.2rem;
}
.city-summary-box {
  background: #f8fafc;
  border-radius: 1.1rem;
  box-shadow: 0 1px 8px 0 rgba(60,60,60,0.07);
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
.city-summary-title {
  font-size: 1.13rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 0.5rem;
}
.city-summary-text {
  color: #444;
  font-size: 1.04rem;
  line-height: 1.6;
}
.tourist-attractions-section {
  border-left: 4px solid #f59e42;
}
.tourist-attractions-title {
  color: #f59e42;
}
.tourist-attractions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.tourist-attraction-item {
  background: #fff;
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
  box-shadow: 0 1px 6px 0 rgba(60,60,60,0.06);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.tourist-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  color: #f59e42;
  font-size: 1.08rem;
  margin-bottom: 0.1rem;
}
.tourist-attraction-categories {
  color: #4e5d6c;
  font-size: 0.98rem;
  margin: 0.3rem 0;
}

.category-badge {
  background: linear-gradient(90deg, #f59e42 0%, #fbbf24 100%);
  color: #fff;
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  text-transform: capitalize;
}
.tourist-attraction-address {
  color: #888;
  font-size: 0.95rem;
}
.tourist-attraction-desc {
  color: #444;
  font-size: 0.92rem;
  margin-top: 0.2rem;
}
.tourist-attraction-image-container {
  margin-top: 0.8rem;
  border-radius: 0.8rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tourist-attraction-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.tourist-attraction-img:hover {
  transform: scale(1.05);
}
.tourist-attraction-link {
  color: #1976d2;
  font-size: 0.95rem;
  margin-top: 0.2rem;
  display: inline-block;
}
.add-selected-attractions-btn {
  background: linear-gradient(90deg, #f59e42 0%, #fbbf24 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 0.7rem 1.7rem;
  border-radius: 1.2rem;
  border: none;
  cursor: pointer;
  margin-top: 1.1rem;
  align-self: flex-end;
  box-shadow: 0 2px 8px 0 rgba(60,60,60,0.08);
  transition: background 0.2s;
}
.add-selected-attractions-btn:hover {
  background: linear-gradient(90deg, #fbbf24 0%, #f59e42 100%);
}
.travel-planner-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f59e42;
  margin-bottom: 0.5rem;
  margin-top: -0.5rem;
  letter-spacing: 0.01em;
}
.museums-section {
  border-left: 4px solid #7c3aed;
}
.museums-title {
  color: #7c3aed;
}
.shopping-section {
  border-left: 4px solid #f472b6;
}
.shopping-title {
  color: #f472b6;
}
.cafes-section {
  border-left: 4px solid #10b981;
}
.cafes-title {
  color: #10b981;
}
.bars-section {
  border-left: 4px solid #f59e42;
}
.bars-title {
  color: #f59e42;
}
.planner-group {
  margin-bottom: 1.2rem;
}
.planner-group-title {
  font-size: 1.08rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 0.4rem;
}
.export-pdf-btn {
  background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 0.7rem 1.7rem;
  border-radius: 1.2rem;
  border: none;
  cursor: pointer;
  margin-bottom: 1.1rem;
  box-shadow: 0 2px 8px 0 rgba(60,60,60,0.08);
  transition: background 0.2s;
}
.export-pdf-btn:hover {
  background: linear-gradient(90deg, #38bdf8 0%, #6366f1 100%);
}
.yelp-section {
  border-left: 4px solid #ffb300;
}
.yelp-title {
  color: #ffb300;
}
.attractions-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.yelp-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.yelp-col {
  flex: 1 1 0;
  min-width: 0;
}
.geoapify-side-section {
  min-width: 340px;
  max-width: 420px;
}
.scrollable-attractions-list {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}
.planner-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.2rem;
}
.clear-planner-btn {
  background: linear-gradient(90deg, #e57373 0%, #ef5350 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 0.7rem 1.7rem;
  border-radius: 1.2rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 rgba(60,60,60,0.08);
  transition: background 0.2s;
}
.clear-planner-btn:hover {
  background: linear-gradient(90deg, #ef5350 0%, #e57373 100%);
}
.travel-guide-summary {
  background: #f8fafc;
  border-radius: 1.1rem;
  box-shadow: 0 1px 8px 0 rgba(60,60,60,0.07);
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
.summary-stats {
  display: flex;
  justify-content: space-around;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.stat-item {
  text-align: center;
  padding: 0.8rem 1.2rem;
  background: #fff;
  border-radius: 0.8rem;
  box-shadow: 0 1px 6px 0 rgba(60,60,60,0.06);
}
.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #388e7d;
  display: block;
  margin-bottom: 0.3rem;
}
.stat-label {
  font-size: 0.95rem;
  color: #444;
}
.planner-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.8rem;
}
.planner-item {
  background: #f8fafc;
  border-radius: 0.8rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 1px 6px 0 rgba(60,60,60,0.06);
}
.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.item-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #388e7d;
}
.item-location {
  font-size: 0.9rem;
  color: #4e5d6c;
  margin-bottom: 0.2rem;
}
.item-description {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.4;
}
.item-notes {
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.3rem;
}
.item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-self: flex-start;
}
.travel-planner-btn {
  background: linear-gradient(90deg, #f59e42 0%, #fbbf24 100%);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.6rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 4px 0 rgba(60,60,60,0.1);
  transition: background 0.2s;
}
.travel-planner-btn:hover {
  background: linear-gradient(90deg, #fbbf24 0%, #f59e42 100%);
}
.planner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.planner-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.search-container {
  position: relative;
  display: flex;
  align-items: center;
}
.wishlist-search-input {
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.8rem;
  font-size: 0.95rem;
  background: #fff;
  color: #374151;
  transition: all 0.2s;
  min-width: 250px;
}
.wishlist-search-input:focus {
  outline: none;
  border-color: #388e7d;
  box-shadow: 0 0 0 3px rgba(56, 142, 125, 0.1);
}
.wishlist-search-input::placeholder {
  color: #9ca3af;
}
.search-icon {
  position: absolute;
  right: 0.8rem;
  color: #9ca3af;
  font-size: 1rem;
  pointer-events: none;
}
.wishlist-empty-message {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 1rem;
  border: 2px dashed #cbd5e1;
  margin: 1rem 0;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}
.empty-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
}
.empty-description {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}
.map-section {
  margin-top: 2rem;
  background: #fff;
  border-radius: 1.2rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px 0 rgba(60,60,60,0.08);
}
.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.map-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #388e7d;
  margin: 0;
}
.map-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4e5d6c;
  background: #f8fafc;
  padding: 0.4rem 0.8rem;
  border-radius: 0.6rem;
  border: 1px solid #e2e8f0;
}
.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

/* Responsive Design for WishlistView */
@media (max-width: 768px) {
  .wishlist-root {
    padding: 1rem;
    max-width: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  
  .wishlist-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  .travel-guide-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .top-row {
    flex-direction: column;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .vertical-city-summary {
    max-width: 100%;
    width: 100%;
    min-height: auto;
  }
  
  .attractions-row, .yelp-row {
    flex-direction: column;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .geoapify-side-section {
    min-width: 100%;
    max-width: 100%;
    width: 100%;
  }
  
  .map-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .map-legend {
    flex-wrap: wrap;
    gap: 0.5rem;
    max-width: 100%;
    width: 100%;
  }
  
  .legend-item {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
  
  .planner-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .planner-actions {
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    gap: 1rem;
  }
  
  .wishlist-search-input {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }
  
  .planner-items-grid {
    grid-template-columns: 1fr;
    max-width: 100%;
    width: 100%;
  }
  
  .planner-item {
    flex-direction: column;
    gap: 0.8rem;
    max-width: 100%;
    width: 100%;
  }
  
  .item-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.8rem;
    max-width: 100%;
    width: 100%;
  }
  
  .add-to-wishlist-btn, .view-travel-list-btn {
    width: 100%;
    max-width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .wishlist-root {
    padding: 0.5rem;
    max-width: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  
  .wishlist-title {
    font-size: 1.5rem;
  }
  
  .map-section {
    padding: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .wishlist-section {
    padding: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .travel-guide-summary {
    padding: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .stat-item {
    padding: 0.6rem 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }

  /* Mobile responsive for route optimization */
  .route-stats {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .route-stat {
    padding: 0.8rem;
  }

  .route-stat-icon {
    font-size: 1.2rem;
  }

  .route-stat-value {
    font-size: 1rem;
  }

  .route-place-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.6rem 0.8rem;
  }

  .route-place-number {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.8rem;
  }

  .route-place-name {
    font-size: 0.9rem;
  }

  .route-place-category {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}
.edit-notes-btn {
  background: linear-gradient(90deg, #42a5f5 0%, #2979ff 100%);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.6rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 4px 0 rgba(60,60,60,0.1);
  transition: background 0.2s;
}
.edit-notes-btn:hover {
  background: linear-gradient(90deg, #2979ff 0%, #42a5f5 100%);
}
.remove-btn {
  background: linear-gradient(90deg, #ef5350 0%, #f44336 100%);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.6rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 4px 0 rgba(60,60,60,0.1);
  transition: background 0.2s;
}
.remove-btn:hover {
  background: linear-gradient(90deg, #f44336 0%, #ef5350 100%);
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.notes-modal h3 {
  color: #388e7d;
  margin-bottom: 1.2rem;
  text-align: center;
}
.notes-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 0.6rem;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}
.save-notes-btn, .cancel-btn {
  flex: 1;
  padding: 0.8rem 1.5rem;
  border-radius: 0.8rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
}
.save-notes-btn {
  background: linear-gradient(90deg, #42a5f5 0%, #2979ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px 0 rgba(60,60,60,0.1);
  transition: background 0.2s;
}
.save-notes-btn:hover {
  background: linear-gradient(90deg, #2979ff 0%, #42a5f5 100%);
}
.cancel-btn {
  background: #e0e0e0;
  color: #333;
  box-shadow: 0 2px 8px 0 rgba(60,60,60,0.1);
  transition: background 0.2s;
}
  .cancel-btn:hover {
    background: #d0d0d0;
  }

  /* Route Optimization Styles */
  .route-results-section {
    margin-top: 2rem;
    background: #fff;
    border-radius: 1.2rem;
    padding: 1.5rem;
    box-shadow: 0 2px 8px 0 rgba(60,60,60,0.08);
  }

  .route-success {
    text-align: center;
  }

  .route-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #388e7d;
    margin-bottom: 1.5rem;
  }

  .route-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .route-stat {
    background: #f8fafc;
    border-radius: 0.8rem;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 1px 6px 0 rgba(60,60,60,0.06);
  }

  .route-stat-icon {
    font-size: 1.5rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .route-stat-label {
    font-size: 0.9rem;
    color: #4e5d6c;
    display: block;
    margin-bottom: 0.3rem;
  }

  .route-stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #388e7d;
    display: block;
  }

  .route-places {
    margin-bottom: 2rem;
  }

  .route-places-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #388e7d;
    margin-bottom: 1rem;
    text-align: left;
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
    background: #f8fafc;
    border-radius: 0.6rem;
    padding: 0.8rem 1rem;
    box-shadow: 0 1px 4px 0 rgba(60,60,60,0.06);
  }

  .route-place-number {
    background: linear-gradient(90deg, #388e7d 0%, #6ee7b7 100%);
    color: #fff;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .route-place-name {
    flex: 1;
    font-weight: 600;
    color: #388e7d;
  }

  .route-place-category {
    background: #e0f2f1;
    color: #388e7d;
    padding: 0.3rem 0.6rem;
    border-radius: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .close-route-btn {
    background: linear-gradient(90deg, #388e7d 0%, #6ee7b7 100%);
    color: #fff;
    font-weight: 600;
    font-size: 1rem;
    padding: 0.8rem 1.5rem;
    border-radius: 1rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 8px 0 rgba(60,60,60,0.1);
    transition: all 0.2s;
  }

  .close-route-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px 0 rgba(60,60,60,0.15);
  }

  .route-error {
    text-align: center;
    color: #e53e3e;
  }

  .route-error .route-title {
    color: #e53e3e;
  }

  .route-error-message {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    color: #e53e3e;
  }

  @media (max-width: 1100px) {
    .top-row {
      flex-direction: column;
      gap: 1.2rem;
    }
  }
@media (max-width: 900px) {
  .travel-guide-flex {
    flex-direction: column;
    gap: 1.5rem;
  }
  .sidebar-content {
    flex: unset;
  }
  .attractions-row {
    flex-direction: column;
    gap: 1.2rem;
  }
  .geoapify-side-section {
    max-width: 100%;
    min-width: unset;
  }
  .yelp-row {
    flex-direction: column;
    gap: 1.2rem;
  }
}
</style> 