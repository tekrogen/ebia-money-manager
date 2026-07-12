import { describe, expect, it } from "vitest";

import {
  calculateUtilization,
  formatMoney,
  formatPercent,
} from "@/lib/formatting/money";

describe("formatMoney", () => {
  it("formats USD minor units", () => {
    expect(formatMoney(809769n, "USD")).toBe("$8,097.69");
  });

  it("formats zero", () => {
    expect(formatMoney(0n, "USD")).toBe("$0.00");
  });
});

describe("formatPercent", () => {
  it("formats utilization ratios", () => {
    expect(formatPercent(0.809769)).toBe("81.0%");
    expect(formatPercent(0.3, 0)).toBe("30%");
  });
});

describe("calculateUtilization", () => {
  it("returns balance/limit as a ratio", () => {
    expect(calculateUtilization(3000n, 10000n)).toBe(0.3);
  });

  it("returns 0 when limit is zero or negative", () => {
    expect(calculateUtilization(100n, 0n)).toBe(0);
    expect(calculateUtilization(100n, -1n)).toBe(0);
  });
});
