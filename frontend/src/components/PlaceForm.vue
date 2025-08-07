<template>
  <div class="place-form-container">
    <div class="form-header">
      <h2 class="form-title">{{ isEdit ? 'Edit Place' : 'Add New Place' }}</h2>
      <p class="form-subtitle">{{ isEdit ? 'Update your travel memory' : 'Share your travel experience' }}</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="modern-form">
      <div class="form-grid">
        <!-- Title Field -->
        <div class="form-group">
          <label for="title" class="form-label">
            <span class="label-icon">📍</span>
            Place Title
          </label>
          <input 
            id="title"
            v-model="form.title" 
            placeholder="Enter place name..." 
            required 
            :class="['form-input', { 'auto-filled': locationAutoFilled && form.title }]"
          />
          <div v-if="isLoadingLocation" class="location-loading"></div>
        </div>

        <!-- Location Fields -->
        <div class="form-group">
          <label for="country" class="form-label">
            <span class="label-icon">🌍</span>
            Country
          </label>
          <input 
            id="country"
            v-model="form.country" 
            placeholder="Enter country..." 
            required 
            :class="['form-input', { 'auto-filled': locationAutoFilled && form.country }]"
          />
          <div v-if="isLoadingLocation" class="location-loading"></div>
        </div>

        <div class="form-group">
          <label for="city" class="form-label">
            <span class="label-icon">🏙️</span>
            City
          </label>
          <input 
            id="city"
            v-model="form.city" 
            placeholder="Enter city..." 
            required 
            :class="['form-input', { 'auto-filled': locationAutoFilled && form.city }]"
          />
          <div v-if="isLoadingLocation" class="location-loading"></div>
        </div>

        <!-- Date Field -->
        <div class="form-group">
          <label for="visitedAt" class="form-label">
            <span class="label-icon">📅</span>
            Visit Date
          </label>
          <input 
            id="visitedAt"
            type="date" 
            v-model="form.visitedAt" 
            required 
            class="form-input"
          />
        </div>

        <!-- Coordinates Fields -->
        <div class="form-group">
          <label for="lat" class="form-label">
            <span class="label-icon">📍</span>
            Latitude
          </label>
          <input 
            id="lat"
            type="number" 
            v-model.number="form.lat" 
            placeholder="0.000000" 
            step="any" 
            required 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="lng" class="form-label">
            <span class="label-icon">📍</span>
            Longitude
          </label>
          <input 
            id="lng"
            type="number" 
            v-model.number="form.lng" 
            placeholder="0.000000" 
            step="any" 
            required 
            class="form-input"
          />
        </div>
      </div>

      <!-- Description Field -->
      <div class="form-group full-width">
        <label for="description" class="form-label">
          <span class="label-icon">📝</span>
          Notes & Memories
        </label>
        <textarea 
          id="description"
          v-model="form.description" 
          placeholder="Share your memories, experiences, or any notes about this place..."
          rows="4"
          class="form-textarea"
        ></textarea>
      </div>

      <!-- Photo Upload -->
      <div class="form-group full-width">
        <label class="form-label">
          <span class="label-icon">📸</span>
          Photo
        </label>
        <div class="photo-upload-container">
          <input 
            type="file" 
            @change="onFileChange" 
            accept="image/*" 
            class="photo-input"
            id="photo-upload"
          />
          <label for="photo-upload" class="photo-upload-label">
            <div class="upload-icon">📷</div>
            <span>Choose a photo</span>
          </label>
        </div>
      </div>

      <!-- Photo Preview -->
      <div v-if="photoPreview || (isEdit && form.photoUrl)" class="photo-preview-container">
        <img 
          :src="photoPreview || form.photoUrl" 
          alt="Preview" 
          class="photo-preview"
        />
        <button 
          v-if="photoPreview" 
          type="button" 
          @click="removePhoto" 
          class="remove-photo-btn"
          aria-label="Remove photo"
        >
          ✕
        </button>
      </div>

              <!-- Map Pick Button -->
        <div class="form-group full-width">
          <button 
            type="button" 
            @click="$emit('requestMapClick')" 
            class="map-pick-btn"
          >
            <span class="btn-icon">🗺️</span>
            Pick Location on Map
          </button>
          
          <!-- Location Info Badge -->
          <div v-if="locationAutoFilled" class="location-info">
            <span class="location-info-icon">✅</span>
            <span>Location details auto-filled from coordinates</span>
          </div>
        </div>

      <!-- Submit Button -->
      <div class="form-actions">
        <button type="submit" class="submit-btn">
          <span class="btn-icon">{{ isEdit ? '✏️' : '➕' }}</span>
          {{ isEdit ? 'Update Place' : 'Add Place' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import axios from 'axios';

const props = defineProps({
  place: Object,
  isEdit: Boolean,
});
const emit = defineEmits(['submit', 'requestMapClick']);

const form = ref({
  title: '',
  description: '',
  country: '',
  city: '',
  lat: '',
  lng: '',
  visitedAt: '',
  photo: null,
  photoUrl: '',
});

const photoPreview = ref('');
const isLoadingLocation = ref(false);
const locationAutoFilled = ref(false);

watch(() => props.place, (val) => {
  if (val) Object.assign(form.value, val, {
    lat: val.coordinates?.lat || '',
    lng: val.coordinates?.lng || '',
    photo: null,
    photoUrl: val.photoUrl || '',
  });
  photoPreview.value = '';
  locationAutoFilled.value = false;
}, { immediate: true });

// Watch for coordinate changes to auto-fill location
watch([() => form.value.lat, () => form.value.lng], async ([newLat, newLng], [oldLat, oldLng]) => {
  // Only auto-fill if coordinates changed and are valid
  if (newLat && newLng && (newLat !== oldLat || newLng !== oldLng)) {
    await reverseGeocode(newLat, newLng);
  }
}, { immediate: true });

async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return;
  
  isLoadingLocation.value = true;
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'tr,en'
        }
      }
    );
    
    const data = response.data;
    const address = data.address || {};
    
    // Auto-fill city and country if they're empty or if this is a new place
    if (!form.value.city || !props.isEdit) {
      form.value.city = address.city || address.town || address.village || address.county || '';
    }
    
    if (!form.value.country || !props.isEdit) {
      form.value.country = address.country || '';
    }
    
    // Auto-fill title if it's empty and we have a city name
    if (!form.value.title || !props.isEdit) {
      const cityName = address.city || address.town || address.village || address.county || '';
      if (cityName) {
        form.value.title = cityName;
      }
    }
    
    locationAutoFilled.value = true;
    
    // Show a brief notification
    showNotification('Location details auto-filled!', 'success');
    
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    showNotification('Could not auto-fill location details', 'warning');
  } finally {
    isLoadingLocation.value = false;
  }
}

function showNotification(message, type = 'info') {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function onFileChange(e) {
  form.value.photo = e.target.files[0];
  if (form.value.photo) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      photoPreview.value = ev.target.result;
    };
    reader.readAsDataURL(form.value.photo);
  } else {
    photoPreview.value = '';
  }
}

function removePhoto() {
  form.value.photo = null;
  photoPreview.value = '';
  // Reset file input
  const fileInput = document.getElementById('photo-upload');
  if (fileInput) fileInput.value = '';
}

async function handleSubmit() {
  // FormData oluştur
  const formData = new FormData();
  
  // Temel verileri ekle
  formData.append('title', form.value.title);
  formData.append('description', form.value.description);
  formData.append('country', form.value.country);
  formData.append('city', form.value.city);
  formData.append('lat', form.value.lat);
  formData.append('lng', form.value.lng);
  formData.append('visitedAt', form.value.visitedAt);
  
  // Eğer yeni fotoğraf varsa ekle
  if (form.value.photo) {
    formData.append('photo', form.value.photo);
  } else if (form.value.photoUrl) {
    // Mevcut fotoğraf URL'ini ekle
    formData.append('photoUrl', form.value.photoUrl);
  }

  // Parent component'e FormData'yı gönder
  emit('submit', formData);
}


// Allow parent to set coordinates
function setCoordinates(lat, lng) {
  form.value.lat = lat;
  form.value.lng = lng;
  // Trigger reverse geocoding when coordinates are set
  if (lat && lng) {
    reverseGeocode(lat, lng);
  }
}

defineExpose({ setCoordinates });
</script>

<style scoped>
.place-form-container {
  background: #fff;
  border-radius: 16px;
  padding: 1rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.form-header {
  text-align: center;
  margin-bottom: 1rem;
}

.form-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  color: #718096;
  font-size: 0.8rem;
  margin: 0;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  position: relative;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.85rem;
}

.label-icon {
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  padding: 0.6rem 0.7rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: #f7fafc;
  color: #2d3748;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #a0aec0;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.photo-upload-container {
  position: relative;
}

.photo-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.photo-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 0.3rem;
}

.photo-upload-label:hover {
  border-color: #667eea;
  background: #edf2f7;
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 1.2rem;
  color: #a0aec0;
}

.photo-preview-container {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.photo-preview {
  max-width: 100%;
  max-height: 120px;
  object-fit: cover;
  display: block;
}

.remove-photo-btn {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  color: #e53e3e;
  transition: all 0.3s ease;
}

.remove-photo-btn:hover {
  background: #e53e3e;
  color: white;
  transform: scale(1.1);
}

.map-pick-btn {
  width: 100%;
  padding: 0.6rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.map-pick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 0.6rem;
}

.submit-btn {
  padding: 0.7rem 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 160px;
  justify-content: center;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .place-form-container {
    padding: 0.8rem;
    margin: 0.5rem;
    max-height: 85vh;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
  
  .form-title {
    font-size: 1.2rem;
  }
  
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .place-form-container {
    padding: 0.6rem;
    max-height: 80vh;
  }
  
  .form-title {
    font-size: 1.1rem;
  }
  
  .form-input,
  .form-textarea {
    padding: 0.5rem;
  }
  
  .modern-form {
    gap: 0.6rem;
  }
}

/* Add notification animations */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Add loading indicator styles */
.location-loading {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

/* Auto-filled field indicator */
.form-input.auto-filled {
  border-color: #10b981;
  background: #f0fdf4;
}

.form-input.auto-filled:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Location info badge */
.location-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: #10b981;
  margin-top: 0.15rem;
}

.location-info-icon {
  font-size: 0.8rem;
}
</style> 