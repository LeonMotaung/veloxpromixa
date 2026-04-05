import axios from 'axios';

// Get the API base URL from the environment (Vite)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://velox-backend-8crj.onrender.com';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

export default api;
