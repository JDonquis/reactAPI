import axios from "axios";

const api = axios.create({
  baseURL: 'https://phplaravel-1216910-4323879.cloudwaysapps.com/api',
  withCredentials: true,
  withXSRFToken: true,
  browserBaseURL: 'https://',
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