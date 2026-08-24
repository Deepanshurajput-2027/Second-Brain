import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, ArrowRight, Menu, X, Sparkles, Network } from "lucide-react";

export const LandingNavbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                Second Brain
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mt-0.5">
                AI Knowledge Hub
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#pipeline" className="hover:text-emerald-600 transition-colors">
              AI Pipeline
            </a>
            <Link to="/graph" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <Network className="w-4 h-4 text-emerald-500" />
              <span>3D Graph</span>
            </Link>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">
              Pricing
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="neumorphic-button inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setIsMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Features
          </a>
          <a
            href="#pipeline"
            onClick={() => setIsMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            AI Pipeline
          </a>
          <Link
            to="/graph"
            onClick={() => setIsMobileOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            3D Graph View
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl shadow-md"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
