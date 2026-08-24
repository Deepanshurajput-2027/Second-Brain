import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMemoriesToCollectionThunk } from '../store/slices/collectionSlice';
import { useToast } from '../components/ToastProvider';

export const useCollectionManager = (collectionId) => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemoryIds, setSelectedMemoryIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  
  const allMemories = useSelector(state => state.memory?.items || []);
  const activeCollectionItems = useSelector(state => state.collection?.activeCollectionItems || []);
  
  const availableMemories = useMemo(() => {
    const activeIds = new Set(activeCollectionItems.map(m => m.id || m._id));
    return allMemories.filter(m => !activeIds.has(m.id || m._id));
  }, [allMemories, activeCollectionItems]);

  const toggleModal = useCallback(() => {
    setIsModalOpen(prev => {
      if (!prev) setSelectedMemoryIds(new Set());
      return !prev;
    });
  }, []);

  const toggleMemorySelection = useCallback((memoryId) => {
    setSelectedMemoryIds(prev => {
      const next = new Set(prev);
      if (next.has(memoryId)) next.delete(memoryId);
      else next.add(memoryId);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (selectedMemoryIds.size === 0) return;
    
    setIsSaving(true);
    try {
      await dispatch(addMemoriesToCollectionThunk({
        collectionId,
        memoryIds: Array.from(selectedMemoryIds)
      })).unwrap();
      
      toast.success(`${selectedMemoryIds.size} memories added successfully!`);
      toggleModal();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to add memories');
    } finally {
      setIsSaving(false);
    }
  }, [collectionId, selectedMemoryIds, dispatch, toggleModal, toast]);

  return {
    isModalOpen,
    toggleModal,
    availableMemories,
    selectedMemoryIds,
    toggleMemorySelection,
    handleSave,
    isSaving
  };
};
