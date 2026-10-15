"use client";

import React from "react";

export interface CategoryNavProps {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
            selectedCategory === null
              ? "bg-charcoal text-ivory shadow-sm"
              : "bg-cream/70 text-charcoal/70 hover:bg-cream hover:text-charcoal"
          }`}
        >
          All Offerings
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                isSelected
                  ? "bg-charcoal text-ivory shadow-sm"
                  : "bg-cream/70 text-charcoal/70 hover:bg-cream hover:text-charcoal"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
