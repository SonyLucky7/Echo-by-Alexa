"use client";

import React from "react";
import { Search, X, Flame } from "lucide-react";
import { DietaryFlag } from "@/types";

export interface MenuFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDietary: string[];
  onToggleDietary: (flag: string) => void;
  spiceMax: number | null;
  onSelectSpiceMax: (spice: number | null) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const MenuFilters: React.FC<MenuFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedDietary,
  onToggleDietary,
  spiceMax,
  onSelectSpiceMax,
  onResetFilters,
  hasActiveFilters,
}) => {
  const dietaryOptions = [
    { label: "Vegetarian", value: DietaryFlag.VEGETARIAN },
    { label: "Vegan", value: DietaryFlag.VEGAN },
    { label: "Gluten-Free", value: DietaryFlag.GLUTEN_FREE },
    { label: "Dairy-Free", value: DietaryFlag.DAIRY_FREE },
    { label: "Halal", value: DietaryFlag.HALAL },
  ];

  return (
    <div className="bg-cream/40 rounded-2xl p-6 border border-charcoal/10 space-y-6 text-left">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by ingredient, dish name, or technique..."
          className="w-full pl-10 pr-9 py-2.5 bg-ivory border border-charcoal/15 rounded-xl text-sm text-charcoal placeholder:text-charcoal/40 outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="p-1 rounded-full text-charcoal/40 hover:text-charcoal absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dietary Flags & Spice Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-charcoal/5">
        {/* Dietary Flags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/60 mr-1">
            Dietary:
          </span>
          {dietaryOptions.map((opt) => {
            const isSelected = selectedDietary.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => onToggleDietary(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-olive text-ivory shadow-xs"
                    : "bg-ivory border border-charcoal/15 text-charcoal/70 hover:bg-cream"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Spice Level Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/60 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-ember" />
            <span>Spice:</span>
          </span>
          <div className="flex gap-1">
            {[
              { label: "All", value: null },
              { label: "Mild", value: 1 },
              { label: "Med", value: 2 },
              { label: "Hot", value: 3 },
            ].map((sp) => {
              const isSelected = spiceMax === sp.value;
              return (
                <button
                  key={sp.label}
                  onClick={() => onSelectSpiceMax(sp.value)}
                  className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-charcoal text-ivory"
                      : "bg-ivory border border-charcoal/10 text-charcoal/70 hover:bg-cream"
                  }`}
                >
                  {sp.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-ember hover:text-charcoal underline underline-offset-4 self-start md:self-auto transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
