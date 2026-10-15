export function formatCurrency(
  amountMinor: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const divisor = getMinorUnitDivisor(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: Math.log10(divisor),
    maximumFractionDigits: Math.log10(divisor),
  }).format(amountMinor / divisor);
}

export function getMinorUnitDivisor(currency: string): number {
  const zeroDec = ["JPY", "KRW", "VND", "CLP"];
  if (zeroDec.includes(currency.toUpperCase())) return 1;
  return 100;
}

export function addMinorUnits(...amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + Math.round(a), 0);
}

export function calculateTax(subtotalMinor: number, taxRateBps: number): number {
  return Math.round((subtotalMinor * taxRateBps) / 10000);
}
