"use client";

import React from "react";
import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface HeroProps {
  onOpenVoice?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenVoice }) => {
  const handleVoiceClick = () => {
    if (onOpenVoice) {
      onOpenVoice();
    }
    window.dispatchEvent(new CustomEvent("echo:open-voice"));
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 md:px-12 py-24 overflow-hidden bg-charcoal text-ivory">
      {/* Background Photography with Atmospheric Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2400&q=85"
          alt="ECHO Live Hearth Cooking"
          className="w-full h-full object-cover opacity-30 scale-100 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/80" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-charcoal/40 to-charcoal" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Restrained Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-ivory/15 bg-ivory/5 backdrop-blur-md mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-ivory/80 font-medium">
            Progressive Hearth & Botanicals
          </span>
        </div>

        {/* Headline: Max 2 Lines, High Editorial Polish */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-ivory leading-[1.1] mb-6 max-w-3xl text-balance">
          Where Fire Meets <span className="italic font-light text-ember">Wild Terroir</span>
        </h1>

        {/* Narrative Description: Concise, Pure Luxury */}
        <p className="text-base sm:text-lg text-ivory/70 max-w-xl font-light leading-relaxed mb-10 text-balance">
          An intimate dining sanctuary devoted to open fruitwood embers, cold-foraged botanicals, and heirloom grains.
        </p>

        {/* Primary Actions: Clean, Refined, No Nested Spec Labels */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/menu" className="w-full sm:w-auto">
            <Button
              variant="ember"
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 py-4 text-sm font-medium tracking-wide shadow-floating hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <button
            type="button"
            onClick={handleVoiceClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-ivory/20 bg-ivory/5 hover:bg-ivory/15 text-ivory backdrop-blur-md text-sm font-medium tracking-wide transition-all duration-300"
          >
            <Mic className="w-4 h-4 text-ember" />
            <span>Speak with Alexa</span>
          </button>
        </div>

        {/* Refined Architectural Status Line */}
        <div className="mt-16 pt-8 border-t border-ivory/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-ivory/50 tracking-wider uppercase font-light">
          <span>Live Fruitwood Ember</span>
          <span className="w-1 h-1 rounded-full bg-ember/60 hidden sm:inline-block" />
          <span>Cold Foraged Botanicals</span>
          <span className="w-1 h-1 rounded-full bg-ember/60 hidden sm:inline-block" />
          <span>Table · Pickup · Delivery</span>
        </div>
      </div>
    </section>
  );
};
