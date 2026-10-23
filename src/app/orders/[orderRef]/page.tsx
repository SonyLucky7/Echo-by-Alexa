"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Sparkles, ArrowLeft, RefreshCw } from "lucide-react";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderRef: string }>;
}) {
  const { orderRef } = use(params);
  const searchParams = useSearchParams();
  const isJustConfirmed = searchParams.get("status") === "success";

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) setIsRefreshing(true);
      try {
        const res = await fetch(`/api/orders/${orderRef}`);
        if (!res.ok) {
          throw new Error("Order not found or access expired.");
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [orderRef]
  );

  useEffect(() => {
    fetchOrder();

    // Auto-poll status every 15 seconds while order is active
    const interval = setInterval(() => {
      fetchOrder();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-olive border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-charcoal/60">Retrieving order timeline...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-6">
        <h2 className="font-serif text-2xl font-medium text-charcoal mb-2">
          Unable to Find Order
        </h2>
        <p className="text-xs text-charcoal/60 mb-6 font-light leading-relaxed">
          {error || "The requested order reference could not be located in our records."}
        </p>
        <Link href="/menu">
          <Button variant="primary" size="md">
            Return to Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 md:px-12 max-w-6xl mx-auto text-left">
      {/* Success Celebration Banner */}
      {isJustConfirmed && (
        <div className="mb-8 p-6 bg-olive/10 border border-olive/20 rounded-3xl flex items-start gap-4 text-olive animate-slide-up">
          <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-olive" />
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal">
              Order Confirmed & Payment Verified
            </h3>
            <p className="text-xs text-charcoal/70 leading-relaxed font-light mt-1">
              Thank you for dining with ECHO. Our hearth kitchen has received your ticket and is preparing your seasonal dishes.
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-charcoal/10 gap-4">
        <div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal/60 hover:text-ember mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Curated Menu</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal tracking-tight">
            Live Order Tracking
          </h1>
        </div>

        <button
          onClick={() => fetchOrder(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-charcoal/15 text-xs text-charcoal/70 hover:bg-cream transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-ember" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Status"}</span>
        </button>
      </div>

      {/* Main Grid: Timeline + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-ivory rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card">
          <OrderTimeline
            currentStatus={order.fulfillmentStatus}
            fulfillmentMode={order.fulfillmentMode}
            statusEvents={order.statusEvents || []}
          />
        </div>

        {/* Right: Order Summary Details (5 cols) */}
        <div className="lg:col-span-5">
          <OrderDetails order={order} onOrderUpdated={() => fetchOrder(true)} />
        </div>
      </div>
    </div>
  );
}
