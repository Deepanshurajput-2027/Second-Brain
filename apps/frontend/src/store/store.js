import { configureStore } from '@reduxjs/toolkit';
import memoryReducer from './slices/memorySlice';
import chatReducer from './slices/chatSlice';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import collectionReducer from './slices/collectionSlice';

export const store = configureStore({
  reducer: {
    memory: memoryReducer,
    chat: chatReducer,
    theme: themeReducer,
    auth: authReducer,
    collection: collectionReducer,
  },
});
