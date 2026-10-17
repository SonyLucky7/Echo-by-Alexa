"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MapPin, Utensils, AlertTriangle, Check, Copy } from "lucide-react";
import { isCancellable } from "@/lib/orders/state-machine";

export interface OrderDetailsProps {
  order: any;
  onOrderUpdated?: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onOrderUpdated }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  let fulfillmentInfo: any = {};
  try {
    fulfillmentInfo = JSON.parse(order.fulfillmentDetails || "{}");
  } catch {}

  const canCancel = isCancellable(order.fulfillmentStatus);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(order.orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelClick = async () => {
    if (!confirm("Are you sure you wish to cancel this dining order?")) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/orders/${order.orderRef}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          reason: "Cancelled by customer through tracking portal",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel order");
      }

      if (onOrderUpdated) onOrderUpdated();
    } catch (err: any) {
      setCancelError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="bg-ivory rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card space-y-6 text-left">
      {/* Header: Meta Bar & Order Reference */}
      <div className="pb-6 border-b border-charcoal/10 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-olive">
            Order Reference
          </span>
          <div className="flex items-center gap-2">
            <Badge
              variant={order.paymentStatus === "PAID" ? "dietary" : "spice"}
              size="sm"
            >
              {order.paymentStatus === "PAID" ? "Paid" : `Payment: ${order.paymentStatus}`}
            </Badge>
            <Badge variant="status" size="sm">
              {order.fulfillmentMode.replace("_", " ")}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <h2 className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-charcoal">
            {order.orderRef}
          </h2>
          <button
            type="button"
            onClick={handleCopyRef}
            className="p-1.5 rounded-lg border border-charcoal/10 hover:bg-cream text-charcoal/60 hover:text-charcoal text-xs transition-colors shrink-0 flex items-center gap-1 font-mono"
            title="Copy Order Reference"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-olive" />
                <span className="text-[11px] text-olive font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fulfillment Destination Card */}
      <div className="bg-cream/45 rounded-2xl p-4 border border-charcoal/10 space-y-2 text-xs text-charcoal/80">
        <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[11px] text-charcoal/60">
          <Utensils className="w-3.5 h-3.5 text-olive shrink-0" />
          <span>
            {order.fulfillmentMode === "DELIVERY"
              ? "Delivery Destination"
              : order.fulfillmentMode === "DINE_IN"
              ? "Table Seating"
              : "Pickup Location"}
          </span>
        </div>

        {order.fulfillmentMode === "DINE_IN" && (
          <div className="pt-1 flex items-baseline justify-between">
            <span className="text-charcoal/60">Table Assignment:</span>
            <span className="font-semibold text-charcoal text-sm">
              {fulfillmentInfo.tableNumber || "Main Dining Hearth"}
            </span>
          </div>
        )}

        {order.fulfillmentMode === "PICKUP" && (
          <div className="pt-1 flex items-baseline justify-between">
            <span className="text-charcoal/60">Scheduled Pickup:</span>
            <span className="font-semibold text-charcoal text-sm">
              {fulfillmentInfo.pickupTime || "20 minutes (Standard Hearth Prep)"}
            </span>
          </div>
        )}

        {order.fulfillmentMode === "DELIVERY" && (
          <div className="pt-1 space-y-1">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-ember shrink-0 mt-0.5" />
              <span className="font-medium text-charcoal text-sm leading-snug">
                {fulfillmentInfo.deliveryAddress || "Address on File"}
              </span>
            </div>
          </div>
        )}

        {fulfillmentInfo.deliveryNotes && (
          <p className="text-charcoal/65 italic pt-2 border-t border-charcoal/10 text-[11px]">
            &ldquo;{fulfillmentInfo.deliveryNotes}&rdquo;
          </p>
        )}
      </div>

      {/* Purchased Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-charcoal/10">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
            Purchased Plates
          </h4>
          <span className="text-xs font-mono text-charcoal/50">
            {order.items.length} {order.items.length === 1 ? "Plate" : "Plates"}
          </span>
        </div>

        <div className="divide-y divide-charcoal/5 space-y-3">
          {order.items.map((it: any) => {
            let customizationsList: any[] = [];
            try {
              customizationsList = JSON.parse(it.customizationsSnapshot || "[]");
            } catch {}

            return (
              <div key={it.id} className="pt-3 first:pt-0 flex justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-charcoal text-sm leading-snug">
                    <span className="font-mono text-xs font-bold text-ember mr-1.5">
                      {it.quantity}x
                    </span>
                    {it.itemName}
                  </p>
                  {it.variantName && (
                    <p className="text-olive text-[11px] font-medium pl-5">{it.variantName}</p>
                  )}
                  {customizationsList.map((c: any, idx: number) => (
                    <p key={idx} className="text-charcoal/50 text-[10px] pl-5">
                      + {c.optionName}
                    </p>
                  ))}
                </div>
                <span className="font-serif font-semibold text-charcoal text-sm shrink-0">
                  {formatCurrency(it.totalPriceMinor, order.currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Breakdown & Total Highlight */}
      <div className="pt-4 border-t border-charcoal/10 space-y-2 text-xs text-charcoal/70">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-charcoal font-mono">
            {formatCurrency(order.subtotalMinor, order.currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Sales Tax (8.25%)</span>
          <span className="font-medium text-charcoal font-mono">
            {formatCurrency(order.taxMinor, order.currency)}
          </span>
        </div>
        {order.deliveryFeeMinor > 0 && (
          <div className="flex justify-between text-olive">
            <span>Direct Delivery</span>
            <span className="font-medium font-mono">
              {formatCurrency(order.deliveryFeeMinor, order.currency)}
            </span>
          </div>
        )}
        {order.packagingFeeMinor > 0 && (
          <div className="flex justify-between text-olive">
            <span>Insulated Hearth Packaging</span>
            <span className="font-medium font-mono">
              {formatCurrency(order.packagingFeeMinor, order.currency)}
            </span>
          </div>
        )}

        {/* Grand Total Box */}
        <div className="mt-3 p-4 rounded-2xl bg-charcoal text-ivory flex justify-between items-baseline">
          <div>
            <span className="font-serif text-sm font-medium block">Total Paid</span>
            <span className="text-[10px] text-ivory/50 uppercase tracking-widest font-mono">
              Verified Transaction
            </span>
          </div>
          <span className="font-serif text-2xl font-bold text-ember-light">
            {formatCurrency(order.totalMinor, order.currency)}
          </span>
        </div>
      </div>

      {/* Cancellation Option (if eligible) */}
      {canCancel && (
        <div className="pt-3 border-t border-charcoal/10">
          {cancelError && (
            <p className="text-xs text-red-600 mb-2">{cancelError}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelClick}
            isLoading={isCancelling}
            className="text-red-700 hover:bg-red-50 text-xs w-full py-2.5 flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cancel This Order</span>
          </Button>
        </div>
      )}
    </div>
  );
};
