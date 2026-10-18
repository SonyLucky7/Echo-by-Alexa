"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#18181A] via-charcoal to-[#111112] text-ivory border-t border-ember/20 mt-auto overflow-hidden">
      {/* Subtle Atmospheric Ember Glow at Top Center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-ember/10 blur-[100px] pointer-events-none rounded-full" />

      {/* 1. Curated Newsletter / Hearth Journal Banner */}
      <div className="border-b border-ivory/10 bg-ivory/[0.02]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          <div className="lg:col-span-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ember/15 border border-ember/30 text-ember-light text-[11px] uppercase tracking-widest font-mono">
              <Flame className="w-3.5 h-3.5 text-ember" />
              <span>The Seasonal Hearth Journal</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-ivory">
              Invitations to the Fire &amp; Forage
            </h3>
            <p className="text-ivory/65 text-sm font-light leading-relaxed max-w-xl">
              Receive private invitations to seasonal equinox menu changeovers, rare botanical harvests, and sommelier allocation reserve dinners.
            </p>
          </div>

          <div className="lg:col-span-6">
            {isSubscribed ? (
              <div className="p-5 rounded-2xl bg-olive/20 border border-olive/30 flex items-center gap-3 text-ivory animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-ember-light shrink-0" />
                <div>
                  <p className="text-sm font-medium">Welcome to the Hearth Circle</p>
                  <p className="text-xs text-ivory/70 font-light">
                    We look forward to sharing our forthcoming seasonal harvests with you.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="flex-1 px-5 py-3.5 rounded-full bg-ivory/10 border border-ivory/15 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-all"
                  />
                  <button
                    type="submit"
                    className="px-7 py-3.5 rounded-full bg-ember hover:bg-ember-dark text-charcoal font-semibold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,143,88,0.3)]"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-ivory/40 font-light pl-2">
                  Zero commercial advertisements. Strictly seasonal culinary dispatches.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Multi-Column Links Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 text-left relative z-10">
        {/* Col 1: Brand & Philosophy */}
        <div className="space-y-4 lg:col-span-1">
          <Link href="/" className="inline-block group">
            <span className="font-serif text-3xl tracking-[0.25em] font-semibold text-ivory group-hover:text-ember transition-colors">
              ECHO
            </span>
          </Link>
          <p className="text-ivory/65 text-xs sm:text-sm leading-relaxed font-light">
            An elemental fine-dining sanctuary where hyper-seasonal wild botanicals, ancient grains, and live fruitwood fire converge.
          </p>

          <div className="pt-2 text-xs text-ember/90 flex items-center gap-2 font-light">
            <Flame className="w-3.5 h-3.5 text-ember" />
            <span>Regenerative, organic, fire-crafted</span>
          </div>
        </div>

        {/* Col 2: Gastronomy & Experience */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ember-light/80">
            Gastronomy
          </h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li>
              <Link href="/menu" className="hover:text-ember transition-colors">
                Curated Seasonal Menu
              </Link>
            </li>
            <li>
              <Link href="/story" className="hover:text-ember transition-colors">
                Our Hearth Philosophy
              </Link>
            </li>
            <li>
              <Link href="/reservations" className="hover:text-ember transition-colors">
                Table &amp; Alcove Bookings
              </Link>
            </li>
            <li>
              <Link href="/menu" className="hover:text-ember transition-colors">
                Botanical Elixir Pairings
              </Link>
            </li>
            <li>
              <Link href="/story" className="hover:text-ember transition-colors">
                Foraging &amp; Provenance
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Service Hours & Cadence */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ember-light/80 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ember" />
            <span>Service Cadence</span>
          </h4>
          <div className="text-xs text-ivory/70 space-y-2 font-light">
            <div className="flex justify-between border-b border-ivory/5 pb-1.5">
              <span className="text-ivory/50">Tue – Thu:</span>
              <span className="font-mono">5:30 PM – 10:30 PM</span>
            </div>
            <div className="flex justify-between border-b border-ivory/5 pb-1.5">
              <span className="text-ivory/50">Fri – Sat:</span>
              <span className="font-mono">5:00 PM – 11:30 PM</span>
            </div>
            <div className="flex justify-between border-b border-ivory/5 pb-1.5">
              <span className="text-ivory/50">Sunday:</span>
              <span className="font-mono">4:30 PM – 9:30 PM</span>
            </div>
            <div className="flex justify-between text-ember pt-0.5">
              <span>Monday:</span>
              <span className="italic">Closed for Foraging</span>
            </div>
            <p className="text-[11px] text-ivory/40 pt-2 font-light">
              Chef&rsquo;s Hearth Tasting Counter seatings at 5:30 PM and 8:15 PM nightly.
            </p>
          </div>
        </div>

        {/* Col 4: Sanctuary & Location */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ember-light/80">
            Sanctuary Location
          </h4>
          <div className="text-xs text-ivory/70 space-y-2.5 font-light">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-ember shrink-0 mt-0.5" />
              <span>448 Hearthstone Way, Artisan District, San Francisco CA 94107</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-ember shrink-0" />
              <span className="font-mono">+1 (555) 324-6324</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-ember shrink-0" />
              <span>concierge@echo-restaurant.com</span>
            </p>
            <div className="pt-1 text-[11px] text-ivory/50">
              <span>Valet parking available at front hearth pavilion.</span>
            </div>
          </div>
        </div>

        {/* Col 5: Hospitality & Kitchen Portal */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ember-light/80">
            Hospitality &amp; Operations
          </h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li>
              <Link href="/dietary" className="hover:text-ember transition-colors">
                Dietary &amp; Allergen Protocol
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-ember transition-colors">
                Reservation &amp; Corkage Policies
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-ember transition-colors">
                Guest Privacy Notice
              </Link>
            </li>
            <li className="pt-2">
              <Link
                href="/staff/orders"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ivory/10 hover:bg-ember hover:text-charcoal border border-ivory/15 text-xs text-ivory transition-all duration-200 group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-ember group-hover:text-charcoal" />
                <span>Kitchen Staff Portal</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Grand Architectural Brand Wordmark Banner */}
      <div className="relative w-full overflow-hidden select-none py-10 sm:py-16 md:py-20 border-t border-ivory/10 bg-black/40 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-ember/10 via-transparent to-transparent pointer-events-none" />
        <span className="font-serif text-[15vw] sm:text-[14vw] md:text-[12vw] font-bold tracking-[0.3em] sm:tracking-[0.35em] text-ivory/[0.08] leading-none uppercase select-none text-center block pl-[0.3em]">
          ECHO
        </span>
      </div>

      {/* 4. Bottom Copyright & Legal Strip */}
      <div className="border-t border-ivory/10 bg-black/40 py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-ivory/50 gap-4">
          <p>© {new Date().getFullYear()} ECHO Restaurant &amp; Gastronomy Group. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6 text-ivory/60">
            <Link href="/dietary" className="hover:text-ivory transition-colors">
              Dietary Transparency
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-ivory transition-colors">
              Privacy Notice
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-ivory transition-colors">
              Terms of Hospitality
            </Link>
          </div>

          <p className="text-[11px] text-ivory/40">
            Live Fruitwood Fire • Wild Coastal Botanicals
          </p>
        </div>
      </div>
    </footer>
  );
};
