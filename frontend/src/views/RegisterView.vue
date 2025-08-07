<template>
  <div class="auth-root">
    <div class="auth-card">
      <h2 class="auth-title">Create Your Account</h2>
      <form @submit.prevent="register" class="auth-form">
        <label for="email" class="auth-label">Email</label>
        <input v-model="email" id="email" type="email" placeholder="Enter your email" class="auth-input" required />
        <label for="password" class="auth-label">Password</label>
        <input v-model="password" id="password" type="password" placeholder="Create a password" class="auth-input" required />
        <button type="submit" class="auth-btn">Register</button>
        <div v-if="error" class="auth-error">{{ error }}</div>
        <div v-if="success" class="auth-success">Registration successful! <router-link to="/login" class="auth-link">Login</router-link></div>
      </form>
      <div class="auth-footer">
        <span>Already have an account?</span>
        <router-link to="/login" class="auth-link">Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const success = ref(false);

async function register() {
  try {
    await axios.post('/api/auth/register', { email: email.value, password: password.value });
    success.value = true;
    error.value = '';
    
    // Başarılı kayıt sonrası otomatik giriş yap
    try {
      const loginResponse = await axios.post('/api/auth/login', { 
        email: email.value, 
        password: password.value 
      });
      
      localStorage.setItem('token', loginResponse.data.token);
      
      // Dashboard'a yönlendir
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (loginErr) {
      // Otomatik giriş başarısız olursa login sayfasına yönlendir
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed';
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
.auth-root {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f7fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', 'Roboto', Arial, sans-serif;
}
.auth-card {
  background: #fff;
  border-radius: 2rem;
  box-shadow: 0 4px 32px 0 rgba(60, 60, 60, 0.10);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 370px;
  width: 100%;
  text-align: center;
  transition: box-shadow 0.3s;
}
.auth-title {
  font-size: 1.7rem;
  font-weight: 600;
  color: #388e7d;
  margin-bottom: 1.5rem;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.auth-label {
  text-align: left;
  font-size: 1rem;
  color: #4e5d6c;
  font-weight: 500;
  margin-bottom: 0.2rem;
}
.auth-input {
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  border: 1px solid #e0f2f1;
  background: #f8fafc;
  font-size: 1rem;
  transition: border 0.2s, box-shadow 0.2s;
  outline: none;
}
.auth-input:focus {
  border: 1.5px solid #6ee7b7;
  box-shadow: 0 2px 8px 0 #a7c7e7;
}
.auth-btn {
  background: linear-gradient(90deg, #fcb69f 0%, #a7c7e7 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.9rem 2.2rem;
  border-radius: 1.5rem;
  box-shadow: 0 2px 12px 0 rgba(60, 60, 60, 0.10);
  border: none;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
}
.auth-btn:hover, .auth-btn:focus {
  background: linear-gradient(90deg, #a7c7e7 0%, #fcb69f 100%);
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 6px 24px 0 rgba(60, 60, 60, 0.14);
}
.auth-error {
  color: #e57373;
  background: #ffebee;
  border-radius: 0.7rem;
  padding: 0.5rem 0.7rem;
  margin-top: 0.5rem;
  font-size: 0.97rem;
}
.auth-success {
  color: #388e7d;
  background: #e0f7fa;
  border-radius: 0.7rem;
  padding: 0.5rem 0.7rem;
  margin-top: 0.5rem;
  font-size: 0.97rem;
}
.auth-footer {
  margin-top: 1.2rem;
  font-size: 1rem;
  color: #4e5d6c;
}
.auth-link {
  color: #388e7d;
  font-weight: 600;
  margin-left: 0.4rem;
  text-decoration: underline;
  transition: color 0.2s;
}
.auth-link:hover, .auth-link:focus {
  color: #fcb69f;
}
@media (max-width: 600px) {
  .auth-card {
    padding: 1.2rem 0.5rem 1.2rem 0.5rem;
    border-radius: 1.2rem;
  }
}
</style> 