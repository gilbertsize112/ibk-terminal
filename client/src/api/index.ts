import axios from 'axios';

/**
 * ✅ DYNAMIC BASE URL
 * This logic checks if you are running locally or on Vercel.
 * If local, it uses port 5000. If live, it uses the current domain.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : window.location.origin);

const API = axios.create({ 
    baseURL: API_BASE_URL 
});

// Verify this in your browser console (F12)
// It should now show http://localhost:5000 when you are testing locally.
console.log(`🚀 Connecting to API at: ${API_BASE_URL}`);

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

/**
 * ✅ AUTH ENDPOINT ROUTES
 */
export const signup = (formData: object) => API.post('/api/auth/signup', formData);
export const login = (formData: object) => API.post('/api/auth/login', formData);

/**
 * ✅ USER & TRANSACTION ENDPOINT ROUTES
 * Matches backend: app.use(['/api/user', '/user'], userRoutes);
 */
export const fetchProfile = () => API.get('/api/user/profile');
export const setupPin = (pin: string) => API.post('/api/user/setup-pin', { pin });
export const transferFunds = (transferData: object) => API.post('/api/user/transfer', transferData);
export const fetchTransactions = () => API.get('/api/user/transactions');

export default API;