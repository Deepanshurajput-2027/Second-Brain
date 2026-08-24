import React, { useState, useMemo } from 'react';
import { useMemories } from '../hooks/useMemories';
import { useCollections } from '../hooks/useCollections';
import { useExportManager } from '../hooks/useExportManager';
import { MemoryCard } from '../components/MemoryCard';
import { 
  Search, X, Sparkles, Loader2, Filter, 
  Grid, List as ListIcon, CheckSquare, Square, Download, Trash2,
  Calendar, FileText, Youtube, Network
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { useChat } from '../hooks/useChat';
import { useNavigate } from 'react-router-dom';

export const LibraryView = () => {
  const { 
    filteredMemories, 
    memories,
    searchQuery, 
    updateSearchQuery, 
    activeTag, 
    updateActiveTag,
    isSemanticSearchActive,
    toggleSemanticSearch,
    performSemanticSearch,
    loadMemories,
    isLoading,
    searchStatus,
    removeMemory,
    openMemoryModal
  } = useMemories();

  const { exportAsMarkdown } = useExportManager();
  const { activeCollectionId, activeCollectionItems } = useCollections();
  const { setDraftQuery, toggleChat, isChatOpen } = useChat();
  const navigate = useNavigate();
  const toast = useToast();

  const [viewMode, setViewMode] = useState('grid');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, az
  const [formatFilter, setFormatFilter] = useState('all'); // all, document, video
  const [selectedIds, setSelectedIds] = useState([]);

  // Process memories with current sort and format filters
  const processedMemories = useMemo(() => {
    const sourceArray = activeCollectionId ? activeCollectionItems : filteredMemories;
    let result = [...(sourceArray || [])];

    // Format Filter
    if (formatFilter !== 'all') {
      result = result.filter(mem => {
        const isVideo = mem.sourceType === 'youtube' || (mem.url && mem.url.includes('youtube.com'));
        if (formatFilter === 'video') return isVideo;
        if (formatFilter === 'document') return !isVideo; // Simplify: if not video, it's document/web
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOrder === 'az') {
        const titleA = a.title || '';
        const titleB = b.title || '';
        return titleA.localeCompare(titleB);
      }
      return 0;
    });

    return result;
  }, [filteredMemories, sortOrder, formatFilter]);

  const allTags = useMemo(() => {
    const tags = new Set();
    memories.forEach(memory => {
      if (memory.tags) {
        memory.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [memories]);

  // --- Handlers ---
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (isSemanticSearchActive) {
      if (!searchQuery.trim()) {
        loadMemories();
        return;
      }
      try {
        console.log('AI Search Payload:', searchQuery);
        await performSemanticSearch(searchQuery);
      } catch (error) {
        toast.error('AI search failed to connect.');
      }
    }
  };

  const handleToggleMode = () => {
    const newValue = !isSemanticSearchActive;
    toggleSemanticSearch(newValue);
    if (!newValue) loadMemories();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === processedMemories.length) {
      setSelectedIds([]); // deselect all
    } else {
      setSelectedIds(processedMemories.map(m => m.id || m._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} memories?`)) return;
    
    // Simplistic bulk delete by dispatching multiple actions
    for (const id of selectedIds) {
      try {
        await removeMemory(id);
      } catch (error) {
        console.error('Failed to delete', id);
      }
    }
    toast.success(`Deleted ${selectedIds.length} memories`);
    setSelectedIds([]);
  };

  // List View Specific Actions
  const handleAskAI = (e, memory) => {
    e.stopPropagation();
    const draft = `Context: ${memory.title || 'Untitled'}\n\nMy Question: `;
    setDraftQuery(draft);
    if (!isChatOpen) toggleChat();
  };

  const handleViewInGraph = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/graph?nodeId=${id}`);
  };

  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation();
    try {
      await removeMemory(id);
      toast.success('Memory deleted');
    } catch(err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex-1 w-full min-w-0 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight transition-colors">
          Knowledge Library
        </h2>
        
        {/* Format & Sort Selectors & View Toggle */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1 shadow-sm transition-colors">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          
          <select 
            value={formatFilter} 
            onChange={(e) => setFormatFilter(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 text-slate-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
          >
            <option value="all">All Formats</option>
            <option value="document">Documents/Web</option>
            <option value="video">Videos</option>
          </select>

          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 text-slate-700 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Advanced Toolbar (Search & AI) */}
      <div className="w-full max-w-7xl mx-auto mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative group flex-grow w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSemanticSearchActive && isLoading ? (
                <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
              ) : (
                <Search className={`h-4 w-4 transition-colors ${isSemanticSearchActive ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              placeholder={isSemanticSearchActive ? "Ask AI anything (e.g. 'find the react tutorial')... hit Enter" : "Search titles and summaries locally..."}
              className={`block w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm ${
                isSemanticSearchActive ? 'border-emerald-300 ring-1 ring-emerald-50' : 'border-gray-200'
              }`}
            />
            {searchQuery && !isSemanticSearchActive && (
              <button
                type="button"
                onClick={() => updateSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <button
            onClick={handleToggleMode}
            className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm border ${
              isSemanticSearchActive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-600'
            }`}
          >
            <Sparkles className={`w-4 h-4 mr-2 ${isSemanticSearchActive ? 'text-emerald-500' : 'text-slate-400'}`} />
            AI Search {isSemanticSearchActive ? 'On' : 'Off'}
          </button>
        </div>

        {/* Tags Row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1 shrink-0 transition-colors">Tags:</span>
            {activeTag && (
              <button
                onClick={() => updateActiveTag(null)}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 text-white border border-slate-800 transition-colors shrink-0 gap-1"
              >
                #{activeTag} <X className="w-3 h-3" />
              </button>
            )}
            {allTags.map((tag) => (
              tag !== activeTag && (
                <button
                  key={tag}
                  onClick={() => updateActiveTag(tag)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 transition-colors shrink-0"
                >
                  #{tag}
                </button>
              )
            ))}
          </div>
        )}
      </div>

      {/* Select All Row */}
      {processedMemories.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-2">
          <button 
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
          >
            {selectedIds.length === processedMemories.length && processedMemories.length > 0 
              ? <CheckSquare className="w-5 h-5 text-emerald-500" /> 
              : <Square className="w-5 h-5" />
            }
            Select All
          </button>
          <span className="text-sm text-slate-400">
            Showing {processedMemories.length} results
          </span>
        </div>
      )}

      {/* Content Rendering */}
      {isSemanticSearchActive && searchStatus === 'loading' ? (
        <div className="text-center py-24 px-4 flex flex-col items-center max-w-md mx-auto">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Searching your brain...</p>
        </div>
      ) : isSemanticSearchActive && searchStatus === 'idle' ? (
        <div className="text-center py-24 px-4 flex flex-col items-center max-w-md mx-auto">
          <Sparkles className="w-8 h-8 text-emerald-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">AI Search Ready</h3>
          <p className="text-slate-500">Type a question and hit Enter to find semantic matches.</p>
        </div>
      ) : isSemanticSearchActive && searchStatus === 'succeeded' && processedMemories.length === 0 ? (
        <div className="text-center py-24 px-4 flex flex-col items-center max-w-md mx-auto">
          <Sparkles className="w-8 h-8 text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No semantic matches found</h3>
          <p className="text-slate-500">Try rephrasing your question or using different keywords.</p>
        </div>
      ) : processedMemories.length === 0 ? (
        <div className="text-center py-24 px-4">
          <p className="text-slate-500">No memories match your filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {processedMemories.map((memory) => {
            const memoryId = memory.id || memory._id;
            return (
              <MemoryCard 
                key={memoryId} 
                memory={memory} 
                selectable={true}
                isSelected={selectedIds.includes(memoryId)}
                onToggleSelect={toggleSelect}
              />
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="p-4 w-12"></th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Added</th>
                <th className="p-4 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedMemories.map(memory => {
                const id = memory.id || memory._id;
                const isSelected = selectedIds.includes(id);
                const isYoutube = memory.sourceType === 'youtube' || (memory.url && memory.url.includes('youtube.com'));
                
                return (
                  <tr 
                    key={id} 
                    onClick={() => openMemoryModal(memory)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/50' : ''}`}
                  >
                    <td className="p-4" onClick={e => { e.stopPropagation(); toggleSelect(id); }}>
                      <button className="text-slate-400 hover:text-emerald-500 transition-colors">
                        {isSelected ? <CheckSquare className="w-5 h-5 text-emerald-500" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="p-4 font-medium text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                      {memory.title || 'Untitled'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        {isYoutube ? <Youtube className="w-3.5 h-3.5 text-rose-500" /> : <FileText className="w-3.5 h-3.5 text-blue-500" />}
                        <span className="capitalize">{memory.sourceType || 'Web'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(memory.tags || []).slice(0, 2).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] rounded-full">#{t}</span>
                        ))}
                        {(memory.tags || []).length > 2 && <span className="text-[10px] text-slate-400">+{memory.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {memory.createdAt ? new Date(memory.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                        <button onClick={(e) => handleAskAI(e, memory)} className="p-1.5 text-slate-400 hover:text-emerald-500" title="Ask AI"><Sparkles className="w-4 h-4" /></button>
                        <button onClick={(e) => handleViewInGraph(e, id)} className="p-1.5 text-slate-400 hover:text-indigo-500" title="View in Graph"><Network className="w-4 h-4" /></button>
                        <button onClick={(e) => handleDeleteSingle(e, id)} className="p-1.5 text-slate-400 hover:text-rose-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-2xl shadow-2xl transition-all duration-300 ${selectedIds.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="px-4 border-r border-slate-200">
          <span className="font-bold text-emerald-600">{selectedIds.length}</span>
          <span className="text-slate-500 text-sm ml-2">Selected</span>
        </div>
        
        <button
          onClick={() => exportAsMarkdown(selectedIds)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" /> Export as Markdown
        </button>

        <button
          onClick={handleBulkDelete}
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-semibold transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete All
        </button>
      </div>

    </div>
  );
};
