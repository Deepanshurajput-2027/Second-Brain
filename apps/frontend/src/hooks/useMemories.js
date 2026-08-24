import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchMemories, 
  ingestMemory, 
  uploadMemory as uploadMemoryThunk,
  deleteMemory, 
  setSearchQuery, 
  setActiveTag,
  performSemanticSearch as performSemanticSearchThunk,
  toggleSemanticSearch as toggleSemanticSearchAction,
  updateMemory as updateMemoryThunk,
  setActiveMemory,
  clearActiveMemory
} from '../store/slices/memorySlice';

export const useMemories = () => {
  const dispatch = useDispatch();
  const { 
    items, 
    status, 
    ingestStatus, 
    error, 
    searchQuery, 
    activeTag, 
    isSemanticSearchActive,
    searchResults,
    searchStatus,
    activeMemory
  } = useSelector((state) => state.memory);

  const loadMemories = useCallback(() => {
    dispatch(fetchMemories());
  }, [dispatch]);

  const addNewMemory = useCallback((url) => {
    return dispatch(ingestMemory(url)).unwrap();
  }, [dispatch]);

  const uploadMemory = useCallback((file) => {
    return dispatch(uploadMemoryThunk(file)).unwrap();
  }, [dispatch]);

  const removeMemory = useCallback((id) => {
    return dispatch(deleteMemory(id)).unwrap();
  }, [dispatch]);

  const updateSearchQuery = useCallback((query) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  const updateActiveTag = useCallback((tag) => {
    dispatch(setActiveTag(tag));
  }, [dispatch]);

  const toggleSemanticSearch = useCallback((value) => {
    dispatch(toggleSemanticSearchAction(value));
  }, [dispatch]);

  const performSemanticSearch = useCallback((query) => {
    return dispatch(performSemanticSearchThunk(query)).unwrap();
  }, [dispatch]);

  const updateMemory = useCallback((id, updateData) => {
    return dispatch(updateMemoryThunk({ id, updateData })).unwrap();
  }, [dispatch]);

  const openMemoryModal = useCallback((memory) => {
    dispatch(setActiveMemory(memory));
  }, [dispatch]);

  const closeMemoryModal = useCallback(() => {
    dispatch(clearActiveMemory());
  }, [dispatch]);

  // If semantic search is active, we rely on searchResults.
  // We only do client-side filtering if AI search is NOT active.
  const filteredMemories = useMemo(() => {
    if (isSemanticSearchActive) {
      if (searchResults) {
        if (activeTag) {
          return searchResults.filter(memory => memory.tags && memory.tags.includes(activeTag));
        }
        return searchResults;
      }
      return []; // Return empty until search is executed
    }

    // Standard client-side local filtering
    return items.filter(memory => {
      const matchQuery = searchQuery === '' || 
        (memory.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (memory.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchTag = !activeTag || (memory.tags && memory.tags.includes(activeTag));

      return matchQuery && matchTag;
    });
  }, [items, searchQuery, activeTag, isSemanticSearchActive]);

  // Extract a deduplicated list of all unique tags from the memories
  const uniqueTags = useMemo(() => {
    const allTags = items.flatMap(memory => memory.tags || []);
    return [...new Set(allTags)].sort();
  }, [items]);

  return {
    memories: items,
    filteredMemories,
    uniqueTags,
    searchQuery,
    activeTag,
    isSemanticSearchActive,
    searchStatus,
    isLoading: status === 'loading',
    isIngesting: ingestStatus === 'loading',
    error,
    addNewMemory,
    uploadMemory,
    removeMemory,
    loadMemories,
    updateSearchQuery,
    updateActiveTag,
    toggleSemanticSearch,
    performSemanticSearch,
    activeMemory,
    updateMemory,
    openMemoryModal,
    closeMemoryModal
  };
};
