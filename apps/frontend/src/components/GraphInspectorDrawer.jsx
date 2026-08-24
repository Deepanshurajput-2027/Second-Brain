import React from 'react';
import { X, Sparkles, Calendar, Tag, ExternalLink, Hash, BookOpen } from 'lucide-react';
import { useChat } from '../hooks/useChat';

export const GraphInspectorDrawer = ({ node, onClose }) => {
  const { setDraftQuery, toggleChat, isChatOpen } = useChat();

  if (!node) return null;

  const memory = node.originalMemory;
  const isMemoryNode = node.type === 'memory' && memory;
  const isTagNode = node.type === 'tag';

  const handleAskAI = () => {
    let draft = '';
    if (isMemoryNode) {
      draft = `Context: ${memory.title || 'Untitled Memory'}\nSummary: ${memory.summary || ''}\n\nMy Question: `;
    } else if (isTagNode) {
      draft = `Tell me more about the topics and memories grouped under #${node.name?.replace('#', '')}: `;
    } else {
      draft = `Context: ${node.name}\n\nMy Question: `;
    }

    setDraftQuery(draft);
    if (!isChatOpen) {
      toggleChat();
    }
  };

  return (
    <aside 
      aria-label="Node Inspector"
      className={`absolute top-0 right-0 bottom-0 w-84 sm:w-96 bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-2xl transition-all duration-300 ease-in-out z-20 flex flex-col ${
        node ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isMemoryNode 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {isMemoryNode ? (
                <>
                  <BookOpen className="w-3 h-3" /> Memory
                </>
              ) : (
                <>
                  <Hash className="w-3 h-3" /> Tag Cluster
                </>
              )}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 leading-snug line-clamp-2">
            {isMemoryNode ? (memory.title || 'Untitled Memory') : node.name}
          </h2>
        </div>

        <button 
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Close Inspector"
          aria-label="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Memory Content/Summary */}
        {isMemoryNode && (
          <>
            {memory.summary ? (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Summary</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                  {memory.summary}
                </div>
              </div>
            ) : null}

            {/* Tags */}
            {memory.tags && memory.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {memory.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 gap-3 pt-2 text-xs text-slate-500">
              {memory.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Created on {new Date(memory.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                </div>
              )}
              {memory.url && (
                <a 
                  href={memory.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:underline truncate"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{memory.url}</span>
                </a>
              )}
            </div>
          </>
        )}

        {/* Tag Node Info */}
        {isTagNode && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tag Details</h3>
            <p className="text-sm text-slate-600">
              This node represents the tag <strong className="text-emerald-700">{node.name}</strong>. All connecting lines point to memories tagged with this keyword.
            </p>
          </div>
        )}
      </div>

      {/* Footer / AI CTA */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleAskAI}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI about this</span>
        </button>
      </div>
    </aside>
  );
};
