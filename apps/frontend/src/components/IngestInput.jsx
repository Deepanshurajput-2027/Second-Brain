import { useState, useRef } from 'react';
import { useMemories } from '../hooks/useMemories';
import { useToast } from './ToastProvider';
import { Link2, Loader2, Plus, Paperclip, X, File } from 'lucide-react';

export const IngestInput = () => {
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const { addNewMemory, uploadMemory, isIngesting } = useMemories();
  const toast = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setUrl(''); // Clear URL if file is selected
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // PHASE 2: Upload File
    if (selectedFile) {
      try {
        await uploadMemory(selectedFile);
        toast.success('File processed and saved successfully!');
        clearFile();
      } catch (error) {
        console.error('Failed to upload file:', error);
        toast.error(typeof error === 'string' ? error : (error?.message || error?.errorDetails || 'Failed to process file with AI'));
      }
      return;
    }

    if (!url.trim()) return;

    try {
      await addNewMemory(url);
      setUrl('');
      toast.success('Memory saved successfully!');
    } catch (error) {
      console.error('Failed to ingest memory:', error);
      toast.error(typeof error === 'string' ? error : (error?.message || error?.errorDetails || 'Failed to extract content from link'));
    }
  };

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
          <div className="flex-1 flex items-center bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl py-4 pl-4 pr-32 transition-all shadow-sm">
            <File className="h-5 w-5 text-emerald-600 dark:text-emerald-500 mr-3 shrink-0" />
            <span className="text-emerald-800 dark:text-emerald-400 font-medium truncate transition-colors">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={clearFile}
              className="ml-2 p-1 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // URL Input State
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Link2 className="h-5 w-5 text-slate-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isIngesting}
              placeholder="Paste a YouTube or article URL..."
              className="block w-full pl-12 pr-44 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-slate-200/80 dark:border-gray-700/80 rounded-2xl text-slate-800 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              required={!selectedFile}
            />
          </div>
        )}

        <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
          {/* Paperclip Upload Button */}
          {!selectedFile && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isIngesting}
              className="p-2 text-slate-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload File"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isIngesting || (!url.trim() && !selectedFile)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isIngesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {selectedFile ? 'Processing Document...' : 'Saving...'}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {selectedFile ? 'Upload File' : 'Save Memory'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
