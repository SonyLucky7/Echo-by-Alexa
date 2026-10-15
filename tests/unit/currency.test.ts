import { describe, it, expect } from "vitest";
import { formatCurrency, calculateTax, addMinorUnits, getMinorUnitDivisor } from "@/lib/currency";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1250, "USD")).toBe("$12.50");
  });
  it("formats INR correctly", () => {
    const formatted = formatCurrency(150000, "INR", "en-IN");
    expect(formatted).toContain("1,500.00");
  });
  it("formats EUR correctly", () => {
    const formatted = formatCurrency(999, "EUR", "de-DE");
    expect(formatted).toContain("9,99");
  });
  it("formats JPY with zero decimals", () => {
    const formatted = formatCurrency(1500, "JPY", "ja-JP");
    expect(formatted).toContain("1,500");
  });
  it("handles zero gracefully", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });
});

describe("calculateTax", () => {
  it("calculates 8.25% tax correctly", () => {
    expect(calculateTax(10000, 825)).toBe(825); // $100.00 * 8.25% = $8.25
  });
  it("rounds correctly without floating point errors", () => {
    expect(calculateTax(1999, 825)).toBe(165); // $19.99 * 8.25% = 1.649175 -> 165 cents
  });
  it("handles zero tax", () => {
    expect(calculateTax(5000, 0)).toBe(0);
  });
});

describe("addMinorUnits", () => {
  it("sums integers accurately", () => {
    expect(addMinorUnits(1250, 800, 350)).toBe(2400);
  });
});

describe("getMinorUnitDivisor", () => {
  it("returns 1 for JPY", () => {
    expect(getMinorUnitDivisor("JPY")).toBe(1);
  });
  it("returns 100 for USD", () => {
    expect(getMinorUnitDivisor("USD")).toBe(100);
  });
});
