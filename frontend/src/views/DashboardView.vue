<template>
  <div class="dashboard-root">
    <header class="dashboard-header">
      <div class="header-content">
        <img src="/src/assets/Where Have I Been.png" alt="My Travel Map Logo" class="logo" />
        <h1 class="app-title">My Travel Map</h1>
      </div>
    </header>
    <div class="dashboard-main">
      <aside class="sidebar" :aria-label="'Visited Places'">
        <h2 class="sidebar-title">Visited Places</h2>
        <input v-model="searchQuery" class="places-search" type="text" placeholder="Search places..." />
        <ul class="places-list">
          <li v-for="place in filteredPlaces" :key="place._id" class="place-card" @click="showPlaceDetails(place)" tabindex="0">
                         <img v-if="place.photoUrl" :src="getPhotoUrl(place.photoUrl)" alt="Place photo" class="place-thumb" />
            <div class="place-info">
              <div class="place-title">{{ place.title }}</div>
              <div class="place-meta">{{ place.city }}, {{ place.country }}</div>
              <div class="place-date">{{ formatDate(place.visitedAt) }}</div>
              <div v-if="place.description" class="place-desc">{{ place.description }}</div>
            </div>
            <div class="place-actions">
              <button class="edit-btn" @click.stop="editPlace(place)" aria-label="Edit">✏️</button>
              <button class="delete-btn" @click.stop="deletePlace(place._id)" aria-label="Delete">🗑️</button>
            </div>
          </li>
        </ul>
      </aside>
      <main class="map-area">
        <MapView 
          :places="filteredPlaces" 
          :onMarkerClick="showPlaceDetails" 
          @addPlace="handleAddPlace" 
          :searchQuery="searchQuery"
          @mapClick="handleMapClick"
        />
        <button class="fab" @click="showForm = true" aria-label="Add Place">＋</button>
      </main>
    </div>
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-content" role="dialog" aria-modal="true">
        <PlaceForm ref="placeFormRef" :place="selectedPlace" :isEdit="!!selectedPlace" @submit="handleFormSubmit" @requestMapClick="enableMapPick" />
        <button class="close-modal" @click="showForm = false" aria-label="Close">×</button>
      </div>
    </div>
    
    <!-- Place Details Modal -->
    <PlaceDetailsModal 
      :show="showDetailsModal"
      :place="selectedPlaceForDetails"
      @close="showDetailsModal = false"
      @edit="editPlace"
      @delete="deletePlace"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MapView from '../components/MapView.vue';
import PlaceForm from '../components/PlaceForm.vue';
import PlaceDetailsModal from '../components/PlaceDetailsModal.vue';
import axios from 'axios';

const places = ref([]);
const showForm = ref(false);
const selectedPlace = ref(null);
const placeFormRef = ref(null);
const searchQuery = ref('');
const showDetailsModal = ref(false);
const selectedPlaceForDetails = ref(null);
let mapPickMode = false;

async function fetchPlaces() {
  const res = await axios.get('/api/places');
  places.value = res.data;
}

onMounted(fetchPlaces);

const filteredPlaces = computed(() => {
  return places.value.filter(place => !place.wishlist).filter(place => {
    if (!searchQuery.value.trim()) return true;
    const q = searchQuery.value.trim().toLowerCase();
    return (
      (place.title && place.title.toLowerCase().includes(q)) ||
      (place.city && place.city.toLowerCase().includes(q)) ||
      (place.country && place.country.toLowerCase().includes(q)) ||
      (place.description && place.description.toLowerCase().includes(q))
    );
  });
});

function showPlaceDetails(place) {
  selectedPlaceForDetails.value = place;
  showDetailsModal.value = true;
}

function editPlace(place) {
  selectedPlace.value = place;
  showForm.value = true;
  showDetailsModal.value = false;
}

function deletePlace(id) {
  axios.delete(`/api/places/${id}`).then(() => {
    fetchPlaces();
    showDetailsModal.value = false;
  });
}

function handleFormSubmit(formData) {
  if (selectedPlace.value) {
    axios.put(`/api/places/${selectedPlace.value._id}`, formData).then(() => {
      showForm.value = false;
      selectedPlace.value = null;
      fetchPlaces();
    });
  } else {
    axios.post('/api/places', formData).then(() => {
      showForm.value = false;
      fetchPlaces();
    });
  }
}

function enableMapPick() {
  mapPickMode = true;
}

function handleMapClick(lat, lng) {
  if (mapPickMode && placeFormRef.value) {
    placeFormRef.value.setCoordinates(lat, lng);
    mapPickMode = false;
  } else if (showForm.value && placeFormRef.value) {
    // If form is open, automatically set coordinates
    placeFormRef.value.setCoordinates(lat, lng);
  } else {
    // If no form is open, open the form and set coordinates
    showForm.value = true;
    selectedPlace.value = null;
    // Wait for form to be mounted, then set coordinates
    setTimeout(() => {
      if (placeFormRef.value) {
        placeFormRef.value.setCoordinates(lat, lng);
      }
    }, 100);
  }
}

async function handleAddPlace(newPlace) {
  // Prompt for title, city, country if not provided
  let title = newPlace.title;
  let city = newPlace.city;
  let country = newPlace.country;
  if (!title) title = prompt('Enter a title for this place:') || '';
  if (!city) city = prompt('Enter the city for this place:') || '';
  if (!country) country = prompt('Enter the country for this place:') || '';
  const fd = new FormData();
  fd.append('lat', newPlace.lat);
  fd.append('lng', newPlace.lng);
  fd.append('description', newPlace.description);
  fd.append('visitedAt', newPlace.visitedAt);
  fd.append('title', title);
  fd.append('city', city);
  fd.append('country', country);
  if (newPlace.photo) fd.append('photo', newPlace.photo);
  await axios.post('/api/places', fd);
  await fetchPlaces();
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function getPhotoUrl(photoUrl) {
  if (!photoUrl) return '';
  // Eğer URL zaten tam URL ise, olduğu gibi döndür
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  // If it's a relative path, add the backend URL
  const isProduction = import.meta.env.PROD;
  const baseUrl = import.meta.env.VITE_API_URL || (isProduction ? 'https://whib.onrender.com' : 'http://localhost:5000');
  return `${baseUrl}${photoUrl}`;
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

.dashboard-root {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f7fa 100%);
  font-family: 'Poppins', 'Roboto', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(60, 60, 60, 0.06);
  padding: 1.2rem 0 1rem 0;
  border-bottom-left-radius: 2rem;
  border-bottom-right-radius: 2rem;
  margin-bottom: 1.5rem;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  gap: 1rem;
}
.logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e0f2f1;
  padding: 0.3rem;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.08);
  transition: transform 0.3s;
}
.logo:hover {
  transform: scale(1.08) rotate(-6deg);
}
.app-title {
  font-size: 2rem;
  font-weight: 600;
  color: #388e7d;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 8px #e0f2f1;
  flex: 1;
  text-align: left;
}
.logout-btn {
  background: linear-gradient(90deg, #a7c7e7 0%, #6ee7b7 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 1.2rem;
  padding: 0.5rem 1.3rem;
  font-size: 1rem;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.10);
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}
.logout-btn:hover, .logout-btn:focus {
  background: linear-gradient(90deg, #6ee7b7 0%, #a7c7e7 100%);
  transform: translateY(-2px) scale(1.04);
}

.dashboard-main {
  display: flex;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  gap: 2rem;
  align-items: flex-start;
  height: 100%;
  min-height: 0;
}
.sidebar {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 32px 0 rgba(60, 60, 60, 0.08);
  padding: 2rem 1.2rem;
  width: 320px;
  min-width: 220px;
  max-height: none;
  height: 97%;
  overflow-y: auto;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.sidebar-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 1.2rem;
  text-align: center;
}
.places-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.place-card {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 1rem;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.06);
  padding: 0.7rem 0.8rem;
  gap: 0.8rem;
  cursor: pointer;
  transition: box-shadow 0.2s, background 0.2s;
  outline: none;
}
.place-card:focus, .place-card:hover {
  box-shadow: 0 6px 24px 0 rgba(60, 60, 60, 0.12);
  background: #e0f7fa;
}
.place-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 0.7rem;
  box-shadow: 0 1px 4px 0 rgba(60, 60, 60, 0.10);
  background: #e0f2f1;
}
.place-info {
  flex: 1;
  min-width: 0;
}
.place-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.place-meta {
  font-size: 0.97rem;
  color: #4e5d6c;
}
.place-date {
  font-size: 0.85rem;
  color: #a7c7e7;
}
.place-desc {
  font-size: 0.95rem;
  color: #4e5d6c;
  margin-top: 0.3rem;
  white-space: pre-line;
}
.place-actions {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.edit-btn, .delete-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #388e7d;
  padding: 0.2rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}
.edit-btn:hover, .delete-btn:hover {
  background: #e0f7fa;
}
.map-area {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: center;
  height: 100%;
}
.fab {
  position: absolute;
  bottom: 2.5rem;
  right: 2.5rem;
  background: linear-gradient(90deg, #6ee7b7 0%, #a7c7e7 100%);
  color: #fff;
  font-size: 2.2rem;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  box-shadow: 0 4px 16px 0 rgba(60, 60, 60, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  z-index: 10;
}
.fab:hover, .fab:focus {
  background: linear-gradient(90deg, #a7c7e7 0%, #6ee7b7 100%);
  transform: scale(1.08);
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
  padding: 1rem;
  min-width: 300px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: popIn 0.2s;
}
@keyframes popIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #a7c7e7;
  cursor: pointer;
  transition: color 0.2s;
}
.close-modal:hover, .close-modal:focus {
  color: #388e7d;
}

.places-search {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.7rem 1rem;
  border-radius: 1rem;
  border: 1px solid #e0f2f1;
  background: #f8fafc;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}
.places-search:focus {
  border: 1.5px solid #6ee7b7;
  box-shadow: 0 2px 8px 0 #a7c7e7;
}

@media (max-width: 900px) {
  .dashboard-main {
    flex-direction: column;
    gap: 1.2rem;
    height: auto;
  }
  .sidebar {
    width: 100%;
    max-width: 100vw;
    min-width: 0;
    max-height: 180px;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 1rem 0.5rem;
    margin-bottom: 0;
    align-items: flex-start;
  }
  .places-list {
    flex-direction: row;
    gap: 0.7rem;
  }
  .place-card {
    min-width: 180px;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
    padding: 0.6rem 0.5rem;
  }
  .map-area {
    height: 50vh;
  }
}
@media (max-width: 600px) {
  .dashboard-header {
    padding: 0.7rem 0 0.7rem 0;
  }
  .app-title {
    font-size: 1.1rem;
  }
  .sidebar-title {
    font-size: 1rem;
  }
  .modal-content {
    min-width: 0;
    padding: 1.1rem 0.5rem 0.7rem 0.5rem;
    border-radius: 1rem;
  }
}
</style> 