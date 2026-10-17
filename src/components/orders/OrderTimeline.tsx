"use client";

import React from "react";
import { Check, Clock, Flame, Utensils, Truck, AlertCircle, Sparkles } from "lucide-react";
import { FulfillmentStatus } from "@/types";

export interface OrderTimelineProps {
  currentStatus: string;
  fulfillmentMode: string;
  statusEvents: Array<{
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
  }>;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStatus,
  fulfillmentMode,
  statusEvents,
}) => {
  const isDelivery = fulfillmentMode === "DELIVERY";

  const stages = [
    {
      key: FulfillmentStatus.CONFIRMED,
      title: "Order Confirmed",
      subtitle: "Secured & authorized by hearth booking",
      icon: Clock,
    },
    {
      key: FulfillmentStatus.ACCEPTED,
      title: "Kitchen Captain Accepted",
      subtitle: "Ticket reviewed & ingredient staging begun",
      icon: Utensils,
    },
    {
      key: FulfillmentStatus.PREPARING,
      title: "Hearth Flame Cooking",
      subtitle: "Roasting over seasoned almond & oak embers",
      icon: Flame,
    },
    {
      key: isDelivery ? FulfillmentStatus.OUT_FOR_DELIVERY : FulfillmentStatus.READY,
      title: isDelivery ? "Out for Delivery" : "Ready for Table / Pickup",
      subtitle: isDelivery
        ? "Courier dispatched in climate-controlled carrier"
        : "Warmly plated and ready for service",
      icon: isDelivery ? Truck : Check,
    },
    {
      key: FulfillmentStatus.COMPLETED,
      title: "Hospitality Concluded",
      subtitle: "Enjoy the elemental sensory feast",
      icon: Check,
    },
  ];

  if (currentStatus === FulfillmentStatus.CANCELLED) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-left flex items-start gap-4 text-red-900 shadow-sm">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-serif text-xl font-medium">Order Cancelled</h4>
          <p className="text-xs text-red-700 leading-relaxed font-light">
            This reservation or order has been cancelled and any processed charge has been refunded according to restaurant policy.
          </p>
        </div>
      </div>
    );
  }

  // Determine stage progression
  const stageOrder = [
    FulfillmentStatus.PENDING_PAYMENT,
    FulfillmentStatus.CONFIRMED,
    FulfillmentStatus.ACCEPTED,
    FulfillmentStatus.PREPARING,
    isDelivery ? FulfillmentStatus.OUT_FOR_DELIVERY : FulfillmentStatus.READY,
    FulfillmentStatus.COMPLETED,
  ];

  const currentIndex = stageOrder.indexOf(currentStatus as FulfillmentStatus);
  const activeStage = stages.find((s) => s.key === currentStatus) || stages[0];

  return (
    <div className="space-y-6 text-left">
      {/* Header with Live Status Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal/10 gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-olive block mb-1">
            Kitchen Progression
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
            Service Journey
          </h3>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream border border-charcoal/10 text-xs text-charcoal/80 font-medium self-start sm:self-auto shadow-sm">
          <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
          <span>Live Hearth Tracking</span>
        </div>
      </div>

      {/* Progress Cards Stack */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const stageIdx = stageOrder.indexOf(stage.key);
          const isPassed = currentIndex > stageIdx && stageIdx !== -1;
          const isCurrent = currentStatus === stage.key;
          const isUpcoming = !isPassed && !isCurrent;
          const Icon = stage.icon;

          // Find timestamp and note if event exists
          const matchingEvent = statusEvents.find((e) => e.status === stage.key);
          const eventTime = matchingEvent
            ? new Date(matchingEvent.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <div
              key={stage.key}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                isCurrent
                  ? "bg-ivory border-ember/50 shadow-[0_4px_24px_rgba(197,143,88,0.15)] ring-1 ring-ember/30"
                  : isPassed
                  ? "bg-cream/50 border-charcoal/10"
                  : "bg-ivory/40 border-charcoal/5 opacity-55"
              }`}
            >
              {/* Step Icon Badge */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isCurrent
                    ? "bg-ember text-ivory shadow-[0_0_15px_rgba(197,143,88,0.45)] ring-2 ring-ember/30"
                    : isPassed
                    ? "bg-olive text-ivory"
                    : "bg-charcoal/5 text-charcoal/40 border border-charcoal/10"
                }`}
              >
                {isPassed ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm sm:text-base font-semibold ${
                        isCurrent
                          ? "text-charcoal font-serif"
                          : isPassed
                          ? "text-charcoal"
                          : "text-charcoal/50"
                      }`}
                    >
                      {stage.title}
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-ember/15 text-charcoal text-[10px] font-mono uppercase tracking-wider font-semibold">
                        Current
                      </span>
                    )}
                  </div>

                  {eventTime && (
                    <span className="text-xs font-mono font-medium text-charcoal/60 bg-cream/80 px-2 py-0.5 rounded-md border border-charcoal/5 shrink-0 self-start sm:self-auto">
                      {eventTime}
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs leading-relaxed font-light ${
                    isCurrent
                      ? "text-charcoal/80"
                      : isPassed
                      ? "text-charcoal/65"
                      : "text-charcoal/40"
                  }`}
                >
                  {stage.subtitle}
                </p>

                {matchingEvent?.note && !matchingEvent.note.toLowerCase().includes("sandbox") && (
                  <div className="mt-2 text-[11px] text-olive font-medium bg-olive/10 border border-olive/20 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                    <span>Captain Note: {matchingEvent.note}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
