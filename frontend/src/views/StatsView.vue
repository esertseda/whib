<template>
  <div class="max-w-3xl mx-auto py-10 px-4">
    <h2 class="text-2xl font-bold text-primary mb-6">My Travel Stats</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div class="bg-card rounded-chic shadow-chic p-6 flex flex-col items-center">
        <div class="text-4xl font-bold text-primary mb-2">{{ stats.countriesVisited }}</div>
        <div class="text-gray-600">Countries Visited</div>
      </div>
      <div class="bg-card rounded-chic shadow-chic p-6 flex flex-col items-center">
        <div class="text-4xl font-bold text-primary mb-2">{{ stats.totalDistance }} km</div>
        <div class="text-gray-600">Total Distance Traveled</div>
      </div>
    </div>
    <div class="bg-card rounded-chic shadow-chic p-6">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { getStats } from '../services/stats';

const stats = ref({ countriesVisited: 0, totalDistance: 0, countries: [] });
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Cities Visited',
      backgroundColor: '#6366F1',
      data: []
    }
  ]
});
const chartOptions = ref({
  responsive: true,
  plugins: { legend: { display: false } }
});

onMounted(async () => {
  stats.value = await getStats();
  chartData.value.labels = (stats.value.countries || []).map(c => c.name);
  chartData.value.datasets[0].data = (stats.value.countries || []).map(c => c.citiesVisited);
});
</script>

<style scoped>
/* Responsive Design for StatsView */
@media (max-width: 768px) {
  .max-w-3xl {
    padding: 1rem;
    max-width: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .grid {
    gap: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .bg-card {
    padding: 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .text-4xl {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .max-w-3xl {
    padding: 0.5rem;
    max-width: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  
  h2 {
    font-size: 1.3rem;
  }
  
  .bg-card {
    padding: 0.8rem;
    max-width: 100%;
    width: 100%;
  }
  
  .text-4xl {
    font-size: 1.5rem;
  }
}
</style> 