import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚡️ IMPORTANT: Replace 'localhost' with your computer's local IP address (e.g. 192.168.1.5)
// so the mobile app can reach your backend server.
const LOCAL_IP = 'localhost'; 


// const BASE_URL = `https://punar-milan-backend-v-1-0-h129.vercel.app/api`;
// export const SOCKET_URL = `https://punar-milan-backend-v-1-0-h129.vercel.app/`;
const BASE_URL = `http://10.139.191.48:5001/api`;
export const SOCKET_URL = `http://10.139.191.48:5001`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
