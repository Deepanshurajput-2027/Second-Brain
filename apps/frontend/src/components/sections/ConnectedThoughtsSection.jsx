import React, { useRef } from "react";
import { motion } from "framer-motion";
import { AnimatedBeam } from "../ui/animated-beam";
import { 
  FileText, 
  Globe, 
  BookOpen, 
  Video, 
  Sparkles, 
  Network, 
  MessageSquare, 
  Tags,
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export const ConnectedThoughtsSection = () => {
  const containerRef = useRef(null);
  const div1Ref = useRef(null); // Docs
  const div2Ref = useRef(null); // Web links
  const div3Ref = useRef(null); // Notes
  const div4Ref = useRef(null); // Video/Audio
  const centerRef = useRef(null); // Second Brain Core
  const div5Ref = useRef(null); // 3D Graph
  const div6Ref = useRef(null); // AI Chat
  const div7Ref = useRef(null); // Auto Tags

  return (
    <section className="relative w-full py-24 bg-slate-50/70 border-y border-slate-200/60 overflow-hidden">
      {/* Background Accent */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full" />

      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>UNIFIED INTELLIGENCE PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Connect Your Thoughts in <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Real Time</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Ingest unstructured knowledge from your daily tools. Second Brain extracts semantic entities, clusters related topics, and weaves them into an interactive 3D web.
          </p>
        </div>

        {/* Animated Beam Interactive Container */}
        <div 
          ref={containerRef} 
          className="relative flex h-[520px] w-full items-center justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-12 shadow-xl shadow-slate-200/50"
        >
          {/* Left Column: Data Ingestion Sources */}
          <div className="flex flex-col justify-between h-full z-10 gap-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 hidden sm:block">
              Inputs
            </div>
            
            {/* Input 1: Docs */}
            <div 
              ref={div1Ref} 
              className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800">PDFs & Docs</p>
                <p className="text-[11px] text-slate-400">Research & papers</p>
              </div>
            </div>

            {/* Input 2: Web Links */}
            <div 
              ref={div2Ref} 
              className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800">Web Articles</p>
                <p className="text-[11px] text-slate-400">URLs & bookmarks</p>
              </div>
            </div>

            {/* Input 3: Notes */}
            <div 
              ref={div3Ref} 
              className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800">Markdown Notes</p>
                <p className="text-[11px] text-slate-400">Ideas & daily logs</p>
              </div>
            </div>

            {/* Input 4: Media */}
            <div 
              ref={div4Ref} 
              className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800">YouTube & Media</p>
                <p className="text-[11px] text-slate-400">Video transcripts</p>
              </div>
            </div>
          </div>

          {/* Center Column: Second Brain AI Core */}
          <div className="flex flex-col items-center justify-center z-10">
            <div 
              ref={centerRef} 
              className="relative p-6 sm:p-8 bg-gradient-to-b from-white to-slate-50 border-2 border-emerald-400/80 rounded-3xl shadow-2xl shadow-emerald-500/20 flex flex-col items-center justify-center text-center group"
            >
              {/* Outer pulsing ring */}
              <div className="absolute -inset-2 rounded-3xl border border-emerald-400/30 animate-pulse pointer-events-none" />
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-3 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                Second Brain AI
              </h3>
              <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                Active Neural Core
              </span>
            </div>
          </div>

          {/* Right Column: AI Outputs & Knowledge Graph */}
          <div className="flex flex-col justify-between h-full z-10 gap-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 hidden sm:block text-right">
              Outputs
            </div>

            {/* Output 1: 3D Knowledge Graph */}
            <div 
              ref={div5Ref} 
              className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Network className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800">3D Force Graph</p>
                <p className="text-[11px] text-slate-400">Interactive clustering</p>
              </div>
            </div>

            {/* Output 2: AI Conversational Chat */}
            <div 
              ref={div6Ref} 
              className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800">RAG Chat Memory</p>
                <p className="text-[11px] text-slate-400">Instant answers</p>
              </div>
            </div>

            {/* Output 3: Auto Tags */}
            <div 
              ref={div7Ref} 
              className="flex items-center gap-3 p-3 sm:px-4 sm:py-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Tags className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800">Smart Auto-Tags</p>
                <p className="text-[11px] text-slate-400">Taxonomy auto-built</p>
              </div>
            </div>
          </div>

          {/* Animated Beams: Inputs -> Center */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={centerRef}
            duration={4}
            curvature={-25}
            gradientStartColor="#3B82F6"
            gradientStopColor="#10B981"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div2Ref}
            toRef={centerRef}
            duration={3.5}
            curvature={-10}
            gradientStartColor="#F59E0B"
            gradientStopColor="#10B981"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div3Ref}
            toRef={centerRef}
            duration={4.2}
            curvature={10}
            gradientStartColor="#10B981"
            gradientStopColor="#059669"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div4Ref}
            toRef={centerRef}
            duration={4.8}
            curvature={25}
            gradientStartColor="#F43F5E"
            gradientStopColor="#10B981"
          />

          {/* Animated Beams: Center -> Outputs */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={div5Ref}
            duration={3.8}
            curvature={-20}
            gradientStartColor="#10B981"
            gradientStopColor="#0D9488"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={div6Ref}
            duration={4.5}
            curvature={0}
            gradientStartColor="#10B981"
            gradientStopColor="#059669"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={div7Ref}
            duration={4.1}
            curvature={20}
            gradientStartColor="#10B981"
            gradientStopColor="#6366F1"
          />
        </div>

        {/* Bottom Explorer Action */}
        <div className="mt-8 text-center">
          <Link
            to="/graph"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span>Experience the 3D Graph live</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
