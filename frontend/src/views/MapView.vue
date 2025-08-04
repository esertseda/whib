<template>
  <div class="max-w-5xl mx-auto py-10 px-4">
    <h2 class="text-2xl font-bold text-primary mb-6">World Map</h2>
    <CitySearch @select="selectCity" />
    <div class="mt-6 rounded-chic overflow-hidden shadow-chic">
      <l-map style="height: 500px; width: 100%;" :zoom="2" :center="[20, 0]">
        <l-tile-layer :url="tileUrl" :attribution="attribution" />
        <l-marker v-for="place in places" :key="place._id" :lat-lng="[place.lat, place.lng]">
          <l-popup>
            <div class="font-semibold">{{ place.title }}</div>
            <div class="text-sm text-gray-500">{{ place.city }}, {{ place.country }}</div>
            <router-link :to="`/city/${place._id}`" class="text-primary hover:underline text-xs">Details</router-link>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LMap, LTileLayer, LMarker, LPopup } from 'vue3-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // ✅ Leaflet ana kütüphane importu
import CitySearch from '../components/CitySearch.vue';
import { getPlaces } from '../services/places';

// ✅ Leaflet marker ikonlarını düzelt
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
});

const router = useRouter();
const places = ref([]);
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; OpenStreetMap contributors';

async function fetchPlaces() {
  places.value = await getPlaces();
}

function selectCity(city) {
  // Navigate to city details page with coordinates
  router.push({
    path: `/city/${encodeURIComponent(city.name)}`,
    query: { 
      lat: city.coordinates.lat, 
      lng: city.coordinates.lng,
      country: city.country
    }
  });
}

onMounted(fetchPlaces);
</script>

<style scoped>
/* Responsive Design for MapView */
@media (max-width: 768px) {
  .max-w-5xl {
    padding: 1rem;
    max-width: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .l-map {
    height: 400px !important;
  }
}

@media (max-width: 480px) {
  .max-w-5xl {
    padding: 0.5rem;
    max-width: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  
  h2 {
    font-size: 1.3rem;
  }
  
  .l-map {
    height: 300px !important;
  }
}
</style>
