import axios from 'axios';

// ✅ FIXED: Removed the extra double quotes that were causing the %22%22 error
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api'; // Just use '/api' as the fallback

const API = axios.create({ baseURL: API_BASE_URL });

// This will now show "Connecting to API at: /api" instead of "Connecting to API at: ""/api"
console.log("Connecting to API at:", API_BASE_URL);

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const signup = (formData: object) => API.post('/auth/signup', formData);
export const login = (formData: object) => API.post('/auth/login', formData);