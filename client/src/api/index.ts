import axios from 'axios';

// Create the connection to your Backend
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// The "Bouncer" for the Frontend: 
// This automatically grabs your token from memory and attaches it to your requests
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Define what the functions send to the backend
export const signup = (formData: object) => API.post('/auth/signup', formData);
export const login = (formData: object) => API.post('/auth/login', formData);

// We can add more later, like:
// export const getBalance = () => API.get('/user/balance');