export enum FulfillmentMode {
  DINE_IN = "DINE_IN",
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum FulfillmentStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  ACCEPTED = "ACCEPTED",
  PREPARING = "PREPARING",
  READY = "READY",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum DietaryFlag {
  VEGETARIAN = "VEGETARIAN",
  VEGAN = "VEGAN",
  GLUTEN_FREE = "GLUTEN_FREE",
  DAIRY_FREE = "DAIRY_FREE",
  NUT_FREE = "NUT_FREE",
  HALAL = "HALAL",
}

export type SupportedLocale = "en" | "hi" | "te" | "es" | "fr";

export interface SessionContext {
  sessionId: string;
  profileId?: string;
  locale: SupportedLocale;
}

export interface LocalizedText {
  en: string;
  hi?: string;
  te?: string;
  es?: string;
  fr?: string;
}

export interface CartLineSummary {
  id: string;
  itemId: string;
  name: string;
  variantId?: string;
  variantName?: string;
  customizations: Array<{
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceDeltaMinor: number;
  }>;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  imageUrl?: string;
}

export interface CartTotals {
  subtotalMinor: number;
  taxMinor: number;
  deliveryFeeMinor: number;
  packagingFeeMinor: number;
  totalMinor: number;
  currency: string;
  itemCount: number;
  items: CartLineSummary[];
}
