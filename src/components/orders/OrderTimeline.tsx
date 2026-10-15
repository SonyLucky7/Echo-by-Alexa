"use client";

import React from "react";
import { Check, Clock, Flame, Utensils, Truck, AlertCircle } from "lucide-react";
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
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-left flex items-start gap-4 text-red-900">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-serif text-lg font-medium">Order Cancelled</h4>
          <p className="text-xs text-red-700 mt-1 leading-relaxed">
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

  return (
    <div className="space-y-6 text-left">
      <h3 className="font-serif text-xl font-medium text-charcoal">
        Preparation & Service Journey
      </h3>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-charcoal/10">
        {stages.map((stage) => {
          const stageIdx = stageOrder.indexOf(stage.key);
          const isPassed = currentIndex >= stageIdx && stageIdx !== -1;
          const isCurrent = currentStatus === stage.key;
          const Icon = stage.icon;

          // Find timestamp if event exists
          const matchingEvent = statusEvents.find((e) => e.status === stage.key);
          const eventTime = matchingEvent
            ? new Date(matchingEvent.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <div key={stage.key} className="relative group">
              {/* Node Indicator */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCurrent
                    ? "bg-ember border-ember text-ivory ring-4 ring-ember/20 animate-pulse"
                    : isPassed
                    ? "bg-olive border-olive text-ivory"
                    : "bg-ivory border-charcoal/20 text-charcoal/40"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>

              {/* Stage Text */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4
                    className={`text-sm sm:text-base font-semibold ${
                      isCurrent
                        ? "text-ember font-serif text-lg"
                        : isPassed
                        ? "text-charcoal"
                        : "text-charcoal/40"
                    }`}
                  >
                    {stage.title}
                  </h4>
                  <p
                    className={`text-xs font-light leading-relaxed ${
                      isPassed ? "text-charcoal/70" : "text-charcoal/40"
                    }`}
                  >
                    {stage.subtitle}
                  </p>
                </div>
                {eventTime && (
                  <span className="text-xs font-mono text-charcoal/50 shrink-0">
                    {eventTime}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
