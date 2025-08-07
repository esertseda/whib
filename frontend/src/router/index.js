import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import StatsView from '../views/StatsView.vue';
import HomeView from '../views/HomeView.vue';
import MapView from '../views/MapView.vue';
import CityDetails from '../views/CityDetails.vue';
import WishlistView from '../views/WishlistView.vue';
import TravelList from '../views/TravelList.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/map', component: MapView },
  { path: '/city/:id', component: CityDetails, props: true },
  { path: '/wishlist', component: WishlistView },
  { path: '/travel-list', component: TravelList },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/dashboard', component: DashboardView },
  { path: '/stats', component: StatsView },
];

const publicPages = ['/', '/login', '/register'];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');
  // If logged in and trying to access login/register, redirect to dashboard
  if ((to.path === '/login' || to.path === '/register') && token) {
    return next('/dashboard');
  }
  // Allow logged in users to access home page
  if (authRequired && !token) {
    return next('/login');
  }
  next();
});

export default router; 