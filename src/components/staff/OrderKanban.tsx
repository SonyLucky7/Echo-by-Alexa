"use client";

import React, { useState, useEffect } from "react";
import { Flame, Clock, CheckCircle2, Truck, RefreshCw, XCircle } from "lucide-react";
import { FulfillmentStatus, FulfillmentMode } from "@/types";

interface OrderData {
  id: string;
  orderRef: string;
  fulfillmentMode: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  totalMinor: number;
  createdAt: string;
  items: Array<{
    id: string;
    dishName: string;
    variantName?: string;
    quantity: number;
    customizations?: string;
    unitPriceMinor: number;
  }>;
}

export const OrderKanban: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load kitchen orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (orderId: string, nextStatus: FulfillmentStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/staff/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, nextStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error("Failed to advance order:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Group orders into 4 Kanban columns
  const newOrders = orders.filter(
    (o) =>
      o.fulfillmentStatus === FulfillmentStatus.CONFIRMED ||
      o.fulfillmentStatus === FulfillmentStatus.ACCEPTED ||
      o.fulfillmentStatus === FulfillmentStatus.PENDING_PAYMENT
  );

  const preparingOrders = orders.filter(
    (o) => o.fulfillmentStatus === FulfillmentStatus.PREPARING
  );

  const readyOrders = orders.filter(
    (o) => o.fulfillmentStatus === FulfillmentStatus.READY
  );

  const completedOrders = orders.filter(
    (o) =>
      o.fulfillmentStatus === FulfillmentStatus.COMPLETED ||
      o.fulfillmentStatus === FulfillmentStatus.OUT_FOR_DELIVERY ||
      o.fulfillmentStatus === FulfillmentStatus.CANCELLED
  );

  const formatElapsed = (createdStr: string) => {
    const mins = Math.floor((Date.now() - new Date(createdStr).getTime()) / 60000);
    if (mins < 1) return "Just now";
    return `${mins}m ago`;
  };

  const renderOrderCard = (order: OrderData) => {
    const isUpdating = updatingId === order.id;

    return (
      <div
        key={order.id}
        className="bg-charcoal-900 border border-white/10 rounded-2xl p-4 shadow-md space-y-3 hover:border-white/20 transition-all"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono font-semibold text-sm text-ivory">
              {order.orderRef}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-ivory/50 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{formatElapsed(order.createdAt)}</span>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
              order.fulfillmentMode === FulfillmentMode.DINE_IN
                ? "bg-ember/20 text-ember border border-ember/30"
                : order.fulfillmentMode === FulfillmentMode.PICKUP
                ? "bg-forest/20 text-forest-light border border-forest/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}
          >
            {order.fulfillmentMode === FulfillmentMode.DINE_IN && order.tableNumber
              ? `Table ${order.tableNumber}`
              : order.fulfillmentMode}
          </span>
        </div>

        {/* Customer Info */}
        {(order.customerName || order.customerPhone) && (
          <p className="text-xs text-ivory/70 border-t border-white/5 pt-2">
            <span className="text-ivory/40">Guest:</span> {order.customerName || "Diner"} {order.customerPhone ? `(${order.customerPhone})` : ""}
          </p>
        )}

        {/* Items List */}
        <div className="space-y-1.5 text-xs border-t border-white/5 pt-2">
          {order.items.map((item) => {
            let customList: string[] = [];
            try {
              if (item.customizations) {
                const parsed = JSON.parse(item.customizations);
                if (Array.isArray(parsed)) {
                  customList = parsed.map((c: any) => c.optionName || c);
                }
              }
            } catch {}

            return (
              <div key={item.id} className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-medium text-ivory">
                    {item.quantity}x {item.dishName}
                  </span>
                  {item.variantName && (
                    <span className="text-ivory/50 block text-[11px]">
                      Variant: {item.variantName}
                    </span>
                  )}
                  {customList.length > 0 && (
                    <span className="text-ember/80 block text-[11px] italic">
                      + {customList.join(", ")}
                    </span>
                  )}
                </div>
                <span className="font-mono text-ivory/60 text-[11px]">
                  ${((item.unitPriceMinor * item.quantity) / 100).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Total & Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="font-mono font-medium text-xs text-ember">
            Total: ${(order.totalMinor / 100).toFixed(2)}
          </span>

          <div className="flex items-center gap-1.5">
            {order.fulfillmentStatus === FulfillmentStatus.CONFIRMED && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAdvanceStatus(order.id, FulfillmentStatus.PREPARING)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-ember text-charcoal hover:bg-ember-light transition-colors flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5" /> Start Hearth Prep
              </button>
            )}

            {order.fulfillmentStatus === FulfillmentStatus.PREPARING && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAdvanceStatus(order.id, FulfillmentStatus.READY)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-forest text-ivory hover:bg-forest-light transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Plated & Ready
              </button>
            )}

            {order.fulfillmentStatus === FulfillmentStatus.READY && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  handleAdvanceStatus(
                    order.id,
                    order.fulfillmentMode === FulfillmentMode.DELIVERY
                      ? FulfillmentStatus.OUT_FOR_DELIVERY
                      : FulfillmentStatus.COMPLETED
                  )
                }
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/20 text-ivory hover:bg-white/30 transition-colors flex items-center gap-1"
              >
                {order.fulfillmentMode === FulfillmentMode.DELIVERY ? (
                  <>
                    <Truck className="w-3.5 h-3.5" /> Dispatch Courier
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Serve to Guest
                  </>
                )}
              </button>
            )}

            {order.fulfillmentStatus === FulfillmentStatus.OUT_FOR_DELIVERY && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAdvanceStatus(order.id, FulfillmentStatus.COMPLETED)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-forest text-ivory hover:bg-forest-light transition-colors"
              >
                Complete Delivery
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-ivory">
            Kitchen Live Queue
          </h2>
          <p className="text-xs text-ivory/60 font-sans mt-0.5">
            Auto-refreshes every 10 seconds. Advance orders from ticket to hearth fire to table.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-ivory/80 flex items-center gap-1.5 transition-colors border border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Queue
        </button>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 min-w-[1000px]">
        {/* Column 1: New / Confirmed */}
        <div className="bg-charcoal/40 border border-white/10 rounded-2xl p-4 flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-serif text-sm font-medium text-ivory flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Incoming Tickets
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white/10 text-ivory/80">
              {newOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {newOrders.length === 0 ? (
              <p className="text-xs text-ivory/40 font-serif italic text-center py-8">
                No tickets waiting
              </p>
            ) : (
              newOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="bg-charcoal/40 border border-ember/30 rounded-2xl p-4 flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-serif text-sm font-medium text-ember flex items-center gap-2">
              <Flame className="w-4 h-4 animate-pulse" />
              On the Hearth
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-ember/20 text-ember font-semibold">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {preparingOrders.length === 0 ? (
              <p className="text-xs text-ivory/40 font-serif italic text-center py-8">
                Hearth idle
              </p>
            ) : (
              preparingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Column 3: Plated & Ready */}
        <div className="bg-charcoal/40 border border-forest/30 rounded-2xl p-4 flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-serif text-sm font-medium text-forest-light flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Plated & Ready
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-forest/20 text-forest-light font-semibold">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {readyOrders.length === 0 ? (
              <p className="text-xs text-ivory/40 font-serif italic text-center py-8">
                No orders ready for pickup
              </p>
            ) : (
              readyOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Column 4: Completed / Dispatched */}
        <div className="bg-charcoal/40 border border-white/5 rounded-2xl p-4 flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-serif text-sm font-medium text-ivory/60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/20" />
              Dispatched / Closed
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white/5 text-ivory/40">
              {completedOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {completedOrders.length === 0 ? (
              <p className="text-xs text-ivory/40 font-serif italic text-center py-8">
                No closed orders
              </p>
            ) : (
              completedOrders.slice(0, 10).map(renderOrderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
