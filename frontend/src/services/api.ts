import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're not already on the sign-in page
    if (error.response?.status === 401 && !window.location.pathname.toLowerCase().includes('signin')) {
      window.location.href = '/SignIn';
    }
    return Promise.reject(error);
  }
);

export default api;