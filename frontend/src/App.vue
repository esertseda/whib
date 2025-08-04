

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const route = useRoute();
const hideNavbar = computed(() => ['/', '/login', '/register'].includes(route.path));
const isHome = computed(() => ['/', '/login', '/register'].includes(route.path));
</script>

<template>
  <div class="app-root">
    <Navbar v-if="!hideNavbar" />
    <main :class="['main-content', { 'main-content-home': isHome }]">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  background: var(--color-background, #f8fafc);
  font-family: 'Poppins', 'Roboto', Arial, sans-serif;
}
.main-content {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow-x: hidden;
  overflow-y: auto;
  align-items: stretch;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
}
.main-content-home {
  width: 100vw;
  max-width: none;
  margin: 0;
  padding: 0;
  align-items: stretch;
  min-height: 100vh;
  overflow-y: auto;
}
@media (max-width: 1200px) {
  .main-content {
    max-width: 100vw;
    padding: 0;
  }
}
@media (max-width: 600px) {
  .main-content {
    padding: 1rem 0.5rem;
  }
  .main-content-home {
    padding: 0.5rem 0;
  }
}
</style>
