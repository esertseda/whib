<template>
  <div class="auth-root">
    <!-- Background Pattern -->
    <div class="bg-pattern"></div>
    
    <!-- Floating Elements -->
    <div class="floating-element floating-1">🗺️</div>
    <div class="floating-element floating-2">✈️</div>
    <div class="floating-element floating-3">🌍</div>
    <div class="floating-element floating-4">🏔️</div>
    
    <div class="auth-container">
      <!-- Left Side - Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="logo-container">
            <img src="/Where Have I Been.png" alt="Logo" class="auth-logo" />
            <h1 class="welcome-title">Where Have I Been?</h1>
          </div>
          <h2 class="welcome-subtitle">Welcome Back, Adventurer!</h2>
          <p class="welcome-desc">
            Continue your travel journey and explore the world with your personal travel map. 
            Mark new destinations, relive memories, and plan your next adventure.
          </p>
          <div class="welcome-features">
            <div class="feature-item">
              <span class="feature-icon">🗺️</span>
              <span>Track your travels</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📸</span>
              <span>Save memories</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎯</span>
              <span>Plan adventures</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="auth-card">
        <div class="auth-header">
          <h2 class="auth-title">Sign In</h2>
          <p class="auth-subtitle">Access your travel dashboard</p>
        </div>
        
        <form @submit.prevent="login" class="auth-form">
          <div class="input-group">
            <label for="email" class="auth-label">
              <span class="label-icon">📧</span>
              Email Address
            </label>
            <input 
              v-model="email" 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              class="auth-input" 
              required 
            />
          </div>
          
          <div class="input-group">
            <label for="password" class="auth-label">
              <span class="label-icon">🔒</span>
              Password
            </label>
            <input 
              v-model="password" 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              class="auth-input" 
              required 
            />
          </div>
          
          <button type="submit" class="auth-btn" :disabled="isLoading">
            <span v-if="!isLoading">Sign In</span>
            <span v-else class="loading-spinner">⏳</span>
          </button>
          
          <div v-if="error" class="auth-error">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>
        </form>
        
        <div class="auth-footer">
          <span class="footer-text">Don't have an account?</span>
          <router-link to="/register" class="auth-link">
            Create Account
            <span class="link-arrow">→</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const router = useRouter();

async function login() {
  if (isLoading.value) return;
  
  isLoading.value = true;
  error.value = '';
  
  try {
    const res = await axios.post('/api/auth/login', { 
      email: email.value, 
      password: password.value 
    });
    localStorage.setItem('token', res.data.token);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.auth-root {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f7fa 50%, #f0f9ff 100%);
  font-family: 'Poppins', 'Roboto', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

/* Background Pattern */
.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
  z-index: 1;
}

/* Floating Elements */
.floating-element {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
  z-index: 1;
}

.floating-1 { top: 10%; left: 10%; animation-delay: 0s; }
.floating-2 { top: 20%; right: 15%; animation-delay: 1s; }
.floating-3 { bottom: 30%; left: 20%; animation-delay: 2s; }
.floating-4 { bottom: 20%; right: 10%; animation-delay: 3s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* Main Container */
.auth-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
  gap: 2rem;
}

/* Welcome Section */
.welcome-section {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: left;
  color: #2c3e50;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.auth-logo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(56, 142, 125, 0.2);
  background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
  padding: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #388e7d 0%, #26a69a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.02em;
}

.welcome-subtitle {
  font-size: 1.8rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 1rem;
}

.welcome-desc {
  font-size: 1.1rem;
  color: #5a6c7d;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1rem;
  color: #4e5d6c;
}

.feature-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 4px rgba(56, 142, 125, 0.2));
}

/* Auth Card */
.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  box-shadow: 0 8px 32px rgba(60, 60, 60, 0.1);
  padding: 3rem 2.5rem;
  min-width: 320px;
  max-width: 450px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(56, 142, 125, 0.3) 50%, transparent 100%);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #388e7d 0%, #26a69a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: #5a6c7d;
  font-size: 1rem;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #4e5d6c;
  font-weight: 500;
}

.label-icon {
  font-size: 1rem;
}

.auth-input {
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  border: 1px solid rgba(56, 142, 125, 0.2);
  background: rgba(248, 250, 252, 0.8);
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  backdrop-filter: blur(10px);
}

.auth-input:focus {
  border: 2px solid #6ee7b7;
  box-shadow: 0 4px 16px rgba(110, 231, 183, 0.2);
  background: rgba(255, 255, 255, 0.95);
}

.auth-btn {
  background: linear-gradient(135deg, #6ee7b7 0%, #a7c7e7 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px rgba(110, 231, 183, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 0.5rem;
}

.auth-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.auth-btn:hover::before {
  left: 100%;
}

.auth-btn:hover {
  background: linear-gradient(135deg, #a7c7e7 0%, #6ee7b7 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(110, 231, 183, 0.4);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e57373;
  background: rgba(255, 235, 238, 0.9);
  border: 1px solid rgba(229, 115, 115, 0.3);
  border-radius: 1rem;
  padding: 1rem;
  font-size: 0.95rem;
  backdrop-filter: blur(10px);
}

.error-icon {
  font-size: 1.1rem;
}

/* Footer */
.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  font-size: 1rem;
  color: #5a6c7d;
}

.footer-text {
  color: #4e5d6c;
}

.auth-link {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #388e7d;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: #6ee7b7;
  transform: translateX(3px);
}

.link-arrow {
  transition: transform 0.3s ease;
}

.auth-link:hover .link-arrow {
  transform: translateX(3px);
}



/* Responsive */
@media (max-width: 1200px) {
  .auth-container {
    padding: 1.5rem;
  }
  
  .welcome-section {
    padding: 2.5rem 1.5rem;
  }
  
  .auth-card {
    padding: 2.5rem 2rem;
  }
}

@media (max-width: 1024px) {
  .auth-container {
    flex-direction: column;
    padding: 1rem;
    min-height: auto;
    gap: 1rem;
  }
  
  .welcome-section {
    padding: 2rem 1rem;
    text-align: center;
    max-width: none;
    min-width: auto;
  }
  
  .welcome-content {
    text-align: center;
  }
  
  .logo-container {
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  
  .welcome-features {
    align-items: center;
    margin-top: 1.5rem;
  }
  
  .auth-card {
    max-width: 500px;
    min-width: auto;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .auth-container {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .welcome-section {
    padding: 1.5rem 0.5rem;
    min-width: auto;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .welcome-subtitle {
    font-size: 1.5rem;
  }
  
  .welcome-desc {
    font-size: 1rem;
  }
  
  .auth-card {
    padding: 2rem 1.5rem;
    border-radius: 1.5rem;
    min-width: auto;
  }
  
  .auth-title {
    font-size: 1.8rem;
  }
  
  .auth-subtitle {
    font-size: 0.95rem;
  }
  
  .floating-element {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .auth-container {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .welcome-section {
    padding: 1rem 0.5rem;
    min-width: auto;
  }
  
  .welcome-title {
    font-size: 1.6rem;
  }
  
  .welcome-subtitle {
    font-size: 1.3rem;
  }
  
  .welcome-desc {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  .auth-card {
    padding: 1.5rem 1rem;
    border-radius: 1.2rem;
    margin: 0 0.5rem;
    min-width: auto;
  }
  
  .auth-title {
    font-size: 1.6rem;
  }
  
  .auth-subtitle {
    font-size: 0.9rem;
  }
  
  .auth-input {
    padding: 0.9rem 1rem;
    font-size: 0.95rem;
  }
  
  .auth-btn {
    padding: 0.9rem 1.5rem;
    font-size: 1rem;
  }
  
  .auth-label {
    font-size: 0.9rem;
  }
  
  .floating-element {
    display: none;
  }
  
  .bg-pattern {
    opacity: 0.5;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 0.25rem;
    gap: 0.25rem;
  }
  
  .welcome-section {
    padding: 0.8rem 0.25rem;
    min-width: auto;
  }
  
  .welcome-title {
    font-size: 1.4rem;
  }
  
  .welcome-subtitle {
    font-size: 1.2rem;
  }
  
  .welcome-desc {
    font-size: 0.9rem;
  }
  
  .auth-logo {
    width: 50px;
    height: 50px;
  }
  
  .auth-card {
    padding: 1.2rem 0.8rem;
    border-radius: 1rem;
    margin: 0 0.25rem;
    min-width: auto;
  }
  
  .auth-title {
    font-size: 1.4rem;
  }
  
  .auth-subtitle {
    font-size: 0.85rem;
  }
  
  .auth-input {
    padding: 0.8rem 0.9rem;
    font-size: 0.9rem;
  }
  
  .auth-btn {
    padding: 0.8rem 1.2rem;
    font-size: 0.95rem;
  }
  
  .auth-label {
    font-size: 0.85rem;
  }
  
  .auth-footer {
    font-size: 0.9rem;
  }
  
  .feature-item {
    font-size: 0.9rem;
  }
  
  .feature-icon {
    font-size: 1rem;
  }
}

@media (max-width: 360px) {
  .auth-container {
    padding: 0.1rem;
    gap: 0.1rem;
  }
  
  .welcome-section {
    padding: 0.5rem 0.1rem;
    min-width: auto;
  }
  
  .welcome-title {
    font-size: 1.2rem;
  }
  
  .welcome-subtitle {
    font-size: 1.1rem;
  }
  
  .welcome-desc {
    font-size: 0.85rem;
  }
  
  .auth-logo {
    width: 45px;
    height: 45px;
  }
  
  .auth-card {
    padding: 1rem 0.6rem;
    border-radius: 0.8rem;
    margin: 0 0.1rem;
    min-width: auto;
  }
  
  .auth-title {
    font-size: 1.2rem;
  }
  
  .auth-subtitle {
    font-size: 0.8rem;
  }
  
  .auth-input {
    padding: 0.7rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .auth-btn {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
  
  .auth-label {
    font-size: 0.8rem;
  }
  
  .auth-footer {
    font-size: 0.85rem;
  }
  
  .feature-item {
    font-size: 0.85rem;
  }
  
  .feature-icon {
    font-size: 0.9rem;
  }
}

/* Landscape orientation for mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .auth-container {
    min-height: auto;
    padding: 1rem;
    gap: 0.5rem;
  }
  
  .welcome-section {
    padding: 1rem;
    min-width: auto;
  }
  
  .auth-card {
    padding: 1.5rem 2rem;
    min-width: auto;
  }
  
  .welcome-title {
    font-size: 1.4rem;
  }
  
  .welcome-subtitle {
    font-size: 1.2rem;
  }
  
  .welcome-desc {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .welcome-features {
    gap: 0.5rem;
  }
  
  .feature-item {
    font-size: 0.9rem;
  }
}
</style> 