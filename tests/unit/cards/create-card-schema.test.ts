import { describe, expect, it } from "vitest";

import { createManualCardSchema } from "@/features/cards/schemas/create-card-schema";

describe("createManualCardSchema", () => {
  const valid = {
    name: "Amazon Visa",
    network: "Visa",
    lastFour: "1042",
    currency: "USD",
    creditLimit: 10000,
    currentBalance: 8097.69,
    minimumPayment: 162,
    regularAprPercent: 22.74,
    attribution: "shared" as const,
  };

  it("accepts a valid manual card payload", () => {
    const parsed = createManualCardSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid lastFour", () => {
    const parsed = createManualCardSchema.safeParse({
      ...valid,
      lastFour: "42",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-positive credit limit", () => {
    const parsed = createManualCardSchema.safeParse({
      ...valid,
      creditLimit: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects negative balance", () => {
    const parsed = createManualCardSchema.safeParse({
      ...valid,
      currentBalance: -1,
    });
    expect(parsed.success).toBe(false);
  });
});
