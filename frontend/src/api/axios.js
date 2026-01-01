import axios from 'axios';

const api = axios.create({
    baseURL: `http://${window.location.hostname}:8000/api/`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically inject token from localStorage if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
