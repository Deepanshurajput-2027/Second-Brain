import React from "react";
import { motion } from "framer-motion";
import { Search, Network, Tags, Sparkles, Layers, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Search,
    title: "AI Semantic Search",
    tagline: "Natural Language Retrieval",
    description: "Search your knowledge base using intuitive ideas instead of exact keywords. Powered by high-dimensional vector embeddings and hybrid RAG indexing.",
    badge: "Vector AI",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Network,
    title: "3D Graph Visualization",
    tagline: "Interactive Neural Spatial View",
    description: "Explore interconnected memories in a responsive 3D WebGL force-graph. Click any node to deep-link, auto-center the camera, and inspect relationships.",
    badge: "WebGL 3D",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Tags,
    title: "Automated Tagging & Ingestion",
    tagline: "Effortless Taxonomy",
    description: "Paste a URL, drop a PDF, or write a note. Second Brain automatically generates concise summaries, key entities, and auto-links related concepts.",
    badge: "Auto-Clustering",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative w-full py-28 bg-white overflow-hidden">
      {/* Background Decor */}
      <div className="pointer-events-none absolute -top-40 right-1/4 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>CORE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Engineered for <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Superhuman Recall</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Replace chaotic folders and dead bookmarks with an adaptive knowledge graph that grows smarter as you learn.
          </p>
        </div>

        {/* 3-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden"
              >
                {/* Top Header */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">
                    {feat.tagline}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Feature Image Mockup */}
                <div className="mt-8 relative h-48 w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group-hover:shadow-inner transition-shadow">
                  <img
                    src={feat.image}
                    alt={feat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Secondary Benefits Banner */}
        <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50/70 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold text-slate-900">
              Ready to free up your cognitive bandwidth?
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Join thinkers, researchers, and engineers who trust Second Brain for instant, friction-free memory retrieval.
            </p>
          </div>
          <Link
            to="/register"
            className="neumorphic-button inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg transition-all flex-shrink-0"
          >
            <span>Create Your Free Account</span>
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
