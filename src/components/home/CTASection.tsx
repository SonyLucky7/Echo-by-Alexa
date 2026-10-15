"use client";

import React from "react";
import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CTASectionProps {
  onOpenVoice?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenVoice }) => {
  const handleVoice = () => {
    if (onOpenVoice) onOpenVoice();
    window.dispatchEvent(new CustomEvent("echo:open-voice"));
  };

  return (
    <section className="py-32 bg-charcoal text-ivory relative overflow-hidden text-center border-t border-ivory/10">
      {/* Warm ambient hearth glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-ember/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember mb-4 block">
          Reservations & Dining
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight mb-6 text-balance leading-tight">
          Experience Gastronomy in Pure Elemental Harmony
        </h2>
        <p className="text-ivory/70 text-base max-w-lg mx-auto font-light leading-relaxed mb-10 text-balance">
          Whether joining us in the dining room or savoring our seasonal creations at home, your table awaits.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/menu" className="w-full sm:w-auto">
            <Button
              variant="ember"
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 py-4 text-sm font-medium tracking-wide gap-2"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <button
            type="button"
            onClick={handleVoice}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-ivory/20 bg-ivory/5 hover:bg-ivory/15 text-ivory text-sm font-medium tracking-wide transition-all duration-300"
          >
            <Mic className="w-4 h-4 text-ember" />
            <span>Speak with Alexa</span>
          </button>
        </div>
      </div>
    </section>
  );
};
