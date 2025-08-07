<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2 class="modal-title">{{ place.title }}</h2>
        <button class="close-btn" @click="closeModal" aria-label="Close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="place-image" v-if="place.photoUrl">
          <img :src="getPhotoUrl(place.photoUrl)" :alt="place.title" />
        </div>
        
        <div class="place-info">
          <div class="info-row">
            <span class="info-label">📍</span>
            <span class="info-value">{{ place.city }}, {{ place.country }}</span>
          </div>
          
          <div class="info-row" v-if="place.visitedAt">
            <span class="info-label">📅</span>
            <span class="info-value">{{ formatDate(place.visitedAt) }}</span>
          </div>
          
          <div class="info-row" v-if="place.description">
            <span class="info-label">📝</span>
            <span class="info-value description">{{ place.description }}</span>
          </div>
          
          <div class="info-row" v-if="place.lat && place.lng">
            <span class="info-label">🗺️</span>
            <span class="info-value coordinates">
              {{ parseFloat(place.lat).toFixed(6) }}, {{ parseFloat(place.lng).toFixed(6) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="edit-btn" @click="editPlace">
          <span class="btn-icon">✏️</span>
          Edit Place
        </button>
        <button class="delete-btn" @click="deletePlace">
          <span class="btn-icon">🗑️</span>
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: Boolean,
  place: Object
});

const emit = defineEmits(['close', 'edit', 'delete']);

function closeModal() {
  emit('close');
}

function editPlace() {
  emit('edit', props.place);
  closeModal();
}

function deletePlace() {
  if (confirm('Are you sure you want to delete this place?')) {
    emit('delete', props.place._id);
    closeModal();
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getPhotoUrl(photoUrl) {
  if (!photoUrl) return '';
  // Eğer URL zaten tam URL ise (Cloudinary), olduğu gibi döndür
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  // Eğer eski format uploads path ise, backend URL'ini ekle
  if (photoUrl.startsWith('/uploads/')) {
    const isProduction = import.meta.env.PROD;
    const baseUrl = import.meta.env.VITE_API_URL || (isProduction ? 'https://whib.onrender.com' : 'http://localhost:5000');
    return `${baseUrl}${photoUrl}`;
  }
  return photoUrl;
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f7fafc;
  color: #4a5568;
  transform: scale(1.1);
}

.modal-body {
  padding: 1.5rem;
}

.place-image {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.place-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.place-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.8rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.info-label {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.info-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
  line-height: 1.5;
}

.info-value.description {
  white-space: pre-line;
  font-style: italic;
  color: #4a5568;
}

.info-value.coordinates {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #718096;
  background: #edf2f7;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.edit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 101, 101, 0.3);
}

.btn-icon {
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    max-height: 85vh;
  }
  
  .modal-header {
    padding: 1.2rem 1.2rem 0.8rem 1.2rem;
  }
  
  .modal-title {
    font-size: 1.3rem;
  }
  
  .modal-body {
    padding: 1.2rem;
  }
  
  .place-image img {
    height: 150px;
  }
  
  .modal-footer {
    padding: 0.8rem 1.2rem 1.2rem 1.2rem;
    flex-direction: column;
  }
  
  .edit-btn, .delete-btn {
    padding: 0.7rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 98vw;
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 1rem 1rem 0.6rem 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .info-row {
    padding: 0.6rem;
    gap: 0.6rem;
  }
  
  .info-label {
    font-size: 1.1rem;
  }
  
  .info-value {
    font-size: 0.9rem;
  }
}
</style> 