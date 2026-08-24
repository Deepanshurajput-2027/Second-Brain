import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageSquare, X, Send, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatWindow = () => {
  const { messages, isLoading, isChatOpen, draftQuery, toggleChat, sendMessage, clearDraftQuery } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Pre-fill input from draftQuery if available
  useEffect(() => {
    if (draftQuery) {
      setInput(draftQuery);
      clearDraftQuery();
    }
  }, [draftQuery, clearDraftQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  // Chat toggle button (when closed)
  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/30 transition-transform transform hover:-translate-y-1 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-10 right-0 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ask your Second Brain
        </span>
      </button>
    );
  }

  // Active Chat Window
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-slate-200/60 dark:border-gray-700/60 shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/50 dark:bg-gray-800/50 border-b border-slate-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center transition-colors">
            <BrainCircuit className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-gray-100 tracking-tight leading-none transition-colors">Second Brain AI</h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500 flex items-center gap-1 mt-1 transition-colors">
              <Sparkles className="w-3 h-3" /> Online
            </span>
          </div>
        </div>
        <button
          onClick={toggleChat}
          className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar hide-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 transition-opacity">
            <MessageSquare className="w-12 h-12 text-slate-400 dark:text-gray-500" />
            <p className="text-sm font-medium text-slate-500 dark:text-gray-400 max-w-[200px]">
              Ask a question to search and synthesize your saved memories.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-colors ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200 border border-slate-200/60 dark:border-gray-600/60 rounded-bl-none'
                }`}
              >
                {msg.role === 'ai' ? (
                  <div className="prose prose-sm prose-emerald dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 border border-slate-200/60 dark:border-gray-600/60 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-2 text-slate-400 dark:text-gray-400 transition-colors">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span className="text-xs font-medium animate-pulse">Synthesizing memories...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-gray-800/50 border-t border-slate-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-colors">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask your Second Brain..."
            className="w-full pl-5 pr-14 py-3.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-gray-100 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-gray-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-gray-600 text-white disabled:text-slate-400 dark:disabled:text-gray-400 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
