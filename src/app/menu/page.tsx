"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { MenuFilters } from "@/components/menu/MenuFilters";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { DishDetail } from "@/components/menu/DishDetail";
import { Flame, UtensilsCrossed } from "lucide-react";

function MenuContent() {
  const searchParams = useSearchParams();
  const initialItemParam = searchParams.get("item");
  const initialCategoryParam = searchParams.get("category");

  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategoryParam);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [spiceMax, setSpiceMax] = useState<number | null>(null);

  // Active dish detail modal
  const [activeDishId, setActiveDishId] = useState<string | null>(initialItemParam);

  // Fetch categories and items
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchQuery) params.set("q", searchQuery);
    if (selectedDietary.length > 0) params.set("dietary", selectedDietary.join(","));
    if (spiceMax !== null) params.set("spiceMax", spiceMax.toString());

    fetch(`/api/menu?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        setItems(data.items || []);
      })
      .catch((err) => console.error("Error fetching menu:", err))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery, selectedDietary, spiceMax]);

  // Initial load of all categories
  useEffect(() => {
    fetch("/api/menu")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const uniqueCategories: Record<string, any> = {};
        data.items?.forEach((it: any) => {
          if (it.category && !uniqueCategories[it.category.slug]) {
            uniqueCategories[it.category.slug] = it.category;
          }
        });
        setCategories(Object.values(uniqueCategories));
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const handleToggleDietary = (flag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedDietary([]);
    setSpiceMax(null);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || selectedDietary.length > 0 || spiceMax !== null
  );

  const handleAddToCart = async (config: any) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: config.itemId,
          variantId: config.variantId,
          customizations: config.customizations,
          quantity: config.quantity,
        }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("echo:cart-updated"));
      }
    } catch (e) {
      console.error("Failed to add item to cart:", e);
    }
  };

  return (
    <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto text-left">
      {/* Editorial Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
          <Flame className="w-3.5 h-3.5 text-ember" />
          <span>Autumn Hearth Harvest</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-charcoal mb-4">
          The Curated Menu
        </h1>
        <p className="text-charcoal/70 text-sm md:text-base font-light leading-relaxed">
          Every plate is an elemental composition of live ember heat, cold-pressed wild botanicals, and heirloom grains.
        </p>
      </div>

      {/* Category Pills Navigation */}
      <div className="mb-6">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Filter Controls Bar */}
      <div className="mb-10">
        <MenuFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDietary={selectedDietary}
          onToggleDietary={handleToggleDietary}
          spiceMax={spiceMax}
          onSelectSpiceMax={setSpiceMax}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Dish Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-cream/50 rounded-3xl p-5 border border-charcoal/10 h-80" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-cream/30 rounded-3xl border border-charcoal/10">
          <UtensilsCrossed className="w-10 h-10 text-charcoal/30 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-medium text-charcoal mb-1">
            No dishes match your selected filters
          </h3>
          <p className="text-xs text-charcoal/60 mb-6 font-light">
            Try adjusting your dietary flags, search keyword, or spice preferences.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-full bg-charcoal text-ivory text-xs uppercase tracking-wider font-medium hover:bg-charcoal/90"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onSelect={(it) => setActiveDishId(it.id)}
            />
          ))}
        </div>
      )}

      {/* Detailed Customization Modal */}
      <DishDetail
        itemId={activeDishId}
        onClose={() => setActiveDishId(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
