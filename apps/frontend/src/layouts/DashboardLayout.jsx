import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { Search, Plus, Home, Hash, Settings, Network } from 'lucide-react';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      {/* Sidebar - Glassmorphism style */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex flex-col z-20">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            Second Brain
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-2">
          <NavItem to="/dashboard" end icon={<Home size={20} />} label="All Memories" />
          <NavItem to="/dashboard/tags" icon={<Hash size={20} />} label="Tags" />
          <NavItem to="/dashboard/graph" icon={<Network size={20} />} label="Knowledge Graph" />
          <NavItem to="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-200/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">System Status</div>
          <div className="px-2 py-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-700">AI Worker Idle</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Sticky Header with Frosted Glass */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
          {/* Global Semantic Search */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Ask your second brain..."
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white/50 dark:bg-slate-800/50 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Add Knowledge Action */}
          <div className="ml-4 flex items-center md:ml-6">
            <button className="flex items-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5">
              <Plus size={20} />
              <span>Add Knowledge</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto pt-6 px-4 pb-8 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Reusable Navigation Item Component using NavLink for dynamic active state
const NavItem = ({ to, icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/50 shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className={`mr-3 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
          {icon}
        </div>
        {label}
      </>
    )}
  </NavLink>
);

export default DashboardLayout;
