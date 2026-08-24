import React, { useMemo } from 'react';
import { useMemories } from '../hooks/useMemories';
import { useToast } from './ToastProvider';
import { Search, X, Sparkles, Loader2 } from 'lucide-react';

export const FilterBar = () => {
  const { 
    memories, 
    searchQuery, 
    updateSearchQuery, 
    activeTag, 
    updateActiveTag,
    isSemanticSearchActive,
    toggleSemanticSearch,
    performSemanticSearch,
    loadMemories,
    isLoading
  } = useMemories();
  
  const toast = useToast();

  // Extract unique tags from all memories
  const allTags = useMemo(() => {
    const tags = new Set();
    memories.forEach(memory => {
      if (memory.tags) {
        memory.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [memories]);

  if (memories.length === 0 && !searchQuery) return null;

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (isSemanticSearchActive) {
      if (!searchQuery.trim()) {
        loadMemories(); // reset to all if query is empty
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
    if (!newValue) {
      loadMemories(); // reload standard local list when switching off AI
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto mb-8 space-y-4">
      {/* Search Input Row */}
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
            className={`block w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-800/80 backdrop-blur-md border rounded-xl text-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm ${
              isSemanticSearchActive ? 'border-emerald-300 dark:border-emerald-500/50 ring-1 ring-emerald-50 dark:ring-emerald-900/30' : 'border-slate-200/80 dark:border-gray-700/80'
            }`}
          />
          {searchQuery && !isSemanticSearchActive && (
            <button
              type="button"
              onClick={() => updateSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <button
          onClick={handleToggleMode}
          className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm border ${
            isSemanticSearchActive 
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' 
              : 'bg-white/80 dark:bg-gray-800/80 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700/50 hover:text-emerald-600 dark:hover:text-emerald-400'
          }`}
          title="Toggle AI Semantic Search"
        >
          <Sparkles className={`w-4 h-4 mr-2 ${isSemanticSearchActive ? 'text-emerald-500' : 'text-slate-400'}`} />
          AI Search {isSemanticSearchActive ? 'On' : 'Off'}
        </button>
      </div>

      {/* Tags Scroll Row */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wider mr-1 shrink-0 transition-colors">Tags:</span>
          {activeTag && (
            <button
              onClick={() => updateActiveTag(null)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 dark:bg-gray-700 text-white border border-slate-800 dark:border-gray-700 transition-colors shrink-0 gap-1"
            >
              #{activeTag}
              <X className="w-3 h-3" />
            </button>
          )}
          {allTags.map((tag) => (
            tag !== activeTag && (
              <button
                key={tag}
                onClick={() => updateActiveTag(tag)}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:border-emerald-200 dark:hover:border-emerald-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shrink-0"
              >
                #{tag}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};
