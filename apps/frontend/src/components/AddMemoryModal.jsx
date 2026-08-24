import React from 'react';
import { X, Check, Loader2, Link2 } from 'lucide-react';

export const AddMemoryModal = ({ 
  isOpen, 
  onClose, 
  availableMemories, 
  selectedIds, 
  onToggleSelection, 
  onSave, 
  isSaving 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">Add Memories</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
              Select memories from your library to add to this collection.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
          {availableMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 dark:text-gray-400">
              <Link2 className="w-12 h-12 mb-4 opacity-50" />
              <p>No available memories to add.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableMemories.map(memory => {
                const id = memory.id || memory._id;
                const isSelected = selectedIds.has(id);
                return (
                  <div 
                    key={id}
                    onClick={() => onToggleSelection(id)}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col gap-2
                      ${isSelected 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-800 dark:text-gray-100 line-clamp-1 pr-6">{memory.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-2">{memory.summary || memory.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
          <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={selectedIds.size === 0 || isSaving}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save to Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
