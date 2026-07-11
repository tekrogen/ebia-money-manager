export function monthsUntilInclusive(endsOn: string, today = new Date()): number {
  const end = new Date(`${endsOn}T00:00:00`);
  if (Number.isNaN(end.getTime()) || end <= today) {
    return 1;
  }
  const years = end.getFullYear() - today.getFullYear();
  const months = years * 12 + (end.getMonth() - today.getMonth());
  const dayAdjust = end.getDate() >= today.getDate() ? 0 : -1;
  return Math.max(1, months + dayAdjust + 1);
}

export function requiredMonthlyPayoffMinor(
  balanceMinor: bigint,
  monthsRemaining: number,
): bigint {
  if (monthsRemaining <= 0) {
    return balanceMinor;
  }
  const months = BigInt(monthsRemaining);
  return (balanceMinor + months - 1n) / months;
}

export function estimateMonthlyInterestMinor(
  balanceMinor: bigint,
  aprBps: number,
): bigint {
  if (balanceMinor <= 0n || aprBps <= 0) {
    return 0n;
  }
  return (balanceMinor * BigInt(aprBps)) / 120000n;
}
