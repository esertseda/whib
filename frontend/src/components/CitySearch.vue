<template>
  <div class="city-search-root" @click.stop>
    <div class="search-bar-group">
      <input v-model="query" @input="search" @keydown.enter="selectFirst" type="text" placeholder="Search for a place..." class="search-input" />
      <button class="search-icon-btn" @click="search" aria-label="Search">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="11" cy="11" r="7" stroke-width="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
    <ul v-if="showResults && results.length" class="search-results">
      <li v-for="city in results" :key="city.name + city.country + city.coordinates.lat" @click="selectCity(city)" class="search-result-item">
        <div class="city-name">{{ city.name }}</div>
        <div class="city-location">{{ city.country }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { searchCities } from '../services/cities';

const query = ref('');
const results = ref([]);
const showResults = ref(false);
const emit = defineEmits(['select']);

async function search() {
  if (query.value.length < 2) {
    results.value = [];
    showResults.value = false;
    return;
  }
  results.value = await searchCities(query.value);
  showResults.value = true;
}

function selectFirst() {
  if (results.value.length > 0) {
    selectCity(results.value[0]);
  }
}

function selectCity(city) {
  emit('select', city);
  showResults.value = false;
  query.value = '';
  results.value = [];
}

function handleClickOutside(e) {
  showResults.value = false;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.city-search-root {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 1rem auto;
}
.search-bar-group {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.08);
  padding: 0.1rem 0.5rem 0.1rem 0.5rem;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  border-radius: 1.2rem;
  background: transparent;
}
.search-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  color: #388e7d;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: background 0.2s;
}
.search-icon-btn:hover, .search-icon-btn:focus {
  background: #e0f7fa;
}
.search-results {
  position: absolute;
  left: 0;
  right: 0;
  top: 110%;
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 4px 16px 0 rgba(60, 60, 60, 0.12);
  z-index: 10;
  margin: 0;
  padding: 0.3rem 0;
  list-style: none;
}
.search-result-item {
  padding: 0.8rem 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1rem;
}
.city-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.2rem;
}

.city-location {
  font-size: 0.85rem;
  color: #666;
}
.search-result-item:hover, .search-result-item:focus {
  background: #e0f7fa;
}
</style> 