import axios from 'axios';

// ✅ Dynamically choose the URL based on the environment
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '""/api';

const API = axios.create({ baseURL: API_BASE_URL });

// Log this to your browser console so you can see if it's working
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