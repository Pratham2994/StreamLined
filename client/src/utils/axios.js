import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // This is important for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401s from the profile endpoint
    if (error.response?.status === 401 && 
        !error.config.url.includes('/api/users/profile')) {
      window.location.replace('/');
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor to handle CORS preflight
axiosInstance.interceptors.request.use(
  (config) => {
    // Add CORS headers to all requests
    config.headers = {
      ...config.headers,
      'Access-Control-Allow-Credentials': 'true',
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 