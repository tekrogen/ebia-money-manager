import { describe, expect, it } from "vitest";

import {
  estimateMonthlyInterestMinor,
  monthsUntilInclusive,
  requiredMonthlyPayoffMinor,
} from "@/features/paydown/utils/promo-math";

describe("monthsUntilInclusive", () => {
  it("counts whole months remaining until the promo end date", () => {
    const today = new Date("2026-07-12T12:00:00");
    expect(monthsUntilInclusive("2026-10-12", today)).toBe(4);
  });

  it("returns at least 1 when the end date is today or past", () => {
    const today = new Date("2026-07-12T12:00:00");
    expect(monthsUntilInclusive("2026-07-12", today)).toBe(1);
    expect(monthsUntilInclusive("2026-01-01", today)).toBe(1);
  });
});

describe("requiredMonthlyPayoffMinor", () => {
  it("ceil-divides balance across remaining months", () => {
    expect(requiredMonthlyPayoffMinor(1000n, 3)).toBe(334n);
    expect(requiredMonthlyPayoffMinor(900n, 3)).toBe(300n);
  });

  it("returns full balance when monthsRemaining is not positive", () => {
    expect(requiredMonthlyPayoffMinor(500n, 0)).toBe(500n);
  });
});

describe("estimateMonthlyInterestMinor", () => {
  it("estimates monthly interest from APR basis points", () => {
    // 2274 bps = 22.74% APR → monthly ≈ balance * 2274 / 120000
    expect(estimateMonthlyInterestMinor(120000n, 2274)).toBe(2274n);
  });

  it("returns 0 for zero balance or APR", () => {
    expect(estimateMonthlyInterestMinor(0n, 2274)).toBe(0n);
    expect(estimateMonthlyInterestMinor(10000n, 0)).toBe(0n);
  });
});
