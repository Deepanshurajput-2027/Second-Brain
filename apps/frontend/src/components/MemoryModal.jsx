import React, { useState, useEffect } from 'react';
import { useMemories } from '../hooks/useMemories';
import { useToast } from './ToastProvider';
import { extractYouTubeId } from '../utils/urlUtils';
import { X, Save, ExternalLink } from 'lucide-react';

export const MemoryModal = () => {
  const { activeMemory, closeMemoryModal, updateMemory } = useMemories();
  const toast = useToast();
  
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeMemory) {
      setTitle(activeMemory.title || '');
      setTagsInput(activeMemory.tags ? activeMemory.tags.join(', ') : '');
      setSummary(activeMemory.summary || '');
    }
  }, [activeMemory]);

  if (!activeMemory) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const tagsArray = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '');
      
      await updateMemory(activeMemory.id || activeMemory._id, {
        title: title.trim(),
        summary: summary.trim(),
        tags: tagsArray
      });
      
      toast.success('Memory updated successfully!');
      closeMemoryModal();
    } catch (error) {
      toast.error(error.message || 'Failed to update memory.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeMemoryModal();
    }
  };

  const isYouTube = activeMemory.sourceType === 'youtube' || (activeMemory.url && activeMemory.url.includes('youtube.com'));
  const youtubeId = isYouTube ? extractYouTubeId(activeMemory.url) : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/20 dark:bg-slate-900/60 transition-opacity"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-700 transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100 transition-colors">Memory Details</h2>
          <button 
            onClick={closeMemoryModal}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* YouTube Video Embed */}
          {youtubeId && (
            <div className="w-full aspect-video rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm mb-6 overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Title Edit */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1.5 transition-colors">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-800 dark:text-gray-100 transition-all"
            />
          </div>

          {/* Tags Edit */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1.5 transition-colors">Tags (comma separated)</label>
            <input 
              type="text" 
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. react, tutorial, design"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-800 dark:text-gray-100 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Editable Summary */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1.5 transition-colors">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-800 dark:text-gray-100 transition-all resize-y"
            />
          </div>

          {/* Original Source Link */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1.5 transition-colors">Source URL</label>
            <a 
              href={activeMemory.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors group"
            >
              <ExternalLink className="w-4 h-4 mr-1.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              <span className="truncate max-w-sm">{activeMemory.url}</span>
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 flex justify-end gap-3 transition-colors">
          <button
            onClick={closeMemoryModal}
            className="px-5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-5 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
