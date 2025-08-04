<template>
  <div class="map-container">
    <CitySearch @select="handleCitySelect" />
    <div id="map" class="main-map"></div>

    <!-- Modal with PlaceForm -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" role="dialog" aria-modal="true">
        <PlaceForm
          :isEdit="false"
          @submit="submitPlaceForm"
          @requestMapClick="handleMapRequest"
          ref="placeForm"
        />
        <div class="modal-actions">
          <button type="button" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, defineEmits, defineProps, nextTick } from 'vue';
import L from 'leaflet';
import CitySearch from './CitySearch.vue';
import PlaceForm from './PlaceForm.vue'; // ✅ Güncel bileşen ismi burada

const props = defineProps({
  places: Array,
  onMarkerClick: Function,
  onMapClick: Function,
  searchQuery: String
});

const emit = defineEmits(['addPlace', 'mapClick']);

let map = null;
let markers = [];
const showAddModal = ref(false);
const tempSearchMarker = ref(null);
const placeForm = ref(null);

onMounted(() => {
  map = L.map('map', { zoomControl: true }).setView([20, 0], 3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  map.on('click', (e) => {
    emit('mapClick', e.latlng.lat, e.latlng.lng);
  });

  updateMarkers();
});

watch([() => props.places, () => props.searchQuery], updateMarkers, { deep: true });

function updateMarkers() {
  if (!map) return;
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  (props.places || []).forEach(place => {
    if (!place.coordinates) return;
    const marker = L.marker([place.coordinates.lat, place.coordinates.lng]).addTo(map);
    marker.on('click', () => props.onMarkerClick && props.onMarkerClick(place));
    marker.bindPopup(`<b>${place.title || ''}</b><br>${place.city || ''}, ${place.country || ''}`);
    markers.push(marker);
  });

  if (tempSearchMarker.value) {
    map.removeLayer(tempSearchMarker.value);
    tempSearchMarker.value = null;
  }
}

function closeModal() {
  showAddModal.value = false;
}

function submitPlaceForm(formData) {
  const placeObj = Object.fromEntries(formData.entries());
  emit('addPlace', placeObj);
  closeModal();
}

function handleMapRequest() {
  alert("Map interaction requested from PlaceForm");
}

function handleCitySelect(city) {
  if (city && city.coordinates) {
    map.setView([city.coordinates.lat, city.coordinates.lng], 13);

    if (tempSearchMarker.value) {
      map.removeLayer(tempSearchMarker.value);
    }

    tempSearchMarker.value = L.marker([city.coordinates.lat, city.coordinates.lng], { opacity: 0.8 }).addTo(map);
    tempSearchMarker.value.bindPopup(`<b>${city.name || ''}</b><br>${city.country || ''}`).openPopup();

    showAddModal.value = true;

    nextTick(() => {
      placeForm.value?.setCoordinates(city.coordinates.lat, city.coordinates.lng);
    });
  }
}
</script>


<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  position: relative;
}
.main-map {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  border-radius: 2rem;
  box-shadow: 0 4px 32px 0 rgba(60, 60, 60, 0.10);
  margin: 0 auto;
  z-index: 1;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(60, 60, 60, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-content {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 48px 0 rgba(60, 60, 60, 0.18);
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  min-width: 320px;
  max-width: 95vw;
  position: relative;
  animation: popIn 0.2s;
}
@keyframes popIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.add-place-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.add-place-form label {
  font-weight: 500;
  color: #388e7d;
  margin-bottom: 0.2rem;
  text-align: left;
}
.add-place-form textarea,
.add-place-form input[type="date"] {
  border-radius: 1rem;
  border: 1px solid #e0f2f1;
  background: #f8fafc;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}
.add-place-form textarea:focus,
.add-place-form input[type="date"]:focus {
  border: 1.5px solid #6ee7b7;
  box-shadow: 0 2px 8px 0 #a7c7e7;
}
.add-place-form button {
  background: linear-gradient(90deg, #6ee7b7 0%, #a7c7e7 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.7rem 2rem;
  border-radius: 1.5rem;
  border: none;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
}
.add-place-form button:hover, .add-place-form button:focus {
  background: linear-gradient(90deg, #a7c7e7 0%, #6ee7b7 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 6px 24px 0 rgba(60, 60, 60, 0.14);
}
.photo-preview img {
  max-width: 180px;
  max-height: 180px;
  border-radius: 1rem;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.10);
}
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
@media (max-width: 900px) {
  .main-map {
    height: 50vh;
    min-height: 300px;
  }
}
</style> 