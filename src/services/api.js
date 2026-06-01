import axios from 'axios';

const api = axios.create({
  // Asegúrate de usar el puerto 8081 y la ruta completa
  baseURL: 'http://localhost:8081/api/reportes' 
});

export default api;