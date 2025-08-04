<template>
  <div class="attractions-card">
    <h3 class="attractions-title">Popular Attractions</h3>
    <div v-if="attractions && attractions.length" class="attractions-grid">
      <div v-for="attr in attractions" :key="attr.xid" class="attraction-tile">
        <div class="attraction-header">
          <span class="pin-icon">📍</span>
          <span class="attr-name">{{ attr.name }}</span>
          <a v-if="attr.xid" :href="`https://en.wikipedia.org/?curid=${attr.xid}`" target="_blank" class="wiki-btn" title="View on Wikipedia">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2V7zm0 4h2v6h-2v-6z" fill="#1976d2"/></svg>
          </a>
        </div>
        <div class="attraction-meta">
          <span class="kind-badge">{{ attr.kinds?.split(',')[0] }}</span>
          <span class="attr-dist">{{ Math.round(attr.dist) }} m</span>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="attractions-loading">Loading attractions...</div>
    <div v-else-if="error" class="attractions-error">{{ error }}</div>
    <div v-else class="attractions-empty">No attractions found.</div>
  </div>
</template>

<script setup>
const props = defineProps({
  attractions: Array,
  loading: Boolean,
  error: String
});
</script>

<style scoped>
.attractions-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 12px 0 rgba(60,60,60,0.08);
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.2rem;
  min-width: 220px;
}
.attractions-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 0.7rem;
}
.attractions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.attraction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-radius: 0.7rem;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  color: #374151;
}
.attr-name {
  font-weight: 600;
  color: #388e7d;
}
.attr-kind {
  font-size: 0.95rem;
  color: #4e5d6c;
}
.attr-dist {
  font-size: 0.95rem;
  color: #a7c7e7;
}
.attractions-loading, .attractions-error, .attractions-empty {
  color: #888;
  font-size: 1rem;
  margin: 1.2rem 0;
}
.attr-main {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.attr-link {
  margin-left: 0.2rem;
  display: flex;
  align-items: center;
}
.wiki-icon {
  vertical-align: middle;
  margin-left: 2px;
}
.attr-details {
  display: flex;
  gap: 1.2rem;
  font-size: 0.97rem;
  margin-top: 0.1rem;
  color: #4e5d6c;
}
.attractions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.1rem;
}
.attraction-tile {
  background: #f8fafc;
  border-radius: 1.1rem;
  box-shadow: 0 1px 8px 0 rgba(60,60,60,0.07);
  padding: 1.1rem 1.2rem 0.9rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-height: 90px;
  position: relative;
  transition: box-shadow 0.2s;
}
.attraction-tile:hover {
  box-shadow: 0 4px 16px 0 rgba(60,60,60,0.13);
}
.attraction-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.08rem;
  font-weight: 600;
  color: #388e7d;
}
.pin-icon {
  font-size: 1.1rem;
  margin-right: 0.1rem;
}
.wiki-btn {
  margin-left: auto;
  background: none;
  border: none;
  padding: 0.1rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.wiki-btn:hover {
  opacity: 1;
}
.attraction-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.97rem;
}
.kind-badge {
  background: #e0f2fe;
  color: #1976d2;
  border-radius: 0.6rem;
  padding: 0.18rem 0.7rem;
  font-size: 0.93rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.attr-dist {
  color: #a7c7e7;
  font-size: 0.95rem;
  margin-left: 0.2rem;
}
</style> 