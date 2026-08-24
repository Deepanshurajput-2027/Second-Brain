import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import { MemoryCard } from '../components/MemoryCard';
import { ArrowLeft, Loader2, Plus, Bookmark, Trash2 } from 'lucide-react';
import { AddMemoryModal } from '../components/AddMemoryModal';
import { useCollectionManager } from '../hooks/useCollectionManager';
import { toast } from 'react-hot-toast';

export const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    collections, 
    selectCollection, 
    clearSelection, 
    removeCollection,
    activeCollectionItems, 
    itemsStatus 
  } = useCollections();

  const {
    isModalOpen,
    toggleModal,
    availableMemories,
    selectedMemoryIds,
    toggleMemorySelection,
    handleSave,
    isSaving
  } = useCollectionManager(id);

  useEffect(() => {
    if (id) {
      selectCollection(id);
    }
    return () => {
      clearSelection();
    };
  }, [id, selectCollection, clearSelection]);

  const collection = collections.find(c => (c.id || c._id) === id);

  const uniqueTags = useMemo(() => {
    const allTags = activeCollectionItems.flatMap(memory => memory.tags || []);
    return [...new Set(allTags)].slice(0, 5); // display up to 5 tags in summary
  }, [activeCollectionItems]);

  const handleDeleteCollection = async () => {
    if (window.confirm(`Are you sure you want to delete the collection "${collection?.name || 'this collection'}"?`)) {
      try {
        console.log('[CollectionDetail] Deleting collection:', id);
        await removeCollection(id);
        toast.success('Collection deleted');
        navigate('/collections');
      } catch (error) {
        console.error('[CollectionDetail] Failed to delete collection:', error);
        toast.error('Failed to delete collection');
      }
    }
  };

  return (
    <div className="flex-1 w-full min-w-0 pb-12 px-1">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate('/collections')}
            className="mt-1 p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-colors shadow-sm"
            aria-label="Back to Collections"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {collection?.name || 'Collection Details'}
            </h1>
            
            {/* Tag Summary / Subtitle */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-500">
                {activeCollectionItems.length} {activeCollectionItems.length === 1 ? 'Memory' : 'Memories'}
              </span>
              {uniqueTags.length > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {uniqueTags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        #{tag}
                      </span>
                    ))}
                    {activeCollectionItems.flatMap(m => m.tags || []).length > 5 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-500">...</span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {collection?.description && (
              <p className="text-slate-500 mt-3 max-w-2xl text-base">{collection.description}</p>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            onClick={handleDeleteCollection}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-medium rounded-xl transition-colors shadow-sm"
            title="Delete Collection"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
          <button 
            onClick={toggleModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Grid Area */}
      {itemsStatus === 'loading' ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : activeCollectionItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm mt-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
             <Bookmark className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">This collection is empty</h2>
          <p className="text-slate-500 max-w-sm text-center mb-6 text-sm">
            You haven't added any memories to this collection yet. Add your first link or note to get started.
          </p>
          <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
            Add your first memory
          </button>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-6">
          {activeCollectionItems.map(memory => (
            <div key={memory.id || memory._id} className="break-inside-avoid mb-6">
              <MemoryCard memory={memory} collectionId={id} />
            </div>
          ))}
        </div>
      )}
      
      <AddMemoryModal 
        isOpen={isModalOpen}
        onClose={toggleModal}
        availableMemories={availableMemories}
        selectedIds={selectedMemoryIds}
        onToggleSelection={toggleMemorySelection}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};
