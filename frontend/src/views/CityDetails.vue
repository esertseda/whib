<template>
  <div class="max-w-6xl mx-auto py-10 px-4">
    <!-- City Search Section -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-primary mb-4">Search and Explore Cities</h2>
      <CitySearch @select="selectCity" />
    </div>

    <!-- Selected City Info -->
    <div v-if="selectedCity" class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm">
      <h3 class="text-xl font-semibold text-gray-800 mb-2">
        {{ selectedCity.name }}, {{ selectedCity.country }}
      </h3>
      <p class="text-gray-600 mb-4">
        {{ filteredPlaces.length }} places found in this city
      </p>
      <div class="flex gap-4">
        <button 
          @click="showMap = true" 
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          🗺️ Show on Map
        </button>
        <button 
          @click="addToWishlist" 
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          ❤️ Add to Wishlist
        </button>
      </div>
    </div>

    <!-- Map Section -->
    <div v-if="showMap && selectedCity" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">🗺️ {{ selectedCity.name }} Map</h3>
      <div class="h-96 rounded-xl overflow-hidden shadow-lg">
        <CityMap 
          :cityName="selectedCity.name"
          :places="filteredPlaces"
          :cityCoordinates="selectedCity.coordinates"
        />
      </div>
    </div>

    <!-- Places List -->
    <div v-if="selectedCity && filteredPlaces.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📍 Places in {{ selectedCity.name }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="place in filteredPlaces" 
          :key="place._id"
          class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <h4 class="font-semibold text-gray-800">{{ place.title }}</h4>
          <p class="text-sm text-gray-600 mb-2">{{ place.category || 'General' }}</p>
          <p class="text-xs text-gray-500">{{ place.description }}</p>
          <div class="mt-2 flex gap-2">
            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {{ place.visitedAt ? 'Visited' : 'Not Visited' }}
            </span>
            <span v-if="place.wishlist" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              In Wishlist
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Travel Info Section -->
    <div v-if="selectedCity" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">🌍 About {{ selectedCity.name }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Attractions -->
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <h4 class="font-semibold mb-2">🎯 Must-See Places</h4>
          <ul class="space-y-1">
            <li v-for="attraction in travelInfo?.attractions?.slice(0, 5) || []" :key="attraction.name" class="text-sm text-gray-700">
              • {{ attraction.name }}
            </li>
          </ul>
        </div>

        <!-- Cultural Tips -->
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <h4 class="font-semibold mb-2">💡 Cultural Tips</h4>
          <ul class="space-y-1">
            <li v-for="tip in travelInfo?.culturalTips?.slice(0, 3) || []" :key="tip" class="text-sm text-gray-700">
              • {{ tip }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Original Content (fallback) -->
    <div v-if="!selectedCity" class="mb-8">
      <h2 class="text-2xl font-bold text-primary mb-6">{{ city?.name }}, {{ city?.country }}</h2>
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-2">Must-See Attractions</h3>
        <ul class="list-disc list-inside text-gray-700">
          <li v-for="attraction in city?.attractions || []" :key="attraction">{{ attraction }}</li>
        </ul>
      </div>
      <div class="mb-8">
       
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
         
        </div>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-2">Local Tips</h3>
        <div class="space-y-2">
          <CityTip v-for="tip in city?.tips || []" :key="tip" :tip="tip" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CityTip from '../components/CityTip.vue';
import CitySearch from '../components/CitySearch.vue';
import CityMap from '../components/CityMap.vue';
import { getCityDetails, getTravelInfo } from '../services/cities';
import { getPlaces } from '../services/places';

const route = useRoute();
const router = useRouter();
const city = ref(null);
const selectedCity = ref(null);
const showMap = ref(false);
const allPlaces = ref([]);
const travelInfo = ref(null);

// Filter places for selected city
const filteredPlaces = computed(() => {
  if (!selectedCity.value || !allPlaces.value.length) return [];
  return allPlaces.value.filter(place => 
    place.city?.toLowerCase() === selectedCity.value.name.toLowerCase() ||
    place.city?.toLowerCase().includes(selectedCity.value.name.toLowerCase())
  );
});

// Select city from search
async function selectCity(cityData) {
  selectedCity.value = cityData;
  showMap.value = true;
  
  // Update URL
  router.push({
    path: `/city/${encodeURIComponent(cityData.name)}`,
    query: { 
      lat: cityData.coordinates.lat, 
      lng: cityData.coordinates.lng,
      country: cityData.country
    }
  });

  // Load travel info for the city
  try {
    travelInfo.value = await getTravelInfo(cityData.name, cityData.country);
  } catch (error) {
    console.error('Error loading travel info:', error);
  }
}

// Add city to wishlist
async function addToWishlist() {
  if (!selectedCity.value) return;
  
  try {
    // This would typically call an API to add to wishlist
    console.log('Adding to wishlist:', selectedCity.value);
    // You can implement the actual wishlist functionality here
  } catch (error) {
    console.error('Error adding to wishlist:', error);
  }
}

// Load places from backend
async function loadPlaces() {
  try {
    allPlaces.value = await getPlaces();
  } catch (error) {
    console.error('Error loading places:', error);
  }
}

// Check if we have city data in URL
function checkUrlForCity() {
  const cityName = route.params.id;
  const lat = route.query.lat;
  const lng = route.query.lng;
  const country = route.query.country;

  if (cityName && lat && lng) {
    selectedCity.value = {
      name: decodeURIComponent(cityName),
      country: country || '',
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      }
    };
    showMap.value = true;
  }
}

onMounted(async () => {
  await loadPlaces();
  checkUrlForCity();
  
  // Load original city data if no selected city
  if (!selectedCity.value) {
    city.value = await getCityDetails(route.params.id);

  }
});

// Watch for route changes
watch(() => route.params.id, () => {
  checkUrlForCity();
});
</script> 