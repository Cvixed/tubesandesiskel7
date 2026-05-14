import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Sesuaikan dengan port FastAPI
});

export const fetchStatus = async () => {
  try {
    const response = await api.get('/api/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
};

export const fetchHistory = async () => {
  try {
    const response = await api.get('/api/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

export const getMockStatus = async () => {
  const response = await api.get('/api/mock/status');
  return response.data; // { running: bool }
};

export const startMock = async () => {
  const response = await api.post('/api/mock/start');
  return response.data;
};

export const stopMock = async () => {
  const response = await api.post('/api/mock/stop');
  return response.data;
};

export default api;
