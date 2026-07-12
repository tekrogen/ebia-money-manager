import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createManualCard } from "@/features/cards/server/service";
import { getHouseholdMembers } from "@/features/household/server/queries";
import { db } from "@/lib/db/client";

describe("createManualCard + household attribution", () => {
  let householdId: string;
  let userId: string;
  let memberId: string;
  let otherHouseholdMemberId: string;

  beforeAll(async () => {
    const user = await db.user.create({
      data: {
        email: "integration@example.com",
        name: "Integration User",
        preference: { create: { displayCurrency: "USD" } },
      },
    });
    userId = user.id;

    const household = await db.household.create({
      data: {
        name: "Integration Household",
        memberships: {
          create: { userId: user.id, role: "owner" },
        },
      },
    });
    householdId = household.id;

    const member = await db.householdMember.create({
      data: {
        householdId,
        displayName: "Marti",
        userId: user.id,
        role: "owner",
      },
    });
    memberId = member.id;

    const otherHousehold = await db.household.create({
      data: { name: "Other Household" },
    });
    const outsider = await db.householdMember.create({
      data: {
        householdId: otherHousehold.id,
        displayName: "Outsider",
        role: "member",
      },
    });
    otherHouseholdMemberId = outsider.id;
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("creates a shared card with null owner", async () => {
    const card = await createManualCard({
      householdId,
      userId,
      data: {
        name: "Shared Visa",
        network: "Visa",
        lastFour: "4242",
        currency: "USD",
        creditLimit: 5000,
        currentBalance: 250.5,
        minimumPayment: 25,
        regularAprPercent: 19.99,
        attribution: "shared",
      },
    });

    expect(card.householdId).toBe(householdId);
    expect(card.attribution).toBe("shared");
    expect(card.ownerMemberId).toBeNull();
    expect(card.creditLimitMinor).toBe(500000n);
    expect(card.currentBalanceMinor).toBe(25050n);
    expect(card.regularAprBps).toBe(1999);
  });

  it("creates a member-owned card when owner belongs to household", async () => {
    const card = await createManualCard({
      householdId,
      userId,
      data: {
        name: "Marti Card",
        network: "Mastercard",
        lastFour: "1111",
        currency: "USD",
        creditLimit: 2000,
        currentBalance: 0,
        minimumPayment: 0,
        regularAprPercent: 0,
        attribution: "member",
        ownerMemberId: memberId,
      },
    });

    expect(card.ownerMemberId).toBe(memberId);
    expect(card.attribution).toBe("member");
  });

  it("rejects an owner member from a different household", async () => {
    await expect(
      createManualCard({
        householdId,
        userId,
        data: {
          name: "Bad Owner",
          network: "Visa",
          lastFour: "9999",
          currency: "USD",
          creditLimit: 1000,
          currentBalance: 0,
          minimumPayment: 0,
          regularAprPercent: 0,
          attribution: "member",
          ownerMemberId: otherHouseholdMemberId,
        },
      }),
    ).rejects.toThrow("Owner member not found in household.");
  });

  it("lists household members for the household only", async () => {
    const members = await getHouseholdMembers(householdId);
    expect(members.map((m) => m.id)).toContain(memberId);
    expect(members.map((m) => m.id)).not.toContain(otherHouseholdMemberId);
  });
});
