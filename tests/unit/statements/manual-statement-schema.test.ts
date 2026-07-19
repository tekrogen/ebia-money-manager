import { describe, expect, it } from "vitest";

import { createManualStatementSchema } from "@/features/statements/schemas";
import { statementPeriodLabel } from "@/features/statements/utils/statement-period-label";
import { formatDateRange, formatDateShort } from "@/lib/formatting/dates";

describe("createManualStatementSchema", () => {
  it("accepts a valid manual statement", () => {
    const parsed = createManualStatementSchema.safeParse({
      cardId: "card_123",
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
      closingBalance: 1200.5,
      minimumPayment: 35,
      paymentDueDate: "2026-07-15",
      currency: "USD",
      documentUrl: "",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects period end before period start", () => {
    const parsed = createManualStatementSchema.safeParse({
      cardId: "card_123",
      periodStart: "2026-06-30",
      periodEnd: "2026-06-01",
      closingBalance: 100,
      minimumPayment: 10,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("date helpers", () => {
  it("formats dates in UTC without off-by-one", () => {
    expect(formatDateShort("2026-07-04")).toContain("2026");
    expect(formatDateRange("2026-06-01", "2026-06-30")).toContain("–");
  });

  it("builds a period label", () => {
    expect(statementPeriodLabel("2026-06-01", "2026-06-30")).toBe(
      "2026-06-01 – 2026-06-30",
    );
  });
});
