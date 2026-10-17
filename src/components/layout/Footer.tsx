import React from "react";
import Link from "next/link";
import { Flame, MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-ivory border-t border-charcoal-muted mt-auto pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
        {/* Col 1: Brand & Philosophy */}
        <div className="md:col-span-1 space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl tracking-widest font-semibold text-ivory">
              ECHO
            </span>
          </Link>
          <p className="text-ivory/60 text-sm leading-relaxed font-light">
            An elemental fine-dining sanctuary where hyper-seasonal wild botanicals, ancient grains, and live fire converge.
          </p>
          <div className="flex items-center gap-2 text-xs text-ember">
            <Flame className="w-3.5 h-3.5" />
            <span>Regenerative, organic, fire-crafted</span>
          </div>
        </div>

        {/* Col 2: Navigation & Discover */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory/40">
            Navigation
          </h4>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li>
              <Link href="/menu" className="hover:text-ember transition-colors">
                Curated Seasonal Menu
              </Link>
            </li>
            <li>
              <Link href="/#hearth-story" className="hover:text-ember transition-colors">
                Culinary Philosophy
              </Link>
            </li>
            <li>
              <Link href="/#hours-location" className="hover:text-ember transition-colors">
                Reservations & Location
              </Link>
            </li>
            <li>
              <Link href="/staff/orders" className="hover:text-ember transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kitchen Operations</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Hours & Operations */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory/40 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Service Hours</span>
          </h4>
          <div className="text-xs text-ivory/70 space-y-1.5">
            <p className="flex justify-between">
              <span className="text-ivory/50">Tue – Thu:</span>
              <span>5:30 PM – 10:30 PM</span>
            </p>
            <p className="flex justify-between">
              <span className="text-ivory/50">Fri – Sat:</span>
              <span>5:00 PM – 11:30 PM</span>
            </p>
            <p className="flex justify-between">
              <span className="text-ivory/50">Sunday:</span>
              <span>4:30 PM – 9:30 PM</span>
            </p>
            <p className="flex justify-between text-ember">
              <span>Monday:</span>
              <span>Closed for Foraging</span>
            </p>
          </div>
        </div>

        {/* Col 4: Contact & Location */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ivory/40">
            Contact & Sanctuary
          </h4>
          <div className="text-xs text-ivory/70 space-y-2">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-ember shrink-0 mt-0.5" />
              <span>448 Hearthstone Way, Artisan District</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-ember shrink-0" />
              <span>+1 (555) 324-6324</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-ember shrink-0" />
              <span>concierge@echo-restaurant.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-ivory/10 flex flex-col md:flex-row items-center justify-between text-xs text-ivory/40 gap-4">
        <p>© {new Date().getFullYear()} ECHO Restaurant & Gastronomy Group. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-ivory cursor-pointer">Dietary & Allergen Policy</span>
          <span className="hover:text-ivory cursor-pointer">Privacy Notice</span>
          <span className="hover:text-ivory cursor-pointer">Terms of Hospitality</span>
        </div>
      </div>
    </footer>
  );
};
