import React from "react";
import { LandingNavbar } from "../components/sections/LandingNavbar";
import Hero from "../components/ui/hero";
import { ConnectedThoughtsSection } from "../components/sections/ConnectedThoughtsSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { LandingFooter } from "../components/sections/LandingFooter";

export const LandingPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden font-sans">
      {/* 1. Sticky Navigation */}
      <LandingNavbar />

      {/* 2. Modern Light/Emerald Hero Section */}
      <main className="flex-1">
        <Hero />

        {/* 3. Connect Your Thoughts (Animated Beam Pipeline Showcase) */}
        <div id="pipeline">
          <ConnectedThoughtsSection />
        </div>

        {/* 4. 3-Column Core Features Bento Grid */}
        <div id="features">
          <FeaturesSection />
        </div>
      </main>

      {/* 5. Comprehensive SaaS Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
