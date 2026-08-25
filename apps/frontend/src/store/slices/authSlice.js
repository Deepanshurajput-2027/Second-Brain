import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginApi,
  registerApi,
  logoutApi,
  updateProfileApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '../../api/authApi';

// Initial state checks localStorage for existing token/user (simple persistence)
const getInitialUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const initialState = {
  user: getInitialUser(),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

// Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginApi(email, password);
      // Backend returns standard response structure e.g. { data: { user, accessToken } }
      const { user, accessToken } = response.data || response; 
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await registerApi(name, email, password);
      const { user, accessToken } = response.data || response;
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
      return true;
    } catch (error) {
      // Even if API call fails, clear local state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await updateProfileApi(profileData);
      const user = response.data?.user || response.user;
      
      // Update local storage user data
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordApi(email);
      return response.message || 'Password reset link sent';
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await resetPasswordApi(token, password);
      return response.message || 'Password reset successfully';
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

// Convenient alias exports
export const forgotPassword = forgotPasswordThunk;
export const resetPassword = resetPasswordThunk;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.accessToken) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Forgot Password
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;

