import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCollections,
  createCollection as createCollectionThunk,
  deleteCollection as deleteCollectionThunk,
  addMemoryToCollection as addMemoryThunk,
  removeMemoryFromCollectionThunk,
  fetchCollectionItems,
  setActiveCollection,
  clearActiveCollection
} from '../store/slices/collectionSlice';

export const useCollections = () => {
  const dispatch = useDispatch();
  const { 
    items, 
    status, 
    error,
    activeCollectionId,
    activeCollectionItems,
    itemsStatus
  } = useSelector((state) => state.collection);

  const loadCollections = useCallback(() => {
    return dispatch(fetchCollections()).unwrap();
  }, [dispatch]);

  const createNewCollection = useCallback((name, description) => {
    return dispatch(createCollectionThunk({ name, description })).unwrap();
  }, [dispatch]);

  const removeCollection = useCallback((id) => {
    return dispatch(deleteCollectionThunk(id)).unwrap();
  }, [dispatch]);

  const addMemoryToCollection = useCallback((collectionId, memoryId) => {
    return dispatch(addMemoryThunk({ collectionId, memoryId })).unwrap();
  }, [dispatch]);

  const removeMemoryFromCollection = useCallback((collectionId, memoryId) => {
    return dispatch(removeMemoryFromCollectionThunk({ collectionId, memoryId })).unwrap();
  }, [dispatch]);

  const loadCollectionItems = useCallback((id) => {
    return dispatch(fetchCollectionItems(id)).unwrap();
  }, [dispatch]);

  const selectCollection = useCallback((id) => {
    dispatch(setActiveCollection(id));
    if (id) {
      dispatch(fetchCollectionItems(id));
    }
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch(clearActiveCollection());
  }, [dispatch]);

  return {
    collections: items || [],
    status,
    error,
    activeCollectionId,
    activeCollectionItems: activeCollectionItems || [],
    itemsStatus,
    loadCollections,
    createNewCollection,
    removeCollection,
    addMemoryToCollection,
    removeMemoryFromCollection,
    loadCollectionItems,
    selectCollection,
    clearSelection
  };
};
