import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Brain, Sun, Moon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from './ThemeProvider';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors">
      <Link to="/" className="flex items-center space-x-3 cursor-pointer">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
          Second Brain
        </span>
      </Link>
      
      <nav className="flex items-center space-x-6">
        {isAuthenticated ? (
          <div className="hidden md:flex items-center space-x-8 mr-4">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors pb-1 ${isActive ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500'}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/collections" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors pb-1 ${isActive ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500'}`
              }
            >
              Collections
            </NavLink>
            <NavLink 
              to="/library" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors pb-1 ${isActive ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500'}`
              }
            >
              Library
            </NavLink>
            <NavLink 
              to="/graph" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors pb-1 ${isActive ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500'}`
              }
            >
              Graph
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors pb-1 ${isActive ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500'}`
              }
            >
              Settings
            </NavLink>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-4"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4 mr-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors px-4 py-2"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Register
            </button>
          </div>
        )}

      </nav>
    </header>
  );
};
