import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  const containerRef = useRef();
  const navigate = useNavigate();

  useGSAP(() => {
    gsap.from('.hero-element', {
      y: 30,
      opacity: 0,
      stagger: 0.2,
      ease: 'power3.out',
      duration: 1,
      delay: 0.1
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 w-full overflow-hidden">
      {/* Badge */}
      <div className="hero-element inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 mb-8 shadow-sm">
        <Sparkles className="w-4 h-4 mr-2" />
        <span className="text-sm font-semibold tracking-wide uppercase">Now with AI Summarization</span>
      </div>

      {/* Headline */}
      <h1 className="hero-element text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl">
        Your Second Brain, <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
          Organized by AI
        </span>
      </h1>

      {/* Sub-headline */}
      <p className="hero-element text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        Save articles, videos, and documents instantly. Our AI automatically summarizes, tags, and connects your knowledge so you can focus on learning.
      </p>

      {/* Buttons */}
      <div className="hero-element flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <button 
          onClick={() => navigate('/register')}
          className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-1 group flex items-center justify-center"
        >
          Start for free
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => {
            const features = document.getElementById('features');
            if (features) features.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-xl font-bold text-lg shadow-sm transition-all hover:bg-slate-50"
        >
          See how it works
        </button>
      </div>
    </section>
  );
};
