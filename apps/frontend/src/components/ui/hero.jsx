import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Network, Search, BrainCircuit } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-white pb-16 pt-32 font-normal text-slate-900 antialiased md:pb-24 md:pt-36"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)",
      }}
    >
      {/* Soft Ambient Radial Emerald Glows */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.05) 50%, rgba(255, 255, 255, 0) 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-0 top-12 h-[500px] w-[500px] -translate-x-1/4 rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, rgba(16, 185, 129, 0.04) 50%, rgba(255, 255, 255, 0) 70%)",
        }}
      />

      {/* Subtle Background Grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Top Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-800 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>AI-POWERED PERSONAL KNOWLEDGE HUB</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
            Organize Your Digital Mind with{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Knowledge Graphs
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg font-normal leading-relaxed text-slate-600 md:text-xl">
            Second Brain effortlessly connects your scattered notes, articles, research, and ideas into a living 3D knowledge network with instant conversational recall.
          </p>

          {/* CTA Buttons */}
          <div className="mb-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="neumorphic-button group inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-emerald-700 sm:w-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/graph"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-8 py-4 text-base font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-700 sm:w-auto"
            >
              <Network className="h-4 w-4 text-emerald-600" />
              <span>Explore 3D Graph</span>
            </Link>
          </div>

          {/* Trust & Highlights Pill Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </div>
              <span>Semantic Search & Hybrid RAG</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </div>
              <span>Automated Topic Clustering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </div>
              <span>Interactive 3D WebGL Graph</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
