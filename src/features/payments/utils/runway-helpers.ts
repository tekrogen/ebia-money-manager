import type { RunwayItemDTO, RunwayStrategy } from "../types";

export function sortRunwayItems(
  items: RunwayItemDTO[],
  strategy: RunwayStrategy,
): RunwayItemDTO[] {
  const sorted = [...items];

  switch (strategy) {
    case "by_due_date":
      sorted.sort((a, b) => {
        const dateA = a.contractualDueDate ?? a.plannedPayDate;
        const dateB = b.contractualDueDate ?? b.plannedPayDate;
        return dateA.localeCompare(dateB);
      });
      break;

    case "avalanche":
      sorted.sort((a, b) => b.amountMinor - a.amountMinor);
      break;

    case "snowball":
      sorted.sort((a, b) => a.amountMinor - b.amountMinor);
      break;
  }

  return sorted;
}

export function deriveDueDate(paymentDueDay: number | null): string | null {
  if (paymentDueDay == null || paymentDueDay < 1 || paymentDueDay > 31) {
    return null;
  }

  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();

  if (today.getDate() >= paymentDueDay) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.min(paymentDueDay, lastDayOfMonth);

  const yyyy = String(year);
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function computeAmountMinor(
  amountType: "minimum" | "statement" | "current" | "custom",
  card: {
    minimumPaymentMinor: number;
    statementBalanceMinor: number;
    currentBalanceMinor: number;
  },
  customAmountMinor?: number,
): number {
  switch (amountType) {
    case "minimum":
      return card.minimumPaymentMinor;
    case "statement":
      return card.statementBalanceMinor;
    case "current":
      return card.currentBalanceMinor;
    case "custom":
      return customAmountMinor ?? 0;
  }
}
