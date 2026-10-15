"use client";

import React from "react";
import { formatCurrency } from "@/lib/currency";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CartLineSummary } from "@/types";

export interface CartItemProps {
  item: CartLineSummary;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="py-4 border-b border-charcoal/10 flex gap-4 items-start text-left">
      {/* Thumbnail */}
      {item.imageUrl && (
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-sand">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-base font-medium text-charcoal truncate">
            {item.name}
          </h4>
          <span className="text-sm font-semibold text-charcoal shrink-0 font-serif">
            {formatCurrency(item.lineTotalMinor, "USD")}
          </span>
        </div>

        {item.variantName && (
          <p className="text-xs text-olive font-medium mt-0.5">
            {item.variantName}
          </p>
        )}

        {item.customizations.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {item.customizations.map((c, i) => (
              <p key={i} className="text-[11px] text-charcoal/60 font-light truncate">
                + {c.optionName}
              </p>
            ))}
          </div>
        )}

        {/* Quantity Controls & Remove */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-charcoal/15 rounded-full bg-cream/40 p-0.5">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-charcoal hover:bg-ivory transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-xs font-semibold text-charcoal">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-charcoal hover:bg-ivory transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded text-charcoal/40 hover:text-red-700 transition-colors"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
