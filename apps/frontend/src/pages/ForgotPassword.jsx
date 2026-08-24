import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const cardRef = useRef(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, loading } = useAuth();

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
  }, [isSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await forgotPassword(email.trim());
      setIsSubmitted(true);
      toast.success('Reset link dispatched if account exists');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : error?.message || 'Failed to send reset link');
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
              <KeyRound className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isSubmitted ? 'Check your inbox' : 'Forgot password?'}
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              {isSubmitted
                ? `We've sent a password reset link to ${email}`
                : "No worries, we'll send you reset instructions"}
            </p>
          </div>

          {/* Glassmorphism Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-xl p-8">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-slate-800"
                    />
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
                      Sending reset link...
                    </span>
                  ) : (
                    <>
                      Send Reset Instructions
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
                  If an account exists with <span className="font-semibold text-slate-800">{email}</span>, you will receive an email with instructions to reset your password within a few minutes.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Didn&apos;t receive an email? Click to resend
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
