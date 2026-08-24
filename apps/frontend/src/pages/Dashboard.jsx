import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Zap, CheckCircle2 } from 'lucide-react';
import { useMemories } from '../hooks/useMemories';
import { useIngestion } from '../hooks/useIngestion';
import { MemoryCard } from '../components/MemoryCard';
import { MemoryModal } from '../components/MemoryModal';

const Dashboard = () => {
  const gridRef = useRef(null);
  const { filteredMemories, status, loadMemories } = useMemories();
  
  const [urlInput, setUrlInput] = useState('');
  const { handleIngest, isLoading, error } = useIngestion();

  // Fetch memories on mount
  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  // GSAP Stagger animation for memory cards
  useEffect(() => {
    if (filteredMemories && filteredMemories.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".memory-card",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)" }
        );
      }, gridRef);

      return () => ctx.revert();
    }
  }, [filteredMemories]);

  const handleIngestSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    
    await handleIngest(urlInput);
    // Note: To conditionally clear input on success, we could return a success flag from handleIngest.
    // For now, we clear it here.
    setUrlInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 font-sans relative transition-colors">
      <MemoryModal />
      {/* Ingestion UI - Glassmorphism Form */}
      <div className="mb-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-gray-700/60 shadow-sm p-6 relative overflow-hidden mt-6 transition-colors">
        {/* Decorative Background Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
        
        <form onSubmit={handleIngestSubmit} className="flex flex-col md:flex-row items-center gap-4 relative z-10">
          <div className="flex-1 w-full relative group">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isLoading}
              placeholder="Paste a YouTube URL or Web article to ingest to Gemini..."
              className="block w-full pl-4 pr-4 py-3.5 border border-slate-200 dark:border-gray-600 rounded-xl leading-5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !urlInput.trim()}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 min-w-[160px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <Zap size={20} className="fill-white/20" />
                <span>Ingest to AI</span>
              </>
            )}
          </button>
        </form>
        
        {/* Error State */}
        {error && (
          <div className="mt-4 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm transition-opacity duration-300">
            <strong>Ingestion failed:</strong> {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">Recent Memories</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-colors">
          <span>Sort by:</span>
          <span className="font-semibold text-slate-900 dark:text-gray-200">Relevance</span>
        </div>
      </div>

      {status === 'loading' && (!filteredMemories || filteredMemories.length === 0) && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {status === 'succeeded' && (!filteredMemories || filteredMemories.length === 0) && (
        <div className="text-center py-20 text-slate-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-slate-200 dark:border-gray-700 border-dashed transition-colors">
          No memories match your search, or you haven't ingested any yet.
        </div>
      )}

      <div 
        ref={gridRef}
        className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
      >
        {(filteredMemories || []).map((memory) => (
          <div key={memory.id || memory._id} className="memory-card break-inside-avoid">
            <MemoryCard memory={memory} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
