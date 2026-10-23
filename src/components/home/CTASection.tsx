"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const CTASection: React.FC = () => {
  return (
    <section className="relative py-28 px-6 md:px-12 bg-charcoal text-ivory text-center overflow-hidden border-t border-charcoal-muted">
      {/* Ambient hearth glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-ember/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ember-light mb-4 block font-mono">
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
              className="w-full sm:w-auto rounded-full px-8 py-4 text-sm font-medium tracking-wide gap-2 cursor-pointer"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/reservations" className="w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full border border-ivory/20 hover:border-ivory/40 text-ivory text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white/5 cursor-pointer"
            >
              <span>Reserve a Table</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
