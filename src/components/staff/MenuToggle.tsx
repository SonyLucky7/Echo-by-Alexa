"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, X, Flame, RefreshCw, AlertTriangle } from "lucide-react";

interface MenuItemData {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePriceMinor: number;
  imageUrl?: string;
  isAvailable: boolean;
  category: {
    name: string;
  };
}

export const MenuToggle: React.FC = () => {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/staff/menu");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to load menu items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggle = async (itemId: string, currentAvailable: boolean) => {
    setTogglingId(itemId);
    const nextAvailable = !currentAvailable;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, isAvailable: nextAvailable } : it))
    );

    try {
      const res = await fetch("/api/staff/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isAvailable: nextAvailable }),
      });

      if (!res.ok) {
        // Rollback on error
        setItems((prev) =>
          prev.map((it) => (it.id === itemId ? { ...it, isAvailable: currentAvailable } : it))
        );
      }
    } catch (err) {
      console.error("Failed to toggle item availability:", err);
      // Rollback
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, isAvailable: currentAvailable } : it))
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Group by category
  const categories = Array.from(new Set(items.map((it) => it.category?.name || "General")));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-ivory">
            Menu Availability & 86 Management
          </h2>
          <p className="text-xs text-ivory/60 font-sans mt-0.5">
            86ing an item immediately marks it unavailable across the public catalog, cart verification, and AI Concierge.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchItems}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-ivory/80 flex items-center gap-1.5 transition-colors border border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Dishes
        </button>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => {
          const catItems = items.filter((it) => (it.category?.name || "General") === cat);

          return (
            <div key={cat} className="space-y-3">
              <h3 className="font-serif text-lg font-medium text-ember flex items-center gap-2">
                <Flame className="w-4 h-4" />
                {cat}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catItems.map((item) => {
                  const isBusy = togglingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        item.isAvailable
                          ? "bg-charcoal-900 border-white/10 hover:border-white/20"
                          : "bg-red-950/20 border-red-500/30 opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.imageUrl && (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className={`object-cover ${item.isAvailable ? "" : "grayscale"}`}
                              sizes="48px"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-serif font-medium text-sm text-ivory truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-ivory/50 font-mono">
                            ${(item.basePriceMinor / 100).toFixed(2)}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isAvailable ? "bg-forest-light" : "bg-red-400"
                              }`}
                            />
                            <span
                              className={`text-[10px] font-mono uppercase tracking-wider ${
                                item.isAvailable ? "text-forest-light" : "text-red-300"
                              }`}
                            >
                              {item.isAvailable ? "In Service" : "86'd / Sold Out"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggle(item.id, item.isAvailable)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all flex-shrink-0 ${
                          item.isAvailable
                            ? "bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30"
                            : "bg-forest/20 text-forest-light border border-forest/40 hover:bg-forest/30"
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            86 Item
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Restore
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
