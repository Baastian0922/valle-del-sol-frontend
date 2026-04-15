import axios from 'axios';

const api = axios.create({
  // Asegúrate de que este sea el puerto donde Matías corre su Spring Boot
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;