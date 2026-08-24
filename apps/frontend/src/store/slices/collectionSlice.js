import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { getCollectionsApi, createCollectionApi, deleteCollectionApi, addItemToCollectionApi, getCollectionItemsApi, removeItemFromCollectionApi } from '../../api/collectionApi';

export const fetchCollections = createAsyncThunk(
  'collection/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCollectionsApi();
      return response?.data?.collections || response?.collections || response?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCollection = createAsyncThunk(
  'collection/createCollection',
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const response = await createCollectionApi(name, description);
      return response?.data?.collection || response?.collection || response?.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCollection = createAsyncThunk(
  'collection/deleteCollection',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[deleteCollection Thunk] Deleting collection id:', id);
      const response = await deleteCollectionApi(id);
      console.log('[deleteCollection Thunk] Server response:', response);
      return id;
    } catch (error) {
      console.error('[deleteCollection Thunk] Error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addMemoryToCollection = createAsyncThunk(
  'collection/addMemoryToCollection',
  async ({ collectionId, memoryId }, { rejectWithValue }) => {
    try {
      const response = await addItemToCollectionApi(collectionId, memoryId);
      return response?.data?.collection || response?.collection || response?.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeMemoryFromCollectionThunk = createAsyncThunk(
  'collection/removeMemoryFromCollection',
  async ({ collectionId, memoryId }, { rejectWithValue }) => {
    try {
      await removeItemFromCollectionApi(collectionId, memoryId);
      return { collectionId, memoryId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addMemoriesToCollectionThunk = createAsyncThunk(
  'collection/addMemoriesToCollectionThunk',
  async ({ collectionId, memoryIds }, { dispatch, rejectWithValue }) => {
    try {
      const results = await Promise.all(
        memoryIds.map(memoryId => addItemToCollectionApi(collectionId, memoryId))
      );
      dispatch(fetchCollectionItems(collectionId));
      return results;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCollectionItems = createAsyncThunk(
  'collection/fetchCollectionItems',
  async (collectionId, { rejectWithValue }) => {
    try {
      const response = await getCollectionItemsApi(collectionId);
      return response?.data?.items || response?.items || response?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  activeCollectionId: null,
  activeCollectionItems: [],
  itemsStatus: 'idle',
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setActiveCollection: (state, action) => {
      state.activeCollectionId = action.payload;
    },
    clearActiveCollection: (state) => {
      state.activeCollectionId = null;
      state.activeCollectionItems = [];
      state.itemsStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Collections
      .addCase(fetchCollections.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create Collection
      .addCase(createCollection.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      
      // Delete Collection
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.items = state.items.filter(item => (item.id || item._id) !== action.payload);
        if (state.activeCollectionId === action.payload) {
          state.activeCollectionId = null;
          state.activeCollectionItems = [];
        }
      })
      
      // Fetch Collection Items
      .addCase(fetchCollectionItems.pending, (state) => { state.itemsStatus = 'loading'; })
      .addCase(fetchCollectionItems.fulfilled, (state, action) => {
        state.itemsStatus = 'succeeded';
        state.activeCollectionItems = action.payload;
      })
      .addCase(fetchCollectionItems.rejected, (state, action) => {
        state.itemsStatus = 'failed';
        state.error = action.payload;
      })
      
      // Remove Memory from Collection (Optimistic Update)
      .addCase(removeMemoryFromCollectionThunk.fulfilled, (state, action) => {
        console.log("REDUCER UPDATE (Remove Memory):", action.payload);
        const { collectionId, memoryId } = action.payload;
        state.activeCollectionItems = state.activeCollectionItems.filter(
          item => (item.id || item._id) !== memoryId
        );
        
        // Keep the global collections array in sync
        const collection = state.items.find(c => (c.id || c._id) === collectionId);
        if (collection) {
          if (typeof collection.itemCount === 'number') {
            collection.itemCount = Math.max(0, collection.itemCount - 1);
          }
          if (Array.isArray(collection.items)) {
            collection.items = collection.items.filter(item => (item._id || item.id || item) !== memoryId);
          }
          if (Array.isArray(collection.knowledgeItems)) {
            collection.knowledgeItems = collection.knowledgeItems.filter(item => (item._id || item.id || item) !== memoryId);
          }
        }
      })
      
      // Add Memory to Collection (Optimistic Update of items list)
      .addCase(addMemoryToCollection.fulfilled, (state, action) => {
        const updatedCollection = action.payload;
        const index = state.items.findIndex(c => (c.id || c._id) === (updatedCollection.id || updatedCollection._id));
        if (index !== -1) {
          state.items[index] = updatedCollection;
        }
      })
      
      // Add Memories to Collection (Optimistic Update of items list)
      .addCase(addMemoriesToCollectionThunk.fulfilled, (state, action) => {
        const updatedCollections = action.payload;
        updatedCollections.forEach(updatedCollection => {
          if (!updatedCollection) return;
          const index = state.items.findIndex(c => (c.id || c._id) === (updatedCollection.id || updatedCollection._id));
          if (index !== -1) {
            state.items[index] = updatedCollection;
          }
        });
      });
  }
});

// Memoized Selector to compute accurate item count efficiently
export const selectCollectionItemCount = createSelector(
  [
    (state) => state.collection.items,
    (state, collectionId) => collectionId
  ],
  (items, collectionId) => {
    const collection = items.find(c => (c.id || c._id) === collectionId);
    if (!collection) return 0;
    
    // Priority 1: If the items array is populated, it is the most accurate source of truth
    if (Array.isArray(collection.knowledgeItems)) return collection.knowledgeItems.length;
    if (Array.isArray(collection.items)) return collection.items.length;
    
    // Priority 2: Fallback to the primitive count if arrays aren't hydrated
    if (typeof collection.itemCount === 'number') return collection.itemCount;
    
    return 0;
  }
);

export const { setActiveCollection, clearActiveCollection } = collectionSlice.actions;
export default collectionSlice.reducer;
