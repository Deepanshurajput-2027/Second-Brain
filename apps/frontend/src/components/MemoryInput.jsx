import React from 'react';
import { useMemoryIngester } from '../hooks/useMemoryIngester';
import { Link2, Loader2, Plus, Paperclip, X, File } from 'lucide-react';

export const MemoryInput = () => {
  const { 
    url, 
    setUrl, 
    selectedFile, 
    handleFileChange, 
    clearFile, 
    fileInputRef, 
    isIngesting, 
    handleSubmit 
  } = useMemoryIngester();

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <form onSubmit={handleSubmit} className="relative group flex items-center">
        
        {/* Hidden File Input */}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.txt,.png,.jpg,.jpeg"
        />

        {selectedFile ? (
          // File Selected State
          <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border border-emerald-500/50 rounded-2xl py-4 pl-4 pr-32 transition-all shadow-md">
            <File className="h-6 w-6 text-emerald-500 mr-3 shrink-0" />
            <span className="text-slate-900 dark:text-gray-100 font-medium truncate transition-colors text-lg">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={clearFile}
              className="ml-2 p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Link2 className="h-6 w-6 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isIngesting}
              placeholder="Paste a YouTube or article URL..."
              className="block w-full pl-14 pr-48 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              required={!selectedFile}
            />
          </div>
        )}

        <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
          {!selectedFile && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isIngesting}
              className="p-3 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload File"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isIngesting || (!url.trim() && !selectedFile)}
            className="inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isIngesting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {selectedFile ? 'Uploading...' : 'AI is analyzing...'}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                {selectedFile ? 'Upload File' : 'Save Memory'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
