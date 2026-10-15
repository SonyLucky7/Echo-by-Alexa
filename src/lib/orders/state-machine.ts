import { FulfillmentStatus } from "@/types";

const VALID_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  [FulfillmentStatus.PENDING_PAYMENT]: [
    FulfillmentStatus.CONFIRMED,
    FulfillmentStatus.CANCELLED,
  ],
  [FulfillmentStatus.CONFIRMED]: [
    FulfillmentStatus.ACCEPTED,
    FulfillmentStatus.CANCELLED,
  ],
  [FulfillmentStatus.ACCEPTED]: [
    FulfillmentStatus.PREPARING,
    FulfillmentStatus.CANCELLED,
  ],
  [FulfillmentStatus.PREPARING]: [
    FulfillmentStatus.READY,
    FulfillmentStatus.OUT_FOR_DELIVERY,
    FulfillmentStatus.CANCELLED,
  ],
  [FulfillmentStatus.READY]: [FulfillmentStatus.COMPLETED],
  [FulfillmentStatus.OUT_FOR_DELIVERY]: [FulfillmentStatus.COMPLETED],
  [FulfillmentStatus.COMPLETED]: [],
  [FulfillmentStatus.CANCELLED]: [],
};

export function isValidTransition(
  from: FulfillmentStatus | string,
  to: FulfillmentStatus | string
): boolean {
  const allowed = VALID_TRANSITIONS[from as FulfillmentStatus];
  return allowed ? allowed.includes(to as FulfillmentStatus) : false;
}

export function isCancellable(status: FulfillmentStatus | string): boolean {
  return [
    FulfillmentStatus.PENDING_PAYMENT,
    FulfillmentStatus.CONFIRMED,
    FulfillmentStatus.ACCEPTED,
  ].includes(status as FulfillmentStatus);
}
