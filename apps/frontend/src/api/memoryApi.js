import { apiClient } from './apiClient';

export const ingestMemoryApi = async (url) => {
  const response = await apiClient.post('/memories', { url });
  return response.data;
};

export const uploadMemoryApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/memories/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMemoriesApi = async () => {
  const response = await apiClient.get('/memories');
  return response.data;
};

export const deleteMemoryApi = async (id) => {
  const response = await apiClient.delete(`/memories/${id}`);
  return response.data;
};

export const semanticSearchApi = async (query) => {
  const response = await apiClient.get(`/memories/semantic-search`, {
    params: { q: query }
  });
  return response.data;
};

export const updateMemoryApi = async (id, updateData) => {
  const response = await apiClient.put(`/memories/${id}`, updateData);
  return response.data;
};

export const getMemoryStatusApi = async (id) => {
  const response = await apiClient.get(`/memories/${id}/status`);
  return response.data;
};
