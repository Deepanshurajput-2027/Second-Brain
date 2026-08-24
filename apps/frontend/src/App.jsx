import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useMemories } from './hooks/useMemories';
import { MemoryInput } from './components/MemoryInput';
import { MemoryGrid } from './components/MemoryGrid';
import { FilterBar } from './components/FilterBar';
import { Navbar } from './components/Navbar';
import { MemoryModal } from './components/MemoryModal';
import { ChatWindow } from './components/ChatWindow';
import { useToast } from './components/ToastProvider';
import { UploadCloud } from 'lucide-react';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { Settings } from './pages/Settings';
import { LibraryView } from './pages/LibraryView';
import { Collections } from './pages/Collections';
import { CollectionDetail } from './pages/CollectionDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';

function App() {
  const { loadMemories, uploadMemory } = useMemories();
  const { isAuthenticated } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadMemories();
    }
  }, [loadMemories, isAuthenticated]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      
      try {
        toast.success('Processing dropped document...');
        await uploadMemory(file);
        toast.success('File processed and saved successfully!');
      } catch (error) {
        console.error('Drop upload failed:', error);
        toast.error('Failed to process dropped file');
      }
    }
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div 
        className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative transition-colors duration-300"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <MemoryModal />
        <ChatWindow />
        
        {/* Global Drag-and-Drop Overlay */}
        {isDragging && (
          <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center">
            <div className="flex flex-col items-center justify-center w-3/4 max-w-2xl h-96 border-4 border-dashed border-emerald-500/50 bg-emerald-50/50 rounded-3xl pointer-events-none">
              <UploadCloud className="w-24 h-24 text-emerald-500 mb-6 animate-bounce" />
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                Drop file to ingest into Second Brain
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Supports PDF, Image, and Text formats.</p>
            </div>
          </div>
        )}

        <Navbar />

      {/* Main Content */}
      <main className="w-full flex flex-1">
        
        <Routes>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <div className="flex-1 w-full min-w-0">
                <div className="mb-16 text-center lg:text-left pl-0 lg:pl-4">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4 transition-colors">
                    Expand your mind.
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 transition-colors">
                    Save articles and videos instantly. We use AI to summarize, tag, and organize everything so you can focus on learning.
                  </p>
                </div>

                <div className="pl-0 lg:pl-4">
                  <MemoryInput />
                </div>
                
                <div className="mt-16 pl-0 lg:pl-4">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Your Library</h2>
                  </div>
                  <FilterBar />
                  <MemoryGrid />
                </div>
              </div>
            } />
            
            <Route path="/library" element={<LibraryView />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:id" element={<CollectionDetail />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Guest Only Routes */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Routes>
      </main>
      
      {/* Footer */}
      <footer className="mt-24 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Second Brain SaaS. All rights reserved.
        </div>
      </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
