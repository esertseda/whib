<template>
  <div class="home-root">
    <header class="home-header">
      <div class="header-content container">
        <img src="/src/assets/Where Have I Been.png" alt="My Travel Map Logo" class="logo" />
        <h1 class="app-title">Where Have I Been?</h1>
      </div>
    </header>

    <main class="home-main">
      <!-- Hero Section -->
      <section class="hero-section scroll-animate">
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h2 class="welcome-title">Welcome, Adventurer!</h2>
              <p class="welcome-desc">
                My Travel Map is your personal travel journal and map. Mark the places you've visited, add memories, and visualize your journeys on an interactive map.
              </p>
              <div class="cta-group">
                <div v-if="!isLoggedIn">
                  <router-link to="/login" class="cta-btn login-btn">Login</router-link>
                  <router-link to="/register" class="cta-btn register-btn">Register</router-link>
                </div>
                <div v-else>
                  <router-link to="/dashboard" class="cta-btn dashboard-btn">Go to Dashboard</router-link>
                </div>
              </div>
            </div>
            <div class="hero-image">
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" alt="Travel Hero" class="hero-img" />
            </div>
          </div>
        </div>
      </section>

      <!-- Features Overview -->
      <section class="features-overview scroll-animate">
        <div class="container">
          <h3 class="section-title">🚀 What You Can Do</h3>
          <div class="features-grid">
            <div class="feature-item scroll-animate" style="animation-delay: 0.1s;">
              <div class="feature-icon">🗺️</div>
              <h4>Interactive Map</h4>
              <p>Mark cities & countries you've visited</p>
            </div>
            <div class="feature-item scroll-animate" style="animation-delay: 0.2s;">
              <div class="feature-icon">✨</div>
              <h4>Travel Guide</h4>
              <p>Get recommendations & city highlights</p>
            </div>
            <div class="feature-item scroll-animate" style="animation-delay: 0.3s;">
              <div class="feature-icon">📊</div>
              <h4>Travel Stats</h4>
              <p>Track your progress & wishlist</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Features -->
      <section class="key-features scroll-animate">
        <div class="container">
          <h3 class="section-title">🌟 Key Features</h3>
          <div class="features-grid">
            <div class="feature-card scroll-animate" style="animation-delay: 0.1s;">
              <div class="feature-icon-large">🗺️</div>
              <h4>Interactive World Map</h4>
              <p>Mark visited places and see your travel journey at a glance</p>
            </div>
            <div class="feature-card scroll-animate" style="animation-delay: 0.2s;">
              <div class="feature-icon-large">🔍</div>
              <h4>City Search</h4>
              <p>Discover attractions, restaurants, and popular spots</p>
            </div>
            <div class="feature-card scroll-animate" style="animation-delay: 0.3s;">
              <div class="feature-icon-large">📋</div>
              <h4>Travel Planning</h4>
              <p>Create detailed travel lists and optimize routes</p>
            </div>
            <div class="feature-card scroll-animate" style="animation-delay: 0.4s;">
              <div class="feature-icon-large">❤️</div>
              <h4>Wishlist</h4>
              <p>Save places you want to visit with personal notes</p>
            </div>
            <div class="feature-card scroll-animate" style="animation-delay: 0.5s;">
              <div class="feature-icon-large">🛣️</div>
              <h4>Route Optimization</h4>
              <p>Find optimal visit order with smart routing</p>
            </div>
            <div class="feature-card scroll-animate" style="animation-delay: 0.6s;">
              <div class="feature-icon-large">📊</div>
              <h4>Statistics</h4>
              <p>Track countries visited and travel milestones</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="final-cta scroll-animate">
        <div class="container">
          <h3>Ready to Start Your Travel Journey?</h3>
          <p>Join thousands of travelers documenting their adventures!</p>
          <div class="cta-group">
            <div v-if="!isLoggedIn">
              <router-link to="/register" class="cta-btn register-btn">Get Started Free</router-link>
              <router-link to="/login" class="cta-btn login-btn">Sign In</router-link>
            </div>
            <div v-else>
              <router-link to="/dashboard" class="cta-btn dashboard-btn">Continue Your Journey</router-link>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})

onMounted(() => {
      // Start initial animations
  const elements = document.querySelectorAll('.fade-in')
  elements.forEach(el => {
    el.style.animationPlayState = 'running'
  })

      // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
        observer.unobserve(entry.target) // Stop observing after animation is done once
      }
    })
  }, observerOptions)

      // Observe elements for scroll animation
  const scrollElements = document.querySelectorAll('.scroll-animate')
  scrollElements.forEach(el => {
    observer.observe(el)
  })
  
  // Debug mesajlarını kaldır
  // console.log('Scroll animation system initialized')
  // console.log('Found scroll elements:', scrollElements.length)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
  min-width: 0;
}

.home-root {
  min-height: 100vh;
  width: 100vw;
  max-width: none;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f7fa 50%, #f0f9ff 100%);
  font-family: 'Poppins', 'Roboto', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  position: relative;
}

.home-root::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
  z-index: 1;
}

/* Container ayarları */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.hero-section,
.features-overview,
.key-features,
.final-cta {
  width: 100vw;
  max-width: none;
  margin: 0;
  padding: 1.5rem 0;
  box-sizing: border-box;
}

.home-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px 0 rgba(60, 60, 60, 0.08);
  padding: 1rem 0;
  border-bottom-left-radius: 2rem;
  border-bottom-right-radius: 2rem;
  width: 100vw;
  max-width: none;
  box-sizing: border-box;
  position: relative;
  z-index: 3;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 0.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(56, 142, 125, 0.15);
  background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
  padding: 0.3rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.logo:hover {
  transform: scale(1.1) rotate(-8deg);
  box-shadow: 0 6px 20px rgba(56, 142, 125, 0.25);
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #388e7d 0%, #26a69a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.05em;
  text-shadow: none;
}

.home-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: none;
  box-sizing: border-box;
  min-width: 0;
  overflow-y: visible;
  padding: 2rem 0;
  margin: 0;
  position: relative;
  z-index: 2;
}

.hero-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.1);
  padding: 2rem 0;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(56, 142, 125, 0.3) 50%, transparent 100%);
}

.hero-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}
.hero-text {
  flex: 1 1 320px;
  min-width: 0;
}
.hero-image {
  flex: 1 1 250px;
  min-width: 0;
  text-align: center;
}
.hero-img {
  width: 100%;
  max-width: 300px;
  border-radius: 0.6rem;
  box-shadow: 0 2px 12px rgba(60, 60, 60, 0.10);
  object-fit: cover;
}
.welcome-title {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #388e7d 0%, #26a69a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: 0.02em;
}
.welcome-desc {
  font-size: 0.9rem;
  color: #5a6c7d;
  margin-bottom: 0.8rem;
  line-height: 1.5;
  font-weight: 400;
}
.cta-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
}
.cta-btn {
  display: inline-block;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.8rem 1.6rem;
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px rgba(60, 60, 60, 0.12);
  text-decoration: none;
  transition: all 0.3s ease;
  outline: none;
  color: #fff;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.cta-btn:hover::before {
  left: 100%;
}
.login-btn {
  background: linear-gradient(135deg, #6ee7b7 0%, #a7c7e7 100%);
}
.login-btn:hover, .login-btn:focus {
  background: linear-gradient(135deg, #a7c7e7 0%, #6ee7b7 100%);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(110, 231, 183, 0.3);
}
.register-btn {
  background: linear-gradient(135deg, #fcb69f 0%, #ffecd2 100%);
  color: #388e7d;
}
.register-btn:hover, .register-btn:focus {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #fff;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(252, 182, 159, 0.3);
}

.dashboard-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  text-decoration: none;
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  border: none;
  cursor: pointer;
}

.dashboard-btn:hover, .dashboard-btn:focus {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: #fff;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}
.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #388e7d 0%, #26a69a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 0.8rem;
  letter-spacing: 0.02em;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
  width: 100%;
  box-sizing: border-box;
}
.feature-item,
.feature-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(60, 60, 60, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.feature-item::before,
.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #6ee7b7 0%, #a7c7e7 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-item:hover::before,
.feature-card:hover::before {
  transform: scaleX(1);
}
.feature-item:hover,
.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(60, 60, 60, 0.15);
  background: rgba(255, 255, 255, 0.95);
}
.feature-icon,
.feature-icon-large {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(56, 142, 125, 0.2));
  transition: transform 0.3s ease;
}

.feature-item:hover .feature-icon,
.feature-card:hover .feature-icon,
.feature-item:hover .feature-icon-large,
.feature-card:hover .feature-icon-large {
  transform: scale(1.1);
}
.feature-card h4,
.feature-item h4 {
  font-size: 0.95rem;
  font-weight: 600;
  background: linear-gradient(135deg, #388e7d 0%, #26a69a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.3rem;
  letter-spacing: 0.01em;
}
.feature-card p,
.feature-item p {
  color: #5a6c7d;
  font-size: 0.8rem;
  line-height: 1.4;
  font-weight: 400;
}
.final-cta {
  background: linear-gradient(135deg, #388e7d 0%, #6ee7b7 50%, #a7c7e7 100%);
  border-radius: 1.5rem;
  padding: 2rem 0;
  text-align: center;
  color: #fff;
  box-shadow: 0 8px 32px rgba(56, 142, 125, 0.25);
  margin-bottom: 2rem;
  width: 100vw;
  max-width: none;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.final-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
  pointer-events: none;
}
.final-cta h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}
.final-cta p {
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

/* Responsive */
@media (max-width: 1200px) {
  .hero-content,
  .features-grid {
    width: 100%;
  }
}
@media (max-width: 900px) {
  .hero-content {
    flex-direction: column;
    gap: 0.8rem;
  }
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.8rem;
    width: 100%;
  }
}
@media (max-width: 600px) {
  .app-title {
    font-size: 1.1rem;
  }
  .hero-section,
  .features-overview,
  .key-features,
  .final-cta {
    padding: 1.5rem 0;
    border-radius: 0.8rem;
  }
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
  }
  .feature-item,
  .feature-card {
    padding: 1.2rem;
  }
  .final-cta {
    padding: 1.5rem 0;
  }
  .cta-group {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .container {
    padding: 0 1rem;
  }
  .header-content {
    padding: 0 1rem;
  }
  .home-main {
    padding: 1.5rem 0;
  }
}
@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideInFromBottom {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromLeft {
  0% {
    opacity: 0;
    transform: translateX(-50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  0% {
    opacity: 0;
    transform: translateX(50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.fade-in {
  opacity: 0;
  animation: fadeSlideUp 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.fade-in.delay-1 { animation-delay: 0.2s; }
.fade-in.delay-2 { animation-delay: 0.4s; }
.fade-in.delay-3 { animation-delay: 0.6s; }
.fade-in.delay-4 { animation-delay: 0.8s; }

/* Scroll animations */
.scroll-animate {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-animate.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Hero section başlangıçta görünür olsun */
.hero-section.scroll-animate {
  opacity: 1;
  transform: translateY(0);
}

/* For staggered animations */
.scroll-animate[style*="0.1s"] { transition-delay: 0.1s; }
.scroll-animate[style*="0.2s"] { transition-delay: 0.2s; }
.scroll-animate[style*="0.3s"] { transition-delay: 0.3s; }
.scroll-animate[style*="0.4s"] { transition-delay: 0.4s; }
.scroll-animate[style*="0.5s"] { transition-delay: 0.5s; }
.scroll-animate[style*="0.6s"] { transition-delay: 0.6s; }

/* For different animation types */
.scroll-animate.slide-left {
  transform: translateX(-50px);
}

.scroll-animate.slide-right {
  transform: translateX(50px);
}

.scroll-animate.slide-left.animate-in,
.scroll-animate.slide-right.animate-in {
  transform: translateX(0);
}

.feature-icon,
.feature-icon-large {
  animation: float 3s ease-in-out infinite;
}

.feature-item:nth-child(odd) .feature-icon,
.feature-card:nth-child(odd) .feature-icon-large {
  animation-delay: 0.5s;
}


</style>
