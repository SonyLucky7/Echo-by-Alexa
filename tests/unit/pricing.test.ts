import { describe, it, expect } from "vitest";
import { calculateCartTotals, calculateLineItemPrice } from "@/lib/cart/pricing";
import { CartLineSummary } from "@/types";

describe("calculateLineItemPrice", () => {
  it("calculates basic variant price without customizations", () => {
    expect(calculateLineItemPrice(1800, [])).toBe(1800);
  });

  it("adds customization price deltas correctly", () => {
    expect(calculateLineItemPrice(1800, [200, 900])).toBe(2900); // $18 + $2 + $9 = $29
  });
});

describe("calculateCartTotals", () => {
  const sampleItems: CartLineSummary[] = [
    {
      id: "line-1",
      itemId: "item-1",
      name: "Beetroot Tartare",
      quantity: 2,
      unitPriceMinor: 2000,
      lineTotalMinor: 4000,
      customizations: [],
    },
    {
      id: "line-2",
      itemId: "item-2",
      name: "Wild Salmon",
      quantity: 1,
      unitPriceMinor: 3800,
      lineTotalMinor: 3800,
      customizations: [],
    },
  ];

  it("calculates subtotal, 8.25% tax, and total accurately", () => {
    const totals = calculateCartTotals(sampleItems);
    expect(totals.subtotalMinor).toBe(7800); // 4000 + 3800 = $78.00
    expect(totals.taxMinor).toBe(644); // 7800 * 825 / 10000 = 643.5 -> 644 cents ($6.44)
    expect(totals.totalMinor).toBe(8444); // 7800 + 644 = $84.44
    expect(totals.itemCount).toBe(3);
    expect(totals.currency).toBe("USD");
  });

  it("handles delivery and packaging fees when enabled", () => {
    const totals = calculateCartTotals(sampleItems, {
      includeDeliveryFee: true,
      includePackagingFee: true,
    });
    expect(totals.deliveryFeeMinor).toBe(500); // $5.00
    expect(totals.packagingFeeMinor).toBe(200); // $2.00
    expect(totals.totalMinor).toBe(7800 + 644 + 500 + 200); // $91.44
  });

  it("handles empty cart gracefully", () => {
    const totals = calculateCartTotals([]);
    expect(totals.subtotalMinor).toBe(0);
    expect(totals.taxMinor).toBe(0);
    expect(totals.totalMinor).toBe(0);
    expect(totals.itemCount).toBe(0);
  });
});
