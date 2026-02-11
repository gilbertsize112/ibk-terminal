import axios from 'axios';

// ✅ Since everything is in ONE project, we use a relative path
// This prevents the %22%22 error entirely
const API_BASE_URL = '/api'; 

const API = axios.create({ 
    baseURL: API_BASE_URL 
});

// This will show "Connecting to API at: /api" in your console
console.log("System Mode: Unified (Frontend + Backend)");

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const signup = (formData: object) => API.post('/auth/signup', formData);
export const login = (formData: object) => API.post('/auth/login', formData);