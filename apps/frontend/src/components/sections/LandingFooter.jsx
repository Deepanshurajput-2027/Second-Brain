import React from "react";
import { Link } from "react-router-dom";
import { Brain, Heart, Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                Second Brain
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              The next-generation personal knowledge management hub. Connect your notes, documents, and web links in a living 3D knowledge graph with conversational AI retrieval.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full w-fit border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational &bull; Vector Engine v2.4</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-emerald-600 transition-colors">
                  AI Semantic Search
                </a>
              </li>
              <li>
                <Link to="/graph" className="hover:text-emerald-600 transition-colors">
                  3D Force Graph
                </Link>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-emerald-600 transition-colors">
                  Automated Pipeline
                </a>
              </li>
              <li>
                <Link to="/library" className="hover:text-emerald-600 transition-colors">
                  Memory Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Auth */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Get Started
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="hover:text-emerald-600 font-medium text-emerald-600 transition-colors">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-600 transition-colors">
                  Sign In to Brain
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-emerald-600 transition-colors">
                  Reset Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Second Brain Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
