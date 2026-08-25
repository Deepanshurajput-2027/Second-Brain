import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Search, Network, Hash, Youtube } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const FeaturesBentoGrid = () => {
  const containerRef = useRef();

  useGSAP(() => {
    gsap.from('.bento-card', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }, { scope: containerRef });

  return (
    <section id="features" ref={containerRef} className="py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Everything you need to learn faster</h2>
        <p className="text-slate-500 mt-4 text-lg">Powerful features wrapped in a delightfully simple interface.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: AI Search (Spans 2 cols) */}
        <div className="bento-card md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
              <Search className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">AI Smart Search</h3>
            <p className="text-slate-500 text-lg max-w-md">Don't remember the exact keywords? Just ask your Second Brain a question naturally, and our AI will find the exact memories containing the answers you need.</p>
          </div>
        </div>

        {/* Card 2: Visual Graph */}
        <div className="bento-card bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:border-emerald-100 group-hover:bg-emerald-50 transition-colors">
            <Network className="w-7 h-7 text-slate-600 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Knowledge Graph</h3>
          <p className="text-slate-500">Visualize how your ideas connect in a stunning 3D graph view. Discover hidden relationships between your saved articles and notes.</p>
        </div>

        {/* Card 3: Auto-Tagging */}
        <div className="bento-card bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:border-emerald-100 group-hover:bg-emerald-50 transition-colors">
            <Hash className="w-7 h-7 text-slate-600 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Auto-Tagging</h3>
          <p className="text-slate-500">Never manually sort folders again. AI automatically extracts key topics and applies semantic tags the moment you save a link.</p>
        </div>

        {/* Card 4: YouTube Summaries (Spans 2 cols) */}
        <div className="bento-card md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
           <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
                <Youtube className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Instant YouTube Summaries</h3>
              <p className="text-slate-500 text-lg">Just paste a YouTube URL. Our AI fetches the transcript, summarizes the key takeaways, and saves the structured knowledge directly to your library.</p>
            </div>
            <div className="w-full md:w-48 flex-shrink-0 flex items-center justify-center">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner w-full">
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                   <div className="h-2 bg-slate-200 rounded w-24"></div>
                 </div>
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                   <div className="h-2 bg-slate-200 rounded w-16"></div>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                   <div className="h-2 bg-slate-200 rounded w-20"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
