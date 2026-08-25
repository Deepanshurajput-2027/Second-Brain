import { apiClient } from './apiClient';

export const getCollectionsApi = async () => {
  const response = await apiClient.get('/collections');
  return response.data;
};

export const createCollectionApi = async (name, description) => {
  const response = await apiClient.post('/collections', { name, description });
  return response.data;
};

export const deleteCollectionApi = async (id) => {
  console.log('[collectionApi] DELETE /collections/' + id);
  const response = await apiClient.delete(`/collections/${id}`);
  return response.data;
};

export const addItemToCollectionApi = async (collectionId, memoryId) => {
  const response = await apiClient.post(`/collections/${collectionId}/items`, { knowledgeId: memoryId });
  return response.data;
};

export const getCollectionItemsApi = async (collectionId) => {
  const response = await apiClient.get(`/collections/${collectionId}/items`);
  return response.data;
};

export const removeItemFromCollectionApi = async (collectionId, memoryId) => {
  const response = await apiClient.delete(`/collections/${collectionId}/items/${memoryId}`);
  return response.data;
};
