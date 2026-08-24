import { useMemories } from '../hooks/useMemories';
import { MemoryCard } from './MemoryCard';
import { Database, Sparkles, Loader2 } from 'lucide-react';

export const MemoryGrid = () => {
  const { filteredMemories: memories, isLoading, error, status, isSemanticSearchActive, searchStatus } = useMemories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/50 border border-slate-100 rounded-2xl p-6 h-64 animate-pulse flex flex-col">
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-4"></div>
            </div>
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2 flex-grow">
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              <div className="h-3 bg-slate-200 rounded w-4/6"></div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-slate-200 rounded-full w-16"></div>
              <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Only show the giant pink error block if the actual FETCH failed
  if (error && status === 'failed') {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-rose-50 border border-rose-100 max-w-2xl mx-auto">
        <p className="text-rose-600 font-medium mb-1">Failed to load memories</p>
        <p className="text-rose-500 text-sm">{typeof error === 'string' ? error : error.message || 'Unknown error'}</p>
      </div>
    );
  }

  // AI Search States
  if (isSemanticSearchActive) {
    if (searchStatus === 'loading') {
      return (
        <div className="text-center py-24 px-4 flex flex-col items-center max-w-md mx-auto">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Searching your brain...</p>
        </div>
      );
    }
    
    if (searchStatus === 'idle') {
      return (
        <div className="text-center py-24 px-4 flex flex-col items-center max-w-md mx-auto">
          <Sparkles className="w-8 h-8 text-emerald-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">AI Search Ready</h3>
          <p className="text-slate-500">Type a question and hit Enter to find semantic matches.</p>
        </div>
      );
    }

    if (searchStatus === 'succeeded' && (!memories || memories.length === 0)) {
      return (
        <div className="text-center py-24 px-4 flex flex-col items-center max-w-md mx-auto">
          <Sparkles className="w-8 h-8 text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No semantic matches found</h3>
          <p className="text-slate-500">Try rephrasing your question or using different keywords.</p>
        </div>
      );
    }
  }

  if (!memories || memories.length === 0) {
    return (
      <div className="text-center py-24 px-4 flex flex-col items-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Database className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Your second brain is empty</h3>
        <p className="text-slate-500 leading-relaxed">
          Start building your knowledge base by pasting a YouTube or article URL above. We'll automatically summarize and tag it for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {memories.map((memory) => (
        <MemoryCard key={memory.id || memory._id || Math.random()} memory={memory} />
      ))}
    </div>
  );
};
