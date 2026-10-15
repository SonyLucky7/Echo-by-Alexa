"use client";

import React from "react";
import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CTASectionProps {
  onOpenVoice?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenVoice = () => {} }) => {
  return (
    <section className="py-24 bg-charcoal text-ivory relative overflow-hidden text-center">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C58F58_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-ember mb-3 block">
          Your Culinary Table Awaits
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight mb-6 text-balance">
          Experience Gastronomy in Pure Elemental Harmony
        </h2>
        <p className="text-ivory/70 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed mb-10 text-balance">
          Whether joining us in the dining room or ordering curated plates to your home, explore our seasonal creations now.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/menu" className="w-full sm:w-auto">
            <Button variant="ember" size="lg" className="w-full sm:w-auto px-8 py-4 gap-2">
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={onOpenVoice}
            className="w-full sm:w-auto border-ivory/30 text-ivory hover:bg-ivory/10 px-8 py-4 gap-2"
          >
            <Mic className="w-4 h-4 text-ember" />
            <span>Speak with Alexa</span>
          </Button>
        </div>
      </div>
    </section>
  );
};
