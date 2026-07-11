export type Money = {
  amountMinor: bigint;
  currency: string;
};

export function formatMoney(
  amountMinor: bigint,
  currency: string,
  locale = "en-US",
): string {
  const amount = Number(amountMinor) / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatPercent(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function calculateUtilization(
  balanceMinor: bigint,
  limitMinor: bigint,
): number {
  if (limitMinor <= 0n) {
    return 0;
  }
  return Number(balanceMinor) / Number(limitMinor);
}
