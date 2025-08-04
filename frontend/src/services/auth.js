import axios from 'axios';

export async function login(data) {
  const res = await axios.post('/api/auth/login', data);
  return res.data;
}

export async function register(data) {
  const res = await axios.post('/api/auth/register', data);
  return res.data;
} 