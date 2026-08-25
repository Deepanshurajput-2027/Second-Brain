import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  updateProfile as updateProfileThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  clearAuthError,
} from '../store/slices/authSlice';
import { clearMemories } from '../store/slices/memorySlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = useCallback(
    async (email, password) => {
      return dispatch(loginUser({ email, password })).unwrap();
    },
    [dispatch]
  );

  const register = useCallback(
    async (name, email, password) => {
      return dispatch(registerUser({ name, email, password })).unwrap();
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    dispatch(clearMemories());
    return dispatch(logoutUser()).unwrap();
  }, [dispatch]);

  const updateProfile = useCallback(
    async (profileData) => {
      return dispatch(updateProfileThunk(profileData)).unwrap();
    },
    [dispatch]
  );

  const forgotPassword = useCallback(
    async (email) => {
      return dispatch(forgotPasswordThunk({ email })).unwrap();
    },
    [dispatch]
  );

  const resetPassword = useCallback(
    async (token, password) => {
      return dispatch(resetPasswordThunk({ token, password })).unwrap();
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    clearError,
  };
};

