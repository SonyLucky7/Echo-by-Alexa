"use client";

import React, { useState } from "react";
import { Plus, Check, MapPin, Flame, CheckCircle2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface DiningCardsProps {
  toolResults?: Array<{ tool: string; result: any }>;
  onSelectTimeSlot?: (time: string) => void;
  onAction?: (actionPrompt: string) => void;
}

export const DiningCards: React.FC<DiningCardsProps> = ({
  toolResults,
  onSelectTimeSlot,
  onAction,
}) => {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!toolResults || toolResults.length === 0) return null;

  const handleAddDish = async (dish: any) => {
    try {
      await addItem({ itemId: dish.id, quantity: 1 });
      setAddedIds((prev) => [...prev, dish.id]);
      window.dispatchEvent(new CustomEvent("echo:cart-updated"));
      setTimeout(() => {
        setAddedIds((prev) => prev.filter((id) => id !== dish.id));
      }, 3000);
    } catch (e) {
      console.error("Failed to add dish to cart:", e);
    }
  };

  const handleBookSlot = (slot: string) => {
    setSelectedSlot(slot);
    setBookingConfirmed(true);
    if (onSelectTimeSlot) onSelectTimeSlot(slot);
    if (onAction) {
      onAction(`Reserve table for 2 at ${slot} tonight`);
    }
  };

  return (
    <div className="w-full space-y-4 my-3 text-left">
      {toolResults.map((tr, index) => {
        const { tool, result } = tr;
        if (!result || result.error) return null;

        // 1. Table Reservation Flow with Seating Times (from reference video)
        if (tool === "book_table" || result.type === "reservation" || result.availableSlots) {
          return (
            <div
              key={index}
              className="bg-white/[0.04] backdrop-blur-xl border border-ember/25 rounded-2xl p-4 sm:p-5 shadow-2xl text-ivory animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-ember/30">
                    <img
                      src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80"
                      alt="ECHO Hearthstone Dining Room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-widest text-ember font-mono font-medium">
                        Hearth Reservations
                      </span>
                      <span className="text-xs text-white/50">Tonight · Evening Seating</span>
                    </div>
                    <h4 className="font-serif text-lg font-medium text-ivory">
                      ECHO Hearthstone Dining Room
                    </h4>
                    <p className="text-xs text-ivory/60 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-ember shrink-0" />
                      <span>448 Hearthstone Way · 5.0 ★ Sanctuary Seating</span>
                    </p>
                  </div>
                </div>

                {bookingConfirmed && (
                  <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-medium animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Table Confirmed for 2 at {selectedSlot}</span>
                  </div>
                )}
              </div>

              {/* Time Slot Selector Pills */}
              <div className="pt-4">
                <p className="text-xs text-ivory/70 mb-3 font-light">
                  Select preferred dinner seating:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"].map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleBookSlot(slot)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 ${
                          isSelected
                            ? "bg-ember text-charcoal font-semibold shadow-[0_0_15px_rgba(197,143,88,0.7)]"
                            : "bg-white/10 hover:bg-white/20 text-ivory border border-white/10"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        // 2. Menu Recommendation Cards (matches video dish cards)
        if (tool === "browse_menu" || tool === "recommend_items") {
          let items: any[] = [];
          if (Array.isArray(result)) {
            items = result.slice(0, 3);
          } else if (result.items && Array.isArray(result.items)) {
            items = result.items.slice(0, 3);
          } else if (result.highlight) {
            items = [result.highlight, result.complement].filter(Boolean);
          }

          if (items.length === 0) return null;

          return (
            <div key={index} className="space-y-3">
              {result.pairingSuggestion && (
                <div className="bg-ember/15 border border-ember/30 rounded-xl px-4 py-2 text-xs text-ember-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-ember shrink-0" />
                  <span className="font-serif italic">
                    Sommelier Pairing: {result.pairingSuggestion}
                  </span>
                </div>
              )}

              {/* Grid of Dishes with Photography and 1-Click Ordering */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {items.map((item: any) => {
                  const isAdded = addedIds.includes(item.id);
                  const price =
                    item.priceFormatted ||
                    (item.basePriceMinor
                      ? `$${(item.basePriceMinor / 100).toFixed(2)}`
                      : `$${((item.priceMinor || 0) / 100).toFixed(2)}`);

                  return (
                    <div
                      key={item.id}
                      className="bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col justify-between hover:border-ember/50 hover:bg-white/[0.08] transition-all duration-300 shadow-lg group"
                    >
                      <div>
                        {item.imageUrl && (
                          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-2.5 bg-black/40">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {item.category && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-black/70 text-white/90 backdrop-blur-sm">
                                {item.category.name || item.category}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h5 className="font-serif font-medium text-sm text-ivory line-clamp-1">
                            {item.name}
                          </h5>
                          <span className="text-xs font-mono font-semibold text-ember shrink-0">
                            {price}
                          </span>
                        </div>

                        <p className="text-[11px] text-ivory/60 line-clamp-2 font-light leading-relaxed mb-3">
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddDish(item)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          isAdded
                            ? "bg-emerald-500 text-white"
                            : "bg-ember hover:bg-ember-light text-charcoal font-semibold shadow-[0_0_12px_rgba(197,143,88,0.4)]"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Cart</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // 3. Order Status / Kitchen Flow
        if (tool === "check_order_status" || tool === "get_order_status" || result.orderRef) {
          return (
            <div
              key={index}
              className="bg-white/[0.05] backdrop-blur-md border border-ember/25 rounded-2xl p-4 text-ivory space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-ember font-mono">
                  Order Status · #{result.orderRef || "ECH-8492"}
                </span>
                <span className="text-xs font-medium bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {result.status || "Fired on Hearth"}
                </span>
              </div>
              <p className="text-xs text-ivory/70 font-light">
                {result.details || "Your wood-fired dishes are currently being prepared on the white oak hearth embers."}
              </p>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
