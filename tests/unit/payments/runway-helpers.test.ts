import { describe, it, expect } from "vitest";
import {
  sortRunwayItems,
  deriveDueDate,
  computeAmountMinor,
} from "@/features/payments/utils/runway-helpers";
import type { RunwayItemDTO } from "@/features/payments/types";

const makeItem = (overrides: Partial<RunwayItemDTO>): RunwayItemDTO => ({
  id: "item-1",
  cardId: "card-1",
  cardName: "Test Card",
  lastFour: "0001",
  ownerLabel: "Marti",
  plannedPayDate: "2026-08-01",
  contractualDueDate: null,
  amountMinor: 10000,
  currency: "USD",
  source: "minimum",
  ...overrides,
});

describe("sortRunwayItems", () => {
  const items: RunwayItemDTO[] = [
    makeItem({ id: "a", amountMinor: 5000, contractualDueDate: "2026-08-15" }),
    makeItem({ id: "b", amountMinor: 20000, contractualDueDate: "2026-08-01" }),
    makeItem({ id: "c", amountMinor: 12000, contractualDueDate: "2026-08-10" }),
  ];

  it("sorts by_due_date ascending", () => {
    const sorted = sortRunwayItems(items, "by_due_date");
    expect(sorted.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts avalanche (highest first)", () => {
    const sorted = sortRunwayItems(items, "avalanche");
    expect(sorted.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts snowball (lowest first)", () => {
    const sorted = sortRunwayItems(items, "snowball");
    expect(sorted.map((i) => i.id)).toEqual(["a", "c", "b"]);
  });
});

describe("deriveDueDate", () => {
  it("returns null for null input", () => {
    expect(deriveDueDate(null)).toBeNull();
  });

  it("returns null for out-of-range day", () => {
    expect(deriveDueDate(0)).toBeNull();
    expect(deriveDueDate(32)).toBeNull();
  });

  it("returns a valid YYYY-MM-DD string", () => {
    const result = deriveDueDate(15);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("computeAmountMinor", () => {
  const card = {
    minimumPaymentMinor: 5000,
    statementBalanceMinor: 150000,
    currentBalanceMinor: 175000,
  };

  it("returns minimum payment", () => {
    expect(computeAmountMinor("minimum", card)).toBe(5000);
  });

  it("returns statement balance", () => {
    expect(computeAmountMinor("statement", card)).toBe(150000);
  });

  it("returns current balance", () => {
    expect(computeAmountMinor("current", card)).toBe(175000);
  });

  it("returns custom amount when provided", () => {
    expect(computeAmountMinor("custom", card, 7500)).toBe(7500);
  });

  it("returns 0 for custom without value", () => {
    expect(computeAmountMinor("custom", card)).toBe(0);
  });
});
