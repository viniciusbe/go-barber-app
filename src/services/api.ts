import axios from 'axios';
import { API_URL } from '@env';

const api = axios.create({
  baseURL: API_URL || 'http://10.0.2.2:3333',
});

export default api;
