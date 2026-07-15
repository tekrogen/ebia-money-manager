import { describe, it, expect, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function dollars(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

describe("Payment Intent lifecycle (integration)", () => {
  let userId: string;
  let householdId: string;
  let cardId: string;
  let accountId: string;

  beforeAll(async () => {
    await db.runwayItem.deleteMany();
    await db.paymentIntent.deleteMany();
    await db.financialAccount.deleteMany();
    await db.creditCard.deleteMany();
    await db.householdMembership.deleteMany();
    await db.householdMember.deleteMany();
    await db.household.deleteMany();
    await db.user.deleteMany();

    const user = await db.user.create({
      data: { email: "test-payments@example.com", name: "Test User" },
    });
    userId = user.id;

    const household = await db.household.create({
      data: {
        name: "Test Household",
        memberships: { create: { userId: user.id, role: "owner" } },
      },
    });
    householdId = household.id;

    const card = await db.creditCard.create({
      data: {
        householdId,
        name: "Test Visa",
        network: "Visa",
        lastFour: "9999",
        currency: "USD",
        creditLimitMinor: dollars(5000),
        currentBalanceMinor: dollars(2000),
        statementBalanceMinor: dollars(2000),
        minimumPaymentMinor: dollars(50),
        regularAprBps: 1999,
        paymentDueDay: 15,
      },
    });
    cardId = card.id;

    const account = await db.financialAccount.create({
      data: { userId, name: "Test Checking", currency: "USD" },
    });
    accountId = account.id;
  });

  it("creates a draft payment intent", async () => {
    const intent = await db.paymentIntent.create({
      data: {
        userId,
        status: "draft",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    expect(intent.status).toBe("draft");
    expect(intent.userId).toBe(userId);
  });

  it("transitions intent through card → amount → account → submitted", async () => {
    const intent = await db.paymentIntent.create({
      data: {
        userId,
        status: "draft",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    const withCard = await db.paymentIntent.update({
      where: { id: intent.id },
      data: { cardId },
    });
    expect(withCard.cardId).toBe(cardId);

    const withAmount = await db.paymentIntent.update({
      where: { id: intent.id },
      data: { amountType: "minimum", amountMinor: dollars(50), currency: "USD" },
    });
    expect(withAmount.amountMinor).toBe(dollars(50));

    const withAccount = await db.paymentIntent.update({
      where: { id: intent.id },
      data: { accountId },
    });
    expect(withAccount.accountId).toBe(accountId);

    const confirmed = await db.paymentIntent.update({
      where: { id: intent.id },
      data: { status: "submitted", scheduledFor: new Date("2026-08-15") },
    });
    expect(confirmed.status).toBe("submitted");
  });

  it("generates runway items from active cards", async () => {
    await db.runwayItem.deleteMany({ where: { householdId } });

    const cards = await db.creditCard.findMany({
      where: { householdId, status: "active" },
    });

    const items = cards
      .filter((c) => c.minimumPaymentMinor > 0n)
      .map((card) => ({
        householdId,
        cardId: card.id,
        plannedPayDate: "2026-08-15",
        contractualDueDate: "2026-08-15",
        amountMinor: card.minimumPaymentMinor,
        currency: card.currency,
        source: "minimum" as const,
      }));

    await db.runwayItem.createMany({ data: items });

    const runway = await db.runwayItem.findMany({ where: { householdId } });
    expect(runway.length).toBe(1);
    expect(runway[0].amountMinor).toBe(dollars(50));
  });

  it("reschedules a runway item", async () => {
    const item = await db.runwayItem.findFirst({ where: { householdId } });
    expect(item).not.toBeNull();

    const updated = await db.runwayItem.update({
      where: { id: item!.id },
      data: { plannedPayDate: "2026-08-20" },
    });

    expect(updated.plannedPayDate).toBe("2026-08-20");
  });
});
