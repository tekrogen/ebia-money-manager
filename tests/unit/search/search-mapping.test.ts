import { describe, expect, it } from "vitest";

import {
  mapCardRow,
  mapIntentRow,
  mapRunwayRow,
  mapStatementRow,
} from "@/features/search/server/service";

describe("search result mapping", () => {
  it("maps cards with deep links and formatted balance", () => {
    const item = mapCardRow({
      id: "card_1",
      name: "Amazon Visa",
      lastFour: "1042",
      network: "Visa",
      issuerKey: "chase",
      currency: "USD",
      currentBalanceMinor: 150000n,
      attribution: "shared",
      ownerMember: null,
      promoPeriods: [],
    });

    expect(item.kind).toBe("card");
    expect(item.href).toBe("/cards/card_1");
    expect(item.subtitle).toContain("1042");
    expect(item.subtitle).toContain("Shared");
    expect(item.meta).toContain("$1,500.00");
  });

  it("maps statements to card statements route", () => {
    const item = mapStatementRow({
      id: "stmt_1",
      cardId: "card_1",
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
      closingBalanceMinor: 100000n,
      minimumPaymentMinor: 4000n,
      currency: "USD",
      card: { id: "card_1", name: "Amazon Visa" },
    });

    expect(item.kind).toBe("statement");
    expect(item.href).toBe("/cards/card_1/statements");
    expect(item.subtitle).toContain("$1,000.00");
    expect(item.meta).toBe("2026-06-01 – 2026-06-30");
  });

  it("maps runway and submitted intents to payments runway", () => {
    const runway = mapRunwayRow({
      id: "rw_1",
      amountMinor: 16200n,
      currency: "USD",
      plannedPayDate: "2026-08-01",
      source: "minimum",
      card: { id: "card_1", name: "Amazon Visa", lastFour: "1042" },
    });
    expect(runway.kind).toBe("payment");
    expect(runway.href).toBe("/payments/runway");

    const intent = mapIntentRow({
      id: "pi_1",
      amountMinor: 50000n,
      currency: "USD",
      status: "submitted",
      card: { id: "card_1", name: "Amazon Visa", lastFour: "1042" },
    });
    expect(intent.href).toBe("/payments/runway");
    expect(intent.meta).toBe("submitted");
  });
});
