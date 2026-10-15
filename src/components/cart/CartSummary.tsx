"use client";

import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CartTotals } from "@/types";

export interface CartSummaryProps {
  totals: CartTotals;
  onCloseCart?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ totals, onCloseCart }) => {
  return (
    <div className="pt-4 border-t border-charcoal/10 space-y-3 text-left">
      <div className="space-y-1.5 text-xs text-charcoal/70">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-charcoal">
            {formatCurrency(totals.subtotalMinor, totals.currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Sales Tax (8.25%)</span>
          <span className="font-medium text-charcoal">
            {formatCurrency(totals.taxMinor, totals.currency)}
          </span>
        </div>
        {totals.deliveryFeeMinor > 0 && (
          <div className="flex justify-between">
            <span>Direct Delivery</span>
            <span className="font-medium text-charcoal">
              {formatCurrency(totals.deliveryFeeMinor, totals.currency)}
            </span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-charcoal/10 flex justify-between items-baseline">
        <span className="font-serif text-base font-medium text-charcoal">
          Estimated Total
        </span>
        <div className="text-right">
          <span className="font-serif text-xl font-bold text-charcoal">
            {formatCurrency(totals.totalMinor, totals.currency)}
          </span>
          <span className="block text-[10px] text-charcoal/40 uppercase tracking-widest font-mono">
            {totals.currency}
          </span>
        </div>
      </div>

      <Link href="/checkout" onClick={onCloseCart} className="block pt-2">
        <Button variant="ember" size="lg" className="w-full flex items-center justify-center gap-2 py-3.5">
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal/50 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-olive" />
        <span>Authoritative server calculations & secure checkout</span>
      </div>
    </div>
  );
};
