import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMemoriesApi, ingestMemoryApi, uploadMemoryApi, deleteMemoryApi, semanticSearchApi, updateMemoryApi, getMemoryStatusApi } from '../../api/memoryApi';

export const fetchMemories = createAsyncThunk(
  'memory/fetchMemories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMemoriesApi();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const ingestMemory = createAsyncThunk(
  'memory/ingestMemory',
  async (url, { rejectWithValue }) => {
    try {
      const response = await ingestMemoryApi(url);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadMemory = createAsyncThunk(
  'memory/uploadMemory',
  async (file, { rejectWithValue }) => {
    try {
      const response = await uploadMemoryApi(file);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMemory = createAsyncThunk(
  'memory/deleteMemory',
  async (id, { rejectWithValue }) => {
    try {
      await deleteMemoryApi(id);
      return id;
    } catch (error) {
      return rejectWithValue({ id, error: error.response?.data || error.message });
    }
  }
);

export const performSemanticSearch = createAsyncThunk(
  'memory/semanticSearch',
  async (query, { rejectWithValue }) => {
    try {
      const response = await semanticSearchApi(query);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMemory = createAsyncThunk(
  'memory/updateMemory',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateMemoryApi(id, updateData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkMemoryStatus = createAsyncThunk(
  'memory/checkMemoryStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getMemoryStatusApi(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  items: [],
  searchResults: null,
  searchStatus: 'idle',
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  ingestStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  searchQuery: '',
  activeTag: null,
  backupItems: {},
  isSemanticSearchActive: false,
  activeMemory: null,
};

const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveTag: (state, action) => {
      state.activeTag = action.payload;
    },
    toggleSemanticSearch: (state, action) => {
      state.isSemanticSearchActive = action.payload ?? !state.isSemanticSearchActive;
      if (!state.isSemanticSearchActive) {
        state.searchQuery = ''; 
        state.searchResults = null;
        state.searchStatus = 'idle';
      }
    },
    setActiveMemory: (state, action) => {
      state.activeMemory = action.payload;
    },
    clearActiveMemory: (state) => {
      state.activeMemory = null;
    },
    clearMemories: (state) => {
      state.items = [];
      state.searchResults = null;
      state.searchStatus = 'idle';
      state.status = 'idle';
      state.searchQuery = '';
      state.activeTag = null;
      state.isSemanticSearchActive = false;
      state.activeMemory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Memories
      .addCase(fetchMemories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMemories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMemories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Semantic Search
      .addCase(performSemanticSearch.pending, (state) => {
        state.searchStatus = 'loading';
      })
      .addCase(performSemanticSearch.fulfilled, (state, action) => {
        state.searchStatus = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(performSemanticSearch.rejected, (state, action) => {
        state.searchStatus = 'failed';
        state.error = action.payload;
      })
      // Ingest Memory
      .addCase(ingestMemory.pending, (state) => {
        state.ingestStatus = 'loading';
      })
      .addCase(ingestMemory.fulfilled, (state, action) => {
        state.ingestStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(ingestMemory.rejected, (state, action) => {
        state.ingestStatus = 'failed';
        state.error = action.payload;
      })
      // Upload Memory
      .addCase(uploadMemory.pending, (state) => {
        state.ingestStatus = 'loading';
      })
      .addCase(uploadMemory.fulfilled, (state, action) => {
        state.ingestStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(uploadMemory.rejected, (state, action) => {
        state.ingestStatus = 'failed';
        state.error = action.payload;
      })
      // Delete Memory (Optimistic)
      .addCase(deleteMemory.pending, (state, action) => {
        const id = action.meta.arg;
        const itemToDelete = state.items.find(item => (item.id || item._id) === id);
        if (itemToDelete) {
          state.backupItems[id] = itemToDelete;
          state.items = state.items.filter(item => (item.id || item._id) !== id);
        }
      })
      .addCase(deleteMemory.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.backupItems[id];
      })
      .addCase(deleteMemory.rejected, (state, action) => {
        const id = action.payload?.id || action.meta.arg;
        if (state.backupItems[id]) {
          state.items.unshift(state.backupItems[id]);
          delete state.backupItems[id];
        }
        state.error = action.payload?.error || 'Failed to delete memory';
      })
      // Update Memory
      .addCase(updateMemory.fulfilled, (state, action) => {
        const updatedMemory = action.payload;
        const index = state.items.findIndex(item => (item.id || item._id) === (updatedMemory.id || updatedMemory._id));
        if (index !== -1) {
          state.items[index] = updatedMemory;
        }
        if (state.activeMemory && (state.activeMemory.id || state.activeMemory._id) === (updatedMemory.id || updatedMemory._id)) {
          state.activeMemory = updatedMemory;
        }
      })
      // Check Memory Status
      .addCase(checkMemoryStatus.fulfilled, (state, action) => {
        const updatedMemory = action.payload;
        const index = state.items.findIndex(item => (item.id || item._id) === (updatedMemory.id || updatedMemory._id));
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updatedMemory };
        }
      });
  },
});

export const { setSearchQuery, setActiveTag, toggleSemanticSearch, setActiveMemory, clearActiveMemory, clearMemories } = memorySlice.actions;

export default memorySlice.reducer;
