import { describe, it, expect } from "vitest";
import { isValidTransition, isCancellable } from "@/lib/orders/state-machine";
import { FulfillmentStatus } from "@/types";

describe("Order State Machine", () => {
  it("allows valid forward state transitions", () => {
    expect(
      isValidTransition(FulfillmentStatus.PENDING_PAYMENT, FulfillmentStatus.CONFIRMED)
    ).toBe(true);
    expect(
      isValidTransition(FulfillmentStatus.CONFIRMED, FulfillmentStatus.ACCEPTED)
    ).toBe(true);
    expect(
      isValidTransition(FulfillmentStatus.ACCEPTED, FulfillmentStatus.PREPARING)
    ).toBe(true);
    expect(
      isValidTransition(FulfillmentStatus.PREPARING, FulfillmentStatus.READY)
    ).toBe(true);
    expect(
      isValidTransition(FulfillmentStatus.PREPARING, FulfillmentStatus.OUT_FOR_DELIVERY)
    ).toBe(true);
    expect(
      isValidTransition(FulfillmentStatus.READY, FulfillmentStatus.COMPLETED)
    ).toBe(true);
    expect(
      isValidTransition(FulfillmentStatus.OUT_FOR_DELIVERY, FulfillmentStatus.COMPLETED)
    ).toBe(true);
  });

  it("allows cancellation during initial states", () => {
    expect(
      isValidTransition(FulfillmentStatus.PENDING_PAYMENT, FulfillmentStatus.CANCELLED)
    ).toBe(true);
    expect(
      isValidTransition(FulfillmentStatus.CONFIRMED, FulfillmentStatus.CANCELLED)
    ).toBe(true);
    expect(
      isValidTransition(FulfillmentStatus.ACCEPTED, FulfillmentStatus.CANCELLED)
    ).toBe(true);
  });

  it("blocks illegal retrograde or skipping transitions", () => {
    // Cannot skip from pending directly to completed
    expect(
      isValidTransition(FulfillmentStatus.PENDING_PAYMENT, FulfillmentStatus.COMPLETED)
    ).toBe(false);
    // Cannot go backwards from completed to preparing
    expect(
      isValidTransition(FulfillmentStatus.COMPLETED, FulfillmentStatus.PREPARING)
    ).toBe(false);
    // Cannot cancel an already completed order
    expect(
      isValidTransition(FulfillmentStatus.COMPLETED, FulfillmentStatus.CANCELLED)
    ).toBe(false);
  });

  it("correctly evaluates isCancellable", () => {
    expect(isCancellable(FulfillmentStatus.CONFIRMED)).toBe(true);
    expect(isCancellable(FulfillmentStatus.ACCEPTED)).toBe(true);
    expect(isCancellable(FulfillmentStatus.PREPARING)).toBe(false);
    expect(isCancellable(FulfillmentStatus.COMPLETED)).toBe(false);
    expect(isCancellable(FulfillmentStatus.CANCELLED)).toBe(false);
  });
});
