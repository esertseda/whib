<template>
  <div>
    <h2>Travel Stats</h2>
    <div>Total Places: {{ stats.total }}</div>
    <div>Countries Visited: {{ stats.countries }}</div>
    <canvas ref="chartRef" width="400" height="400"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  stats: Object,
});
const chartRef = ref(null);
let chartInstance = null;

onMounted(() => {
  renderChart();
});

watch(() => props.stats, renderChart, { deep: true });

function renderChart() {
  if (!props.stats || !chartRef.value) return;
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(chartRef.value, {
    type: 'pie',
    data: {
      labels: Object.keys(props.stats.countryCounts || {}),
      datasets: [{
        data: Object.values(props.stats.countryCounts || {}),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        ],
      }],
    },
  });
}
</script> 