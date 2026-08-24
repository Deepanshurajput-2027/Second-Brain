import React, { useState } from 'react';
import { Youtube, FileText, ExternalLink, Calendar, Trash2, Pencil, Sparkles, Network, CheckSquare, Square, FolderPlus, X } from 'lucide-react';
import { useMemories } from '../hooks/useMemories';
import { useCollections } from '../hooks/useCollections';
import { useToast } from './ToastProvider';
import { useChat } from '../hooks/useChat';
import { useNavigate } from 'react-router-dom';

export const MemoryCard = ({ memory, selectable = false, isSelected = false, onToggleSelect = () => {}, collectionId = null }) => {
  const { title, url, sourceType, summary, createdAt, tags = [], id, _id, aiStatus } = memory;
  const memoryId = id || _id;
  const { removeMemory, activeTag, updateActiveTag, openMemoryModal } = useMemories();
  const { collections, addMemoryToCollection, removeMemoryFromCollection } = useCollections();
  const { setDraftQuery, toggleChat, isChatOpen } = useChat();
  const toast = useToast();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isYoutube = sourceType === 'youtube' || (url && url.includes('youtube.com'));
  const SourceIcon = isYoutube ? Youtube : FileText;

  const isProcessing = aiStatus === 'pending' || aiStatus === 'processing';
  const displayTitle = title || (isProcessing ? 'Processing Memory...' : 'Untitled Memory');
  const displaySummary = summary || (isProcessing ? 'AI is currently analyzing this content. Please wait...' : 'No summary available for this memory.');

  const formattedDate = createdAt 
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(createdAt))
    : 'Unknown Date';

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!memoryId) return;

    if (window.confirm("Are you sure you want to delete this memory?")) {
      try {
        await removeMemory(memoryId);
        toast.success('Memory deleted successfully');
      } catch (error) {
        console.error('Failed to delete:', error);
        toast.error('Failed to delete memory');
      }
    }
  };

  const handleRemoveFromCollection = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!memoryId || !collectionId) return;

    if (window.confirm("Are you sure you want to remove this memory from the collection?")) {
      try {
        await removeMemoryFromCollection(collectionId, memoryId);
        toast.success('Removed from collection');
      } catch (err) {
        console.error('Failed to remove:', err);
        toast.error('Failed to remove from collection');
      }
    }
  };

  const handleAddToCollection = async (e, collectionId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await addMemoryToCollection(collectionId, memoryId);
      toast.success('Added to collection');
      setIsDropdownOpen(false);
    } catch (err) {
      toast.error('Failed to add to collection');
    }
  };

  const handleAskAI = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const draft = `Context: ${displayTitle}\n\nMy Question: `;
    setDraftQuery(draft);
    if (!isChatOpen) {
      toggleChat();
    }
  };

  const handleViewInGraph = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/graph?nodeId=${memoryId}`);
  };

  const handleToggleSelect = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleSelect(memoryId);
  };

  return (
    <div 
      onClick={() => openMemoryModal(memory)}
      className={`flex flex-col bg-white border ${isSelected ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative cursor-pointer`}
    >
      {/* Select Checkbox */}
      {selectable && (
        <button
          onClick={handleToggleSelect}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-emerald-500 transition-colors z-10"
        >
          {isSelected ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5" />}
        </button>
      )}

      {/* Header Container */}
      <div className={`flex justify-between items-start w-full mb-3 ${selectable ? 'pl-8' : ''}`}>
        {/* LEFT: Type, Icon, Date */}
        <div className="flex items-center gap-2 text-sm text-slate-500 transition-colors">
          <SourceIcon className={`w-5 h-5 flex-shrink-0 ${isYoutube ? 'text-rose-500' : 'text-blue-500'}`} />
          <span className="capitalize font-medium truncate">{sourceType || 'Web Article'}</span>
          <span className="text-slate-300 flex-shrink-0">•</span>
          <div className="flex items-center flex-shrink-0">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="whitespace-nowrap">{formattedDate}</span>
          </div>
          {isProcessing && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 animate-pulse">
              AI Processing...
            </span>
          )}
        </div>

        {/* RIGHT: Actions (Folder, Edit, Delete) */}
        <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Add to Collection"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="py-1 max-h-48 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Add to Collection</div>
                  {(collections || []).length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500">No collections found.</div>
                  ) : (
                    (collections || []).map(col => (
                      <button
                        key={col.id || col._id}
                        onClick={(e) => handleAddToCollection(e, col.id || col._id)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        {col.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              openMemoryModal(memory);
            }}
            className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit Memory"
          >
            <Pencil className="w-4 h-4" />
          </button>
          
          {collectionId ? (
            <button
              onClick={handleRemoveFromCollection}
              className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
              title="Remove from Collection"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 leading-tight mb-3 line-clamp-2 pr-2 transition-colors mt-2">
        {displayTitle}
      </h3>

      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-3 transition-colors">
        {displaySummary}
      </p>

      <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 flex-grow">
          {tags.length > 0 ? (
            tags.map((tag, idx) => {
              const isActive = activeTag === tag;
              return (
                <button 
                  key={idx} 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateActiveTag(isActive ? null : tag);
                  }}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors z-10 ${
                    isActive 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200'
                  }`}
                >
                  #{tag}
                </button>
              )
            })
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100 transition-colors">
              #untagged
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleAskAI}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            title="Ask AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={handleViewInGraph}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="View in Graph"
          >
            <Network className="w-4 h-4" />
          </button>
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Open Original"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
