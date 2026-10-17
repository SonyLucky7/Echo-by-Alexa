import React from "react";
import Link from "next/link";
import { Flame, ArrowLeft, UtensilsCrossed, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-20 px-6 md:px-12">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        {/* Subtle Ember Flame Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ember/10 border border-ember/30 text-charcoal text-xs uppercase tracking-widest font-medium">
          <Flame className="w-3.5 h-3.5 text-ember" />
          <span>404 — Page Not Found</span>
        </div>

        {/* Hero Headings */}
        <div className="space-y-3">
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-charcoal">
            Lost Beyond the Hearth
          </h1>
          <p className="text-charcoal/65 text-base sm:text-lg font-light max-w-lg mx-auto leading-relaxed">
            The page you are looking for has been moved, transformed with the season, or does not exist in our sanctuary.
          </p>
        </div>

        {/* Quick Route Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
          <Link
            href="/menu"
            className="p-5 rounded-2xl bg-cream/50 hover:bg-cream border border-charcoal/10 transition-all hover:-translate-y-0.5 group"
          >
            <UtensilsCrossed className="w-5 h-5 text-ember mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-base font-semibold text-charcoal mb-1">
              Curated Menu
            </h3>
            <p className="text-xs text-charcoal/60 leading-relaxed font-light">
              Explore live fruitwood plates, botanicals, and heirloom grains.
            </p>
          </Link>

          <Link
            href="/reservations"
            className="p-5 rounded-2xl bg-cream/50 hover:bg-cream border border-charcoal/10 transition-all hover:-translate-y-0.5 group"
          >
            <CalendarDays className="w-5 h-5 text-ember mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-base font-semibold text-charcoal mb-1">
              Reserve a Table
            </h3>
            <p className="text-xs text-charcoal/60 leading-relaxed font-light">
              Book your hearthside alcove or chef&rsquo;s tasting counter.
            </p>
          </Link>

          <Link
            href="/#hours-location"
            className="p-5 rounded-2xl bg-cream/50 hover:bg-cream border border-charcoal/10 transition-all hover:-translate-y-0.5 group"
          >
            <Clock className="w-5 h-5 text-ember mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif text-base font-semibold text-charcoal mb-1">
              Hours &amp; Location
            </h3>
            <p className="text-xs text-charcoal/60 leading-relaxed font-light">
              Sanctuary service hours, artisan district map &amp; valet.
            </p>
          </Link>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/">
            <Button variant="ember" size="lg" className="px-8 shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Return to Sanctuary</span>
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="secondary" size="lg" className="px-8">
              <span>View Menu</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
