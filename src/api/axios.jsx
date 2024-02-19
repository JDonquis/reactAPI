import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  withXSRFToken: true,
  browserBaseURL: 'http://',
});

// Interceptor para actualizar los headers antes de cada solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apiToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;