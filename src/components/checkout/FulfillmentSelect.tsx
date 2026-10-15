"use client";

import React from "react";
import { Utensils, ShoppingBag, Truck } from "lucide-react";

export type FulfillmentType = "DINE_IN" | "PICKUP" | "DELIVERY";

export interface FulfillmentSelectProps {
  value: FulfillmentType;
  onChange: (mode: FulfillmentType) => void;
}

export const FulfillmentSelect: React.FC<FulfillmentSelectProps> = ({
  value,
  onChange,
}) => {
  const modes: Array<{
    type: FulfillmentType;
    label: string;
    sublabel: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    {
      type: "DINE_IN",
      label: "Dine-In Service",
      sublabel: "Order directly to your dining table or private alcove",
      icon: Utensils,
    },
    {
      type: "PICKUP",
      label: "Curbside Pickup",
      sublabel: "Packaged hot in ember-insulated linen carriers (20 min)",
      icon: ShoppingBag,
    },
    {
      type: "DELIVERY",
      label: "Direct Delivery",
      sublabel: "Climate-controlled delivery to your residence ($5.00)",
      icon: Truck,
    },
  ];

  return (
    <div className="space-y-3 text-left">
      <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/70 block">
        Select Fulfillment Channel
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modes.map((m) => {
          const isSelected = value === m.type;
          const Icon = m.icon;
          return (
            <button
              key={m.type}
              type="button"
              onClick={() => onChange(m.type)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? "bg-charcoal text-ivory border-charcoal shadow-sm ring-1 ring-charcoal"
                  : "bg-cream/40 border-charcoal/15 text-charcoal hover:bg-cream"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${isSelected ? "text-ember" : "text-olive"}`} />
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-ember bg-ember" : "border-charcoal/30 bg-ivory"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">{m.label}</p>
                <p
                  className={`text-xs font-light leading-relaxed ${
                    isSelected ? "text-ivory/70" : "text-charcoal/60"
                  }`}
                >
                  {m.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
