<template>
  <div class="tips-card">
    <h3 class="tips-title">Cultural Tips</h3>
    <ul v-if="tips && tips.length" class="tips-list">
      <li v-for="tip in tips" :key="tip" class="tip-item">{{ tip }}</li>
    </ul>
    <div v-else-if="loading" class="tips-loading">Loading tips...</div>
    <div v-else-if="error" class="tips-error">{{ error }}</div>
    <div v-else class="tips-empty">No tips found.</div>
  </div>
</template>

<script setup>
const props = defineProps({
  tips: Array,
  loading: Boolean,
  error: String
});
</script>

<style scoped>
.tips-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 12px 0 rgba(60,60,60,0.08);
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.2rem;
  min-width: 220px;
}
.tips-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 0.7rem;
}
.tips-list {
  list-style: disc inside;
  padding: 0 0 0 1rem;
  margin: 0;
  color: #374151;
  font-size: 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.tip-item {
  background: #f8fafc;
  border-radius: 0.7rem;
  padding: 0.5rem 1rem;
}
.tips-loading, .tips-error, .tips-empty {
  color: #888;
  font-size: 1rem;
  margin: 1.2rem 0;
}
</style> 