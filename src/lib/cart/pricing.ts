import { calculateTax } from "@/lib/currency";
import { getConfig } from "@/lib/config";
import { CartLineSummary, CartTotals } from "@/types";

export function calculateCartTotals(
  items: CartLineSummary[],
  options?: {
    includeDeliveryFee?: boolean;
    includePackagingFee?: boolean;
  }
): CartTotals {
  const config = getConfig();

  const subtotalMinor = items.reduce(
    (sum, item) => sum + item.unitPriceMinor * item.quantity,
    0
  );

  const taxMinor = calculateTax(subtotalMinor, config.taxRateBps);
  const deliveryFeeMinor = options?.includeDeliveryFee ? 500 : 0; // $5.00
  const packagingFeeMinor = options?.includePackagingFee ? 200 : 0; // $2.00
  const totalMinor = subtotalMinor + taxMinor + deliveryFeeMinor + packagingFeeMinor;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotalMinor,
    taxMinor,
    deliveryFeeMinor,
    packagingFeeMinor,
    totalMinor,
    currency: config.baseCurrency,
    itemCount,
    items,
  };
}

export function calculateLineItemPrice(
  variantPriceMinor: number,
  customizationDeltas: number[]
): number {
  return variantPriceMinor + customizationDeltas.reduce((sum, d) => sum + d, 0);
}
