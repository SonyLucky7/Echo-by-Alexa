import React from "react";
import { Clock, MapPin, Phone, Mail, Utensils } from "lucide-react";

export const RestaurantInfo: React.FC = () => {
  return (
    <section id="hours-location" className="py-28 bg-cream/40 border-t border-charcoal/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
        <div className="mb-16">
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-olive mb-2 block">
            The Sanctuary
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-charcoal">
            Hours & Inquiries
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Dinner Service Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal pb-2 border-b border-charcoal/10">
              <Clock className="w-4 h-4 text-ember" />
              <span>Dinner Service</span>
            </div>
            <div className="space-y-2 text-sm text-charcoal/80 font-light">
              <div className="flex justify-between py-1">
                <span>Tuesday – Thursday</span>
                <span className="font-mono text-xs">5:30 – 10:30 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Friday – Saturday</span>
                <span className="font-mono text-xs">5:00 – 11:30 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sunday</span>
                <span className="font-mono text-xs">4:30 – 9:30 PM</span>
              </div>
              <div className="flex justify-between py-1 text-ember font-normal pt-2">
                <span>Monday</span>
                <span className="text-xs">Closed for Foraging</span>
              </div>
            </div>
          </div>

          {/* Column 2: Location & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal pb-2 border-b border-charcoal/10">
              <MapPin className="w-4 h-4 text-ember" />
              <span>Location & Contact</span>
            </div>
            <div className="space-y-3 text-sm text-charcoal/80 font-light">
              <p>448 Hearthstone Way, Artisan District</p>
              <p>+1 (555) 324-6324</p>
              <p>concierge@echo-restaurant.com</p>
              <p className="text-xs text-olive font-medium pt-1">
                Valet parking available for all evening seatings.
              </p>
            </div>
          </div>

          {/* Column 3: Dining & Fulfillment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal pb-2 border-b border-charcoal/10">
              <Utensils className="w-4 h-4 text-ember" />
              <span>Dining & Fulfillment</span>
            </div>
            <div className="space-y-3 text-sm text-charcoal/80 font-light leading-relaxed">
              <p>
                Experience our curated tasting menus and botanical pairings seated in the stone dining room, or order for counter pickup and climate-insulated delivery.
              </p>
              <p className="text-xs text-charcoal/60">
                Dietary customizations, allergens, and wine cellar guidance are readily accommodated through our dining concierge and table sommelier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
