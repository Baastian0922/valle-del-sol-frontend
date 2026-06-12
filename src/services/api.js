import axios from 'axios';

const api = axios.create({
  // Utiliza la variable de entorno, y si no existe (fallback), usa localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/reportes' 
});

export default api;