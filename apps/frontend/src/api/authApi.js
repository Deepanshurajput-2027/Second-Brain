import { apiClient } from './apiClient';

export const loginApi = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (name, email, password) => {
  const response = await apiClient.post('/auth/register', { fullName: name, email, password });
  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  const response = await apiClient.put('/users/profile', profileData);
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (token, password) => {
  const response = await apiClient.post(`/auth/reset-password/${token}`, {
    newPassword: password,
    password,
  });
  return response.data;
};

