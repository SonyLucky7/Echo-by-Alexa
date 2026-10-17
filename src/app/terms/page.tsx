import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="py-16 px-6 md:px-12 max-w-3xl mx-auto text-left animate-fade-in space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal/60 hover:text-ember transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="space-y-3">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-charcoal">
          Terms of Hospitality
        </h1>
        <p className="text-xs text-charcoal/50 font-mono uppercase tracking-wider">
          Last Updated: Seasonal Spring / Hearth Equinox
        </p>
      </div>

      <div className="space-y-6 text-sm text-charcoal/80 leading-relaxed font-light divide-y divide-charcoal/10">
        <div className="space-y-2 pt-4">
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            1. Dining Reservations &amp; Punctuality
          </h3>
          <p>
            To preserve the synchronized wood-fire cooking cadence of our hearth team, reservations are held for 15 minutes past the scheduled seating time. Tasting counters proceed promptly at their designated flight start times.
          </p>
        </div>

        <div className="space-y-2 pt-6">
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            2. Cancellation Policy
          </h3>
          <p>
            Cancellations or modifications to party sizes are accepted up to 24 hours prior to your seating without penalty. Special chef counter tasting deposits are refundable with at least 48 hours notice.
          </p>
        </div>

        <div className="space-y-2 pt-6">
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            3. Corkage &amp; Cake Service
          </h3>
          <p>
            We welcome special vintage bottles from personal cellars for a corkage fee of $55 per 750ml bottle (limit two bottles per table), provided the wine is not currently represented on our botanical pairing cellar list.
          </p>
        </div>

        <div className="space-y-2 pt-6">
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            4. Hospitality Inclusivity &amp; Gratuity
          </h3>
          <p>
            A 20% living wage hospitality fee is included on all dine-in checks to ensure equitable compensation, healthcare, and fair living wages across both our front-of-house guides and back-of-house hearth artisans.
          </p>
        </div>
      </div>
    </div>
  );
}
