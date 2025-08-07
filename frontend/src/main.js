import './assets/main.css'
import './assets/base.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'leaflet/dist/leaflet.css';
import 'chart.js/auto';
import axios from 'axios';
import { createPinia } from 'pinia';

// Set base URL for API calls
const isProduction = import.meta.env.PROD;
const apiUrl = import.meta.env.VITE_API_URL || (isProduction ? 'https://whib.onrender.com' : 'http://localhost:5000');
console.log('API URL:', apiUrl); // Debug için
axios.defaults.baseURL = apiUrl;

// Force production URL for now
if (window.location.hostname !== 'localhost') {
  axios.defaults.baseURL = 'https://whib.onrender.com';
  console.log('Forced production API URL:', axios.defaults.baseURL);
}

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const app = createApp(App);
app.use(createPinia());
app.use(router).mount('#app');
