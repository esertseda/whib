<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="/Where Have I Been.png" alt="Logo" class="navbar-logo" />
      <span class="navbar-title">Where Have I Been?</span>
    </div>
    <button class="navbar-toggle" @click="toggleMenu" aria-label="Toggle navigation">
      <span :class="{'open': menuOpen}"></span>
      <span :class="{'open': menuOpen}"></span>
      <span :class="{'open': menuOpen}"></span>
    </button>
    <ul :class="['navbar-links', { open: menuOpen }]">
      <li><router-link to="/" class="nav-link" active-class="active">Home</router-link></li>
      <li><router-link to="/wishlist" class="nav-link" active-class="active">Wishlist</router-link></li>
      <li><router-link to="/travel-list" class="nav-link" active-class="active">Travel List</router-link></li>
      <li><button @click="logout" class="nav-link logout-btn">Logout</button></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const menuOpen = ref(false);
function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
function logout() {
  localStorage.removeItem('token');
  router.push('/');
}
</script>

<style scoped>
.navbar {
  width: 100%;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(60, 60, 60, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: relative;
  z-index: 100;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.navbar-logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #e0f2f1;
  padding: 0.3rem;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.08);
}
.navbar-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #388e7d;
  letter-spacing: 0.04em;
}
.navbar-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 200;
}
.navbar-toggle span {
  display: block;
  width: 26px;
  height: 3px;
  margin: 4px 0;
  background: #388e7d;
  border-radius: 2px;
  transition: 0.3s;
}
.navbar-toggle span.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.navbar-toggle span.open:nth-child(2) {
  opacity: 0;
}
.navbar-toggle span.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}
.navbar-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  transition: right 0.3s;
}
.nav-link {
  color: #374151;
  font-size: 1.05rem;
  font-weight: 500;
  padding: 0.5rem 1.1rem;
  border-radius: 1rem;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
}
.nav-link.active, .nav-link.router-link-exact-active {
  background: #e0f7fa;
  color: #388e7d;
}
.logout-btn {
  color: #e57373;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1.1rem;
  border-radius: 1rem;
  transition: background 0.2s, color 0.2s;
}
.logout-btn:hover {
  background: #ffebee;
  color: #b71c1c;
}
@media (max-width: 900px) {
  .navbar {
    padding: 0 1rem;
    height: 56px;
  }
  .navbar-links {
    position: absolute;
    top: 56px;
    right: -100vw;
    width: 100vw;
    background: #fff;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 1.2rem 1.5rem;
    box-shadow: 0 4px 32px 0 rgba(60, 60, 60, 0.10);
    transition: right 0.3s;
    z-index: 150;
  }
  .navbar-links.open {
    right: 0;
  }
  .navbar-toggle {
    display: flex;
  }
}
</style> 