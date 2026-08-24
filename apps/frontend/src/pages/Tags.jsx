import React from 'react';
import useMemories from '../hooks/useMemories';
import MemoryCard from '../components/MemoryCard';
import { Hash } from 'lucide-react';

const Tags = () => {
  const { memories } = useMemories();

  // Extract all unique tags from memories
  const allTags = Array.from(new Set((memories || []).flatMap(m => m.tags || []))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Hash className="text-emerald-500" size={24} />
          Knowledge Tags
        </h1>
        <p className="text-slate-500 mt-2">Filter and explore your second brain by semantic topics.</p>
      </div>

      {/* Interactive Tag Pills */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-10">
        <div className="flex flex-wrap gap-3">
          {allTags.map(tag => (
            <button
              key={tag}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-emerald-50 text-emerald-700 border border-emerald-100/50 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/20 transform hover:-translate-y-0.5"
            >
              #{tag}
            </button>
          ))}
          {allTags.length === 0 && (
            <span className="text-slate-400 italic text-sm">No tags discovered yet.</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Filtered Memories</h2>
        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
          All Tags Selected
        </span>
      </div>

      {/* Mock Masonry Layout for filtered memories */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        {(memories || []).map((memory) => (
          <MemoryCard key={memory.id} data={memory} />
        ))}
      </div>
    </div>
  );
};

export default Tags;
