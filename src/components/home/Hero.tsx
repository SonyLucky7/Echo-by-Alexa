"use client";

import React from "react";
import Link from "next/link";
import { Mic, ArrowRight, Flame, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface HeroProps {
  onOpenVoice?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenVoice = () => {} }) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-6 md:px-12 py-20 overflow-hidden bg-charcoal text-ivory">
      {/* Background Photography with Sophisticated Editorial Tint */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=85"
          alt="ECHO Hearth Live Cooking"
          className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/80" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-charcoal/40 to-charcoal" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Hospitality Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ivory/10 border border-ivory/15 backdrop-blur-md mb-8 animate-fade-in">
          <Flame className="w-3.5 h-3.5 text-ember" />
          <span className="text-xs uppercase tracking-widest text-ivory/90 font-medium">
            Open Hearth & Foraged Wild Botanicals
          </span>
          <span className="w-1 h-1 rounded-full bg-ember" />
          <span className="text-xs text-ivory/70">Table, Pickup & Delivery</span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-ivory leading-[1.08] mb-6 max-w-4xl text-balance">
          Where Elemental Fire Meets <span className="italic font-light text-ember">Wild Aromatics</span>
        </h1>

        {/* Narrative Description */}
        <p className="text-base sm:text-lg md:text-xl text-ivory/75 max-w-2xl font-light leading-relaxed mb-10 text-balance">
          Welcome to ECHO. A culinary sanctuary devoted to open fruitwood flame, ancient grains, and coastal botanical herbs. Experience intuitive dining assisted by our multilingual concierge.
        </p>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/menu" className="w-full sm:w-auto">
            <Button
              variant="ember"
              size="lg"
              className="w-full sm:w-auto shadow-floating hover:shadow-lg flex items-center justify-center gap-2 text-base px-8 py-4"
            >
              <span>Explore Curated Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenVoice}
            className="w-full sm:w-auto border-ivory/25 text-ivory hover:bg-ivory/10 backdrop-blur-sm flex items-center justify-center gap-2 text-base px-8 py-4"
          >
            <Mic className="w-4 h-4 text-ember animate-pulse" />
            <span>Speak with Alexa</span>
            <span className="text-xs text-ivory/60 ml-1 font-normal hidden md:inline">
              (5 Languages)
            </span>
          </Button>
        </div>

        {/* Value Proposition Pills */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-12 mt-16 pt-10 border-t border-ivory/10 w-full max-w-3xl text-left">
          <div className="flex items-start gap-3">
            <Flame className="w-5 h-5 text-ember shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ivory">Live Ember Hearth</p>
              <p className="text-xs text-ivory/50 font-light mt-0.5">
                Almond wood & white oak smoke
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Leaf className="w-5 h-5 text-olive-light shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ivory">Wild Foraged Botanicals</p>
              <p className="text-xs text-ivory/50 font-light mt-0.5">
                Spruce tip, sumac & pine ferments
              </p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-ember shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ivory">Intelligent Hospitality</p>
              <p className="text-xs text-ivory/50 font-light mt-0.5">
                Custom voice ordering in EN, HI, TE, ES, FR
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
