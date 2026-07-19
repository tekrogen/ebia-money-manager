import { beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

import { search } from "@/features/search/server/service";

const db = new PrismaClient();

function dollars(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

describe("search ownership (integration)", () => {
  let userAId: string;
  let householdAId: string;
  let userBId: string;
  let householdBId: string;

  beforeAll(async () => {
    await db.paymentIntent.deleteMany();
    await db.runwayItem.deleteMany();
    await db.statement.deleteMany();
    await db.promoPeriod.deleteMany();
    await db.creditCard.deleteMany();
    await db.householdMembership.deleteMany();
    await db.householdMember.deleteMany();
    await db.household.deleteMany();
    await db.user.deleteMany();

    const userA = await db.user.create({
      data: { email: "search-a@example.com", name: "Search A" },
    });
    userAId = userA.id;
    const householdA = await db.household.create({
      data: {
        name: "Household A",
        memberships: { create: { userId: userA.id, role: "owner" } },
      },
    });
    householdAId = householdA.id;

    const cardA = await db.creditCard.create({
      data: {
        householdId: householdAId,
        name: "Alpha Sapphire",
        network: "Visa",
        lastFour: "1111",
        currency: "USD",
        creditLimitMinor: dollars(5000),
        currentBalanceMinor: dollars(1000),
      },
    });

    await db.statement.create({
      data: {
        userId: userAId,
        cardId: cardA.id,
        currency: "USD",
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        closingBalanceMinor: dollars(1000),
        minimumPaymentMinor: dollars(40),
      },
    });

    await db.runwayItem.create({
      data: {
        householdId: householdAId,
        cardId: cardA.id,
        plannedPayDate: "2026-08-01",
        amountMinor: dollars(40),
        currency: "USD",
        source: "minimum",
      },
    });

    await db.paymentIntent.create({
      data: {
        userId: userAId,
        cardId: cardA.id,
        currency: "USD",
        amountMinor: dollars(40),
        status: "submitted",
        expiresAt: new Date("2026-12-31"),
      },
    });

    const userB = await db.user.create({
      data: { email: "search-b@example.com", name: "Search B" },
    });
    userBId = userB.id;
    const householdB = await db.household.create({
      data: {
        name: "Household B",
        memberships: { create: { userId: userB.id, role: "owner" } },
      },
    });
    householdBId = householdB.id;

    await db.creditCard.create({
      data: {
        householdId: householdBId,
        name: "Beta Foreign",
        network: "Visa",
        lastFour: "9999",
        currency: "USD",
        creditLimitMinor: dollars(2000),
        currentBalanceMinor: dollars(100),
      },
    });
  });

  it("returns household A cards/statements/payments for user A", async () => {
    const result = await search("Alpha", {
      userId: userAId,
      householdId: householdAId,
    });

    expect(result.groups.cards.map((item) => item.title)).toContain(
      "Alpha Sapphire",
    );
    expect(result.groups.statements.length).toBeGreaterThan(0);
    expect(result.groups.payments.length).toBeGreaterThan(0);
  });

  it("does not leak household A results to household B", async () => {
    const result = await search("Alpha", {
      userId: userBId,
      householdId: householdBId,
    });

    expect(result.totalCount).toBe(0);
  });

  it("does not return other household cards when searching shared tokens", async () => {
    const result = await search("Beta", {
      userId: userAId,
      householdId: householdAId,
    });

    expect(result.groups.cards).toHaveLength(0);
  });
});
