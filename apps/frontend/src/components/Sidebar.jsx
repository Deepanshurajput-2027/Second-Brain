import React, { useState, useEffect } from 'react';
import { useMemories } from '../hooks/useMemories';
import { useCollections } from '../hooks/useCollections';
import { Tag, CheckCircle2, Hash, Folder, Plus, FolderOpen, X, Loader2, Trash2 } from 'lucide-react';
import { useToast } from './ToastProvider';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const { uniqueTags, activeTag, updateActiveTag } = useMemories();
  const { 
    collections, 
    loadCollections, 
    activeCollectionId, 
    selectCollection, 
    createNewCollection,
    removeCollection 
  } = useCollections();
  
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    
    try {
      setIsSubmitting(true);
      await createNewCollection(newColName.trim(), newColDesc.trim());
      toast.success('Collection created successfully');
      setNewColName('');
      setNewColDesc('');
      setIsCreating(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        console.log('[Sidebar] Deleting collection:', id);
        await removeCollection(id);
        toast.success("Collection deleted");
        if (location.pathname === `/collections/${id}`) {
          navigate('/collections');
        }
      } catch (error) {
        console.error('[Sidebar] Failed to delete collection:', error);
        toast.error("Failed to delete collection");
      }
    }
  };

  return (
    <aside className="w-72 shrink-0 h-[calc(100vh-8rem)] sticky top-24 mr-8 overflow-y-auto hidden lg:block pb-12 transition-colors">
      <div className="bg-white border-r border-gray-200 rounded-3xl p-6 shadow-sm h-full flex flex-col transition-colors space-y-8">
        
        {/* Collections Section */}
        <div className="flex flex-col flex-shrink-0 max-h-[50%]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center shrink-0 transition-colors">
              <Folder className="w-4 h-4 mr-2" />
              Collections
            </h3>
            <button 
              onClick={() => setIsCreating(true)}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              title="New Collection"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* New Collection Inline Form */}
          {isCreating && (
            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <form onSubmit={handleCreateCollection} className="space-y-3">
                <input 
                  type="text" 
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  placeholder="Collection Name" 
                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  autoFocus
                />
                <input 
                  type="text" 
                  value={newColDesc}
                  onChange={e => setNewColDesc(e.target.value)}
                  placeholder="Description (optional)" 
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                />
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setIsCreating(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                  <button type="submit" disabled={isSubmitting || !newColName.trim()} className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md disabled:opacity-50 flex items-center">
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-y-auto pr-1 space-y-1.5 flex-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => {
                selectCollection(null);
                navigate('/library');
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                location.pathname === '/library'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent'
              }`}
            >
              <span className="flex items-center">
                <FolderOpen className="w-4 h-4 mr-2 opacity-50" />
                All Library
              </span>
              {location.pathname === '/library' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </button>

            {(collections || []).length === 0 && (
              <p className="text-slate-400 text-sm py-2 px-4 text-center border border-dashed border-slate-200 rounded-xl mt-2 transition-colors">
                No collections yet.
              </p>
            )}

            {(collections || []).map((col) => {
              const colId = col.id || col._id;
              const isActive = location.pathname === `/collections/${colId}`;
              return (
              <div
                key={colId}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/collections/${colId}`)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/collections/${colId}`); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent'
                }`}
              >
                <span className="flex items-center truncate">
                  <Folder className="w-4 h-4 mr-2 opacity-50 shrink-0" />
                  <span className="truncate">{col.name}</span>
                </span>
                <div className="flex items-center shrink-0 ml-2">
                  <button
                    type="button"
                    title="Delete collection"
                    aria-label={`Delete ${col.name}`}
                    onClick={(e) => handleDeleteCollection(e, colId)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all mr-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 hover:scale-110 transition-transform" />
                  </button>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>
            );})}
          </div>
        </div>

        {/* Separator */}
        <hr className="border-slate-200" />

        {/* Tags Section */}
        <div className="flex flex-col flex-1 min-h-0">
          <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center shrink-0 transition-colors">
            <Tag className="w-4 h-4 mr-2" />
            Filter by Tag
          </h3>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => updateActiveTag(null)}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                activeTag === null 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent'
              }`}
            >
              <span className="flex items-center">
                <Hash className="w-4 h-4 mr-2 opacity-50" />
                All Tags
              </span>
              {activeTag === null && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </button>

            {uniqueTags.length === 0 && (
              <p className="text-slate-400 text-sm py-4 px-4 text-center border border-dashed border-slate-200 rounded-xl mt-4 transition-colors">
                No tags generated yet.
              </p>
            )}

            {uniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => updateActiveTag(tag)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-between group ${
                  activeTag === tag
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent'
                }`}
              >
                <span className="flex items-center truncate">
                  <Hash className="w-4 h-4 mr-2 opacity-50 shrink-0" />
                  <span className="truncate">{tag}</span>
                </span>
                {activeTag === tag && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
              </button>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
};
