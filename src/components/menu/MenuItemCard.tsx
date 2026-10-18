"use client";

import React from "react";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/Badge";
import { Flame, Plus } from "lucide-react";

export interface MenuItemCardProps {
  item: {
    id: string;
    slug: string;
    name: string;
    description: string;
    basePriceMinor: number;
    spiceLevel: number;
    cookingTechnique: string;
    dietaryFlags: string[];
    imageUrl: string;
    category?: { name: string };
    isSignature?: boolean;
    isFeatured?: boolean;
  };
  onSelect: (item: any) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-cream/40 rounded-3xl p-5 border border-charcoal/10 flex flex-col justify-between group cursor-pointer hover:shadow-card hover:border-charcoal/20 transition-all duration-300 text-left"
      data-testid="menu-item-card"
    >
      <div>
        {/* Dish Photography */}
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-4 bg-sand">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {item.isSignature && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-charcoal text-ivory">
              Signature
            </span>
          )}
          {item.category && (
            <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-ivory/90 backdrop-blur-xs text-olive">
              {item.category.name}
            </span>
          )}
        </div>

        {/* Title & Price Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-serif text-xl font-medium text-charcoal group-hover:text-ember transition-colors leading-snug">
            {item.name}
          </h3>
          <span className="font-serif text-lg font-semibold text-charcoal shrink-0">
            {formatCurrency(item.basePriceMinor, "USD")}
          </span>
        </div>

        {/* Description */}
        <p className="text-charcoal/65 text-xs sm:text-sm font-light leading-relaxed line-clamp-2 mb-4">
          {item.description}
        </p>
      </div>

      {/* Dietary Flags & Action Button */}
      <div className="pt-3 border-t border-charcoal/5 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap items-center gap-1">
          {item.spiceLevel > 0 && (
            <span className="inline-flex items-center text-ember mr-1" title={`Spice level: ${item.spiceLevel}/3`}>
              {Array.from({ length: item.spiceLevel }).map((_, i) => (
                <Flame key={i} className="w-3 h-3 fill-ember" />
              ))}
            </span>
          )}
          {item.dietaryFlags.slice(0, 2).map((flag) => (
            <Badge key={flag} variant="dietary" size="sm">
              {flag.replace("_", " ")}
            </Badge>
          ))}
          {item.dietaryFlags.length > 2 && (
            <span className="text-[10px] text-charcoal/40 font-medium">
              +{item.dietaryFlags.length - 2}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item);
          }}
          className="p-2 rounded-full bg-charcoal text-ivory group-hover:bg-ember transition-colors shrink-0 shadow-xs"
          aria-label={`Customize and order ${item.name}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
