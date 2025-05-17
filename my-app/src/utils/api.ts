import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  // You can add headers or interceptors here if needed
});

export default api;
