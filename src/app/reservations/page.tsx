"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  Flame,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const EXPERIENCES = [
  {
    id: "hearth-counter",
    title: "Chef's Hearth Counter",
    description: "Front-row seats overlooking the open fruitwood hearth. 7-course seasonal tasting with chef interaction.",
    capacity: "1–4 Guests",
    deposit: "$125 per guest deposit",
    highlight: "Signature Experience",
  },
  {
    id: "main-dining",
    title: "Sanctuary Dining Room",
    description: "Intimate wood-hewn tables bathed in warm candlelight. Full à la carte botanical & ember menu.",
    capacity: "2–8 Guests",
    deposit: "Complimentary reservation",
    highlight: "Classic Dining",
  },
  {
    id: "botanical-patio",
    title: "Enclosed Botanical Atrium",
    description: "Surrounded by living aromatic herbs, olive trees, and radiant hearth warmth under glass.",
    capacity: "2–6 Guests",
    deposit: "Complimentary reservation",
    highlight: "Garden Setting",
  },
  {
    id: "private-alcove",
    title: "The Ember Alcove (Private)",
    description: "Secluded velvet & stone booth for anniversaries, celebrations, and bespoke beverage pairings.",
    capacity: "4–10 Guests",
    deposit: "$250 room reservation",
    highlight: "Private Gathering",
  },
];

const TIME_SLOTS = [
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:45 PM",
  "7:15 PM",
  "8:00 PM",
  "8:30 PM",
  "9:15 PM",
];

export default function ReservationsPage() {
  const [selectedExp, setSelectedExp] = useState(EXPERIENCES[0].id);
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState("7:15 PM");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;

    const ref = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingRef(ref);
    setIsConfirmed(true);
  };

  const currentExp = EXPERIENCES.find((e) => e.id === selectedExp)!;

  return (
    <div className="py-12 px-6 md:px-12 max-w-6xl mx-auto text-left animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ember/10 border border-ember/30 text-charcoal text-xs uppercase tracking-widest font-medium">
          <Flame className="w-3.5 h-3.5 text-ember" />
          <span>Table Bookings</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal">
          Reserve at the Hearth
        </h1>
        <p className="text-charcoal/65 text-sm sm:text-base font-light leading-relaxed">
          Join us for wood-fired gastronomy, wild coastal botanicals, and heirloom grains crafted over open live flame.
        </p>
      </div>

      {isConfirmed ? (
        <div className="max-w-xl mx-auto p-8 sm:p-10 bg-ivory rounded-3xl border border-charcoal/10 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-olive/15 text-olive flex items-center justify-center mx-auto border border-olive/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-olive font-semibold">
              Reservation Confirmed • #{bookingRef}
            </span>
            <h2 className="font-serif text-3xl font-medium text-charcoal">
              We Await You, {guestName.split(" ")[0]}
            </h2>
            <p className="text-sm text-charcoal/70 font-light leading-relaxed">
              A confirmation has been sent to <span className="font-medium text-charcoal">{guestEmail}</span>. Our hearth team is preparing your table.
            </p>
          </div>

          <div className="p-5 bg-cream/50 rounded-2xl border border-charcoal/10 text-left space-y-2.5 text-xs text-charcoal/80">
            <div className="flex justify-between">
              <span className="text-charcoal/50">Experience:</span>
              <span className="font-medium text-charcoal">{currentExp.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/50">Guests:</span>
              <span className="font-medium text-charcoal">{partySize} Guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/50">Date &amp; Time:</span>
              <span className="font-medium text-charcoal">
                {selectedDate} at {selectedTime}
              </span>
            </div>
            {dietaryNotes && (
              <div className="flex justify-between pt-1 border-t border-charcoal/10">
                <span className="text-charcoal/50">Dietary Notes:</span>
                <span className="font-medium text-charcoal">{dietaryNotes}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/menu">
              <Button variant="ember" size="md">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                <span>Explore Menu Plates</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="md">
                <span>Return to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Experience Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-cream/40 rounded-3xl p-6 sm:p-8 border border-charcoal/10 space-y-5">
              <h3 className="font-serif text-xl font-medium text-charcoal">
                1. Select Experience
              </h3>

              <div className="space-y-3">
                {EXPERIENCES.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setSelectedExp(exp.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      selectedExp === exp.id
                        ? "bg-charcoal text-ivory border-charcoal shadow-sm ring-1 ring-charcoal"
                        : "bg-ivory border-charcoal/15 text-charcoal hover:bg-cream"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{exp.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-medium ${
                          selectedExp === exp.id
                            ? "bg-ember text-charcoal"
                            : "bg-charcoal/5 text-charcoal/60"
                        }`}
                      >
                        {exp.highlight}
                      </span>
                    </div>
                    <p
                      className={`text-xs leading-relaxed font-light ${
                        selectedExp === exp.id ? "text-ivory/80" : "text-charcoal/65"
                      }`}
                    >
                      {exp.description}
                    </p>
                    <div
                      className={`mt-2 flex items-center justify-between text-[11px] font-mono ${
                        selectedExp === exp.id ? "text-ember" : "text-charcoal/50"
                      }`}
                    >
                      <span>{exp.capacity}</span>
                      <span>{exp.deposit}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="bg-cream/40 rounded-3xl p-6 sm:p-8 border border-charcoal/10 space-y-5">
              <h3 className="font-serif text-xl font-medium text-charcoal">
                2. Party &amp; Date
              </h3>

              {/* Party Size Selector */}
              <div>
                <label className="block text-xs font-medium text-charcoal mb-2 uppercase tracking-wider">
                  Number of Guests
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPartySize(size)}
                      className={`py-2.5 rounded-xl text-xs font-semibold font-mono transition-all border ${
                        partySize === size
                          ? "bg-charcoal text-ivory border-charcoal shadow-sm"
                          : "bg-ivory border-charcoal/15 text-charcoal hover:bg-cream"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-2 uppercase tracking-wider">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-ivory border border-charcoal/20 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-2 uppercase tracking-wider">
                    Seating Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 bg-ivory border border-charcoal/20 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal font-medium"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Guest Details & Submit (5 cols) */}
          <div className="lg:col-span-5 bg-ivory rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card space-y-6 sticky top-28">
            <h3 className="font-serif text-2xl font-medium text-charcoal pb-4 border-b border-charcoal/10">
              Guest Details
            </h3>

            <div className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="Eleanor Vance"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />

              <Input
                label="Email Address *"
                type="email"
                placeholder="eleanor@domain.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />

              <Input
                label="Mobile Phone *"
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">
                  Dietary Accommodations or Special Requests
                </label>
                <textarea
                  rows={3}
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  placeholder="e.g., Celiac guest, anniversary celebration, preference for quiet hearthside seating"
                  className="w-full px-4 py-3 bg-cream/40 border border-charcoal/20 rounded-xl text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-charcoal resize-none"
                />
              </div>
            </div>

            {/* Booking Summary Box */}
            <div className="p-4 bg-cream/50 rounded-2xl border border-charcoal/10 space-y-1.5 text-xs text-charcoal/80">
              <div className="flex justify-between font-medium text-charcoal">
                <span>{currentExp.title}</span>
                <span>{partySize} Guests</span>
              </div>
              <p className="text-[11px] text-charcoal/60">
                {selectedDate} at {selectedTime}
              </p>
              <p className="text-[11px] text-olive font-medium pt-1">
                {currentExp.deposit}
              </p>
            </div>

            <Button
              type="submit"
              variant="ember"
              size="lg"
              className="w-full py-4 text-base shadow-sm font-medium tracking-wide"
            >
              <span>Confirm Table Reservation</span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal/50 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-olive" />
              <span>Complimentary cancellation up to 24h prior</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
