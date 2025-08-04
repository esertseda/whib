<template>
  <div class="gallery-card">
    <h3 class="gallery-title">Photo Gallery</h3>
    <div v-if="photos && photos.length" class="gallery-grid">
      <img v-for="photo in photos" :key="photo.url" :src="photo.url" :alt="photo.alt" class="gallery-img" />
    </div>
    <div v-else-if="loading" class="gallery-loading">Loading photos...</div>
    <div v-else-if="error" class="gallery-error">{{ error }}</div>
    <div v-else class="gallery-empty">No photos found.</div>
  </div>
</template>

<script setup>
const props = defineProps({
  photos: Array,
  loading: Boolean,
  error: String
});
</script>

<style scoped>
.gallery-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 12px 0 rgba(60,60,60,0.08);
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.2rem;
  min-width: 220px;
}
.gallery-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 0.7rem;
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.7rem;
}
.gallery-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 0.7rem;
  box-shadow: 0 1px 4px 0 rgba(60,60,60,0.10);
}
.gallery-loading, .gallery-error, .gallery-empty {
  color: #888;
  font-size: 1rem;
  margin: 1.2rem 0;
}
</style> 