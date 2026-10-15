import React from "react";
import { Clock, MapPin, Phone, Mail, Utensils, ShoppingBag, Truck } from "lucide-react";

export const RestaurantInfo: React.FC = () => {
  return (
    <section id="hours-location" className="py-24 bg-cream/40 border-t border-charcoal/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest font-semibold text-olive mb-2">
            The Sanctuary & Schedule
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal">
            Hours, Location & Fulfillment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Hours */}
          <div className="bg-ivory rounded-3xl p-8 border border-charcoal/10 shadow-sm space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-olive/10 flex items-center justify-center text-olive">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                Dinner Service
              </h3>
              <p className="text-xs text-charcoal/60 leading-relaxed font-light mb-4">
                Tasting menus, à la carte dining, and botanical pairings.
              </p>
            </div>
            <div className="text-xs text-charcoal/80 space-y-2.5 pt-2 border-t border-charcoal/10">
              <div className="flex justify-between py-1">
                <span className="font-medium text-charcoal">Tue – Thu:</span>
                <span>5:30 PM – 10:30 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-charcoal">Fri – Sat:</span>
                <span>5:00 PM – 11:30 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-charcoal">Sunday:</span>
                <span>4:30 PM – 9:30 PM</span>
              </div>
              <div className="flex justify-between py-1 text-ember">
                <span className="font-medium">Monday:</span>
                <span>Closed for Wild Foraging</span>
              </div>
            </div>
          </div>

          {/* Card 2: Location & Contact */}
          <div className="bg-ivory rounded-3xl p-8 border border-charcoal/10 shadow-sm space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-ember/15 flex items-center justify-center text-ember">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                Sanctuary Location
              </h3>
              <p className="text-xs text-charcoal/60 leading-relaxed font-light mb-4">
                Situated in the historic stone arches of the Artisan District.
              </p>
            </div>
            <div className="text-xs text-charcoal/80 space-y-3 pt-2 border-t border-charcoal/10">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-ember shrink-0 mt-0.5" />
                <span>448 Hearthstone Way, Artisan District</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-ember shrink-0" />
                <span>+1 (555) 324-6324</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-ember shrink-0" />
                <span>concierge@echo-restaurant.com</span>
              </p>
              <p className="text-[11px] text-olive font-medium pt-2">
                Valet parking available for all dinner seatings.
              </p>
            </div>
          </div>

          {/* Card 3: Multi-Fulfillment Suite */}
          <div className="bg-ivory rounded-3xl p-8 border border-charcoal/10 shadow-sm space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center text-charcoal">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-medium text-charcoal mb-2">
                Ordering Options
              </h3>
              <p className="text-xs text-charcoal/60 leading-relaxed font-light mb-4">
                All 3 fulfillment channels share the same menu and AI concierge.
              </p>
            </div>
            <div className="text-xs text-charcoal/80 space-y-3 pt-2 border-t border-charcoal/10">
              <div className="flex items-start gap-3">
                <Utensils className="w-4 h-4 text-olive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Dine-In Table Service</p>
                  <p className="text-charcoal/50 text-[11px]">Order from your phone or voice at your table</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShoppingBag className="w-4 h-4 text-ember shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Curbside & Counter Pickup</p>
                  <p className="text-charcoal/50 text-[11px]">Ember-hot packaging, 20-min turnaround</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-charcoal shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Direct Delivery</p>
                  <p className="text-charcoal/50 text-[11px]">Insulated delivery within 8-mile radius</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
