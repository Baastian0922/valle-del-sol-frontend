import axios from 'axios';

const api = axios.create({
  // Debe ser 8082 (Monitoreo) y coincidir con el @RequestMapping de Java
  baseURL: 'http://localhost:8082/api/mapa' 
});

export default api;