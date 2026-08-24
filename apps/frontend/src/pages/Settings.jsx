import { useState, useEffect } from 'react';
import { User, Palette, LogOut, Save } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/slices/themeSlice';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const themeMode = useSelector((state) => state.theme?.mode || 'light');
  const { user, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ fullName: formData.fullName });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call the API to clear backend cookies (handled by thunk)
      await logout();
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      // Strictly clear all local storage
      localStorage.clear();
      // Hard browser reload to the root landing page
      window.location.href = '/';
    }
  };

  return (
    <div className="flex-1 w-full min-w-0 space-y-8 pl-0 lg:pl-4 transition-colors font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Settings</h2>
          <p className="text-lg text-slate-600">Manage your profile and application preferences.</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-white text-rose-500 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">User Profile</h3>
            <p className="text-sm text-slate-500">Update your personal information</p>
          </div>
        </div>
        
        <form onSubmit={handleProfileSubmit} className="max-w-xl space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleProfileChange}
              placeholder="Your full name"
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Email Address (Read Only)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="block w-full px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 ml-1 mt-1">Email addresses cannot be changed currently.</p>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#10B981] hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/40 disabled:opacity-70 disabled:transform-none"
            >
              {isSaving ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Save size={18} />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Palette className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Preferences</h3>
            <p className="text-sm text-slate-500">Customize your application experience</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 ml-1 mb-3">Active Theme</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => dispatch(setTheme('light'))}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border transition-all ${themeMode === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm' : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${themeMode === 'light' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              Light (Emerald)
            </button>
            <button 
              onClick={() => dispatch(setTheme('dark'))}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border transition-all ${themeMode === 'dark' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/50' : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800'}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${themeMode === 'dark' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-gray-600'}`}></span>
              Dark (Midnight)
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-400 max-w-md ml-1 transition-colors">
            Choose your preferred aesthetic.
          </p>
        </div>
      </div>
    </div>
  );
};
