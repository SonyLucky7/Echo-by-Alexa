"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, Mail, Utensils, AlertTriangle } from "lucide-react";
import { isCancellable } from "@/lib/orders/state-machine";

export interface OrderDetailsProps {
  order: any;
  onOrderUpdated?: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onOrderUpdated }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  let fulfillmentInfo: any = {};
  try {
    fulfillmentInfo = JSON.parse(order.fulfillmentDetails || "{}");
  } catch {}

  const canCancel = isCancellable(order.fulfillmentStatus);

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
      {/* Reference & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal/10 gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-olive block mb-1">
            Order Reference
          </span>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">
            {order.orderRef}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={order.paymentStatus === "PAID" ? "dietary" : "spice"}
            size="md"
          >
            Payment: {order.paymentStatus}
          </Badge>
          <Badge variant="status" size="md">
            {order.fulfillmentMode.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Fulfillment Destination Info */}
      <div className="bg-cream/40 rounded-2xl p-4 border border-charcoal/10 text-xs space-y-2 text-charcoal/80">
        <div className="flex items-center gap-2 font-medium text-charcoal">
          <Utensils className="w-4 h-4 text-olive" />
          <span>Fulfillment Destination</span>
        </div>

        {order.fulfillmentMode === "DINE_IN" && (
          <p>
            Table Assignment:{" "}
            <span className="font-semibold text-charcoal">
              {fulfillmentInfo.tableNumber || "Direct Dine-In"}
            </span>
          </p>
        )}

        {order.fulfillmentMode === "PICKUP" && (
          <p>
            Scheduled Pickup:{" "}
            <span className="font-semibold text-charcoal">
              {fulfillmentInfo.pickupTime || "20 minutes"}
            </span>
          </p>
        )}

        {order.fulfillmentMode === "DELIVERY" && (
          <p className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-ember shrink-0 mt-0.5" />
            <span>{fulfillmentInfo.deliveryAddress}</span>
          </p>
        )}

        {fulfillmentInfo.deliveryNotes && (
          <p className="text-charcoal/60 italic">
            Notes: "{fulfillmentInfo.deliveryNotes}"
          </p>
        )}
      </div>

      {/* Purchased Items List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
          Purchased Plates ({order.items.length})
        </h4>

        <div className="divide-y divide-charcoal/5 space-y-2">
          {order.items.map((it: any) => {
            let customizationsList: any[] = [];
            try {
              customizationsList = JSON.parse(it.customizationsSnapshot || "[]");
            } catch {}

            return (
              <div key={it.id} className="pt-2 first:pt-0 flex justify-between gap-4 text-xs">
                <div>
                  <p className="font-semibold text-charcoal">
                    {it.quantity}x {it.itemName}
                  </p>
                  {it.variantName && (
                    <p className="text-olive text-[11px] font-medium">{it.variantName}</p>
                  )}
                  {customizationsList.map((c: any, idx: number) => (
                    <p key={idx} className="text-charcoal/50 text-[10px]">
                      + {c.optionName}
                    </p>
                  ))}
                </div>
                <span className="font-serif font-semibold text-charcoal">
                  {formatCurrency(it.totalPriceMinor, order.currency)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="pt-4 border-t border-charcoal/10 space-y-1.5 text-xs text-charcoal/70">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotalMinor, order.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Sales Tax</span>
          <span>{formatCurrency(order.taxMinor, order.currency)}</span>
        </div>
        {order.deliveryFeeMinor > 0 && (
          <div className="flex justify-between">
            <span>Direct Delivery</span>
            <span>{formatCurrency(order.deliveryFeeMinor, order.currency)}</span>
          </div>
        )}
        {order.packagingFeeMinor > 0 && (
          <div className="flex justify-between">
            <span>Insulated Hearth Packaging</span>
            <span>{formatCurrency(order.packagingFeeMinor, order.currency)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-charcoal/10 text-base font-semibold text-charcoal font-serif">
          <span>Total Paid</span>
          <span className="text-xl">{formatCurrency(order.totalMinor, order.currency)}</span>
        </div>
      </div>

      {/* Cancellation Option (if eligible) */}
      {canCancel && (
        <div className="pt-4 border-t border-charcoal/10">
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
