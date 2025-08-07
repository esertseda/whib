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
axios.defaults.baseURL = apiUrl;

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
