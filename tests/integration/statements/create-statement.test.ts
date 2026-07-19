import { beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

import { createManualStatement } from "@/features/statements/server/service";

const db = new PrismaClient();

function dollars(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

describe("Statements create + ownership (integration)", () => {
  let userId: string;
  let householdId: string;
  let cardId: string;
  let otherHouseholdCardId: string;

  beforeAll(async () => {
    await db.statement.deleteMany();
    await db.creditCard.deleteMany();
    await db.householdMembership.deleteMany();
    await db.householdMember.deleteMany();
    await db.household.deleteMany();
    await db.user.deleteMany();

    const user = await db.user.create({
      data: { email: "statements-test@example.com", name: "Stmt User" },
    });
    userId = user.id;

    const household = await db.household.create({
      data: {
        name: "Stmt Household",
        memberships: { create: { userId: user.id, role: "owner" } },
      },
    });
    householdId = household.id;

    const card = await db.creditCard.create({
      data: {
        householdId,
        name: "Stmt Visa",
        network: "Visa",
        lastFour: "4242",
        currency: "USD",
        creditLimitMinor: dollars(5000),
        currentBalanceMinor: dollars(1000),
        statementBalanceMinor: dollars(1000),
        minimumPaymentMinor: dollars(40),
      },
    });
    cardId = card.id;

    const otherHousehold = await db.household.create({
      data: { name: "Other Household" },
    });
    const otherCard = await db.creditCard.create({
      data: {
        householdId: otherHousehold.id,
        name: "Foreign Card",
        network: "Visa",
        lastFour: "9999",
        currency: "USD",
        creditLimitMinor: dollars(1000),
        currentBalanceMinor: dollars(100),
      },
    });
    otherHouseholdCardId = otherCard.id;
  });

  it("creates a statement with User relation", async () => {
    const created = await createManualStatement({
      userId,
      householdId,
      data: {
        cardId,
        periodStart: "2026-06-01",
        periodEnd: "2026-06-30",
        closingBalance: 1000,
        minimumPayment: 40,
        paymentDueDate: "2026-07-15",
        currency: "USD",
        documentUrl: "",
      },
    });

    expect(created.userId).toBe(userId);
    expect(created.cardId).toBe(cardId);
    expect(created.closingBalanceMinor).toBe(dollars(1000));

    const withUser = await db.statement.findUnique({
      where: { id: created.id },
      include: { user: true },
    });
    expect(withUser?.user.email).toBe("statements-test@example.com");
  });

  it("rejects cards outside the household", async () => {
    await expect(
      createManualStatement({
        userId,
        householdId,
        data: {
          cardId: otherHouseholdCardId,
          periodStart: "2026-06-01",
          periodEnd: "2026-06-30",
          closingBalance: 50,
          minimumPayment: 10,
          currency: "USD",
          documentUrl: "",
        },
      }),
    ).rejects.toThrow(/household/i);
  });
});
