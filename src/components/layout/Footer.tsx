"use client";

import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#131314] text-ivory border-t border-charcoal-muted mt-auto overflow-hidden">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start text-left">
          {/* Left Brand Area (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-3xl sm:text-4xl tracking-[0.25em] font-semibold text-ivory group-hover:text-ember transition-colors">
                ECHO
              </span>
            </Link>

            <p className="text-ivory/60 text-sm font-light leading-relaxed max-w-sm">
              Live fruitwood hearth &amp; wild coastal botanicals. Fine dining celebrating California terroir and ancient open-flame cooking.
            </p>

            <div className="pt-2 text-xs text-ivory/50 space-y-1.5 font-light">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-ember shrink-0" />
                <span>448 Hearthstone Way, Artisan District</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-ember shrink-0" />
                <span className="font-mono">+1 (555) 324-6324</span>
              </p>
            </div>
          </div>

          {/* Nav Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ember font-mono block">
              Experience
            </span>
            <ul className="space-y-2.5 text-sm text-ivory/70 font-light">
              <li>
                <Link href="/menu" className="hover:text-ember transition-colors inline-flex items-center gap-1 group">
                  <span>Curated Menu</span>
                  <ArrowUpRight className="w-3 h-3 text-ivory/40 group-hover:text-ember transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-ember transition-colors inline-flex items-center gap-1 group">
                  <span>Table Reservations</span>
                  <ArrowUpRight className="w-3 h-3 text-ivory/40 group-hover:text-ember transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/story" className="hover:text-ember transition-colors inline-flex items-center gap-1 group">
                  <span>Hearth Philosophy</span>
                  <ArrowUpRight className="w-3 h-3 text-ivory/40 group-hover:text-ember transition-colors" />
                </Link>
              </li>
              <li>
                <Link href="/dietary" className="hover:text-ember transition-colors">
                  Dietary &amp; Allergens
                </Link>
              </li>
            </ul>
          </div>

          {/* Service & Hours (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ember font-mono block">
              Service Hours
            </span>
            <div className="space-y-2 text-sm text-ivory/70 font-light">
              <div className="flex justify-between border-b border-ivory/5 pb-1.5">
                <span>Tuesday – Thursday</span>
                <span className="font-mono text-xs">5:30 PM – 10:30 PM</span>
              </div>
              <div className="flex justify-between border-b border-ivory/5 pb-1.5">
                <span>Friday – Saturday</span>
                <span className="font-mono text-xs">5:00 PM – 11:30 PM</span>
              </div>
              <div className="flex justify-between border-b border-ivory/5 pb-1.5">
                <span>Sunday</span>
                <span className="font-mono text-xs">4:30 PM – 9:30 PM</span>
              </div>
              <div className="flex justify-between text-ember text-xs pt-0.5">
                <span>Monday</span>
                <span className="italic">Closed for Foraging</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/staff/orders"
                className="inline-flex items-center gap-2 text-xs text-ivory/40 hover:text-ivory transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kitchen Staff Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Architectural Brand Wordmark Banner Below */}
      <div className="relative w-full overflow-hidden select-none py-8 sm:py-12 border-t border-ivory/5 bg-black/30 flex items-center justify-center">
        <span className="font-serif text-[15vw] sm:text-[14vw] md:text-[12vw] font-bold tracking-[0.3em] sm:tracking-[0.35em] text-ivory/[0.05] leading-none uppercase select-none text-center block pl-[0.3em]">
          ECHO
        </span>
      </div>

      {/* Clean Bottom Legal Bar */}
      <div className="border-t border-ivory/5 bg-black/40 py-5 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-ivory/40 gap-3">
          <p>© {new Date().getFullYear()} ECHO Restaurant Group. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-ivory transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-ivory transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/dietary" className="hover:text-ivory transition-colors">
              Dietary
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
