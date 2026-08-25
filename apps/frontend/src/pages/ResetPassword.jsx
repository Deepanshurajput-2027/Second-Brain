import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const cardRef = useRef(null);
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // GSAP entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    });
    return () => ctx.revert();
  }, [isSuccess]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Reset token is missing from the URL.');
      toast.error('Missing reset token');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      toast.error('Password too short');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      toast.error('Passwords do not match');
      return;
    }

    try {
      await resetPassword(token, formData.password);
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      const msg = typeof error === 'string' ? error : error?.message || 'Failed to reset password';
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-100/50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-slate-200/50 blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md z-10" ref={cardRef}>
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/30 mb-4">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isSuccess ? 'Password Reset Complete' : 'Set New Password'}
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              {isSuccess
                ? 'Your password has been successfully updated'
                : 'Please choose a strong password for your account'}
            </p>
          </div>

          {/* Glassmorphism Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-xl p-8">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle size={18} className="shrink-0 text-red-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 ml-1">Must be at least 8 characters</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating Password...
                    </span>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your password has been changed. You can now use your new password to sign into your account.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/40 transform hover:-translate-y-0.5"
                >
                  Sign In Now
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
