import { db } from "@/lib/db/client";
import type { CreateManualCardInput } from "@/features/cards/schemas/create-card-schema";

function toMinor(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

export async function createManualCard(input: {
  householdId: string;
  userId: string;
  data: CreateManualCardInput;
}) {
  const { data, householdId } = input;
  const creditLimitMinor = toMinor(data.creditLimit);
  const currentBalanceMinor = toMinor(data.currentBalance);
  const minimumPaymentMinor = toMinor(data.minimumPayment);
  const regularAprBps = Math.round(data.regularAprPercent * 100);

  if (
    data.attribution === "member" &&
    data.ownerMemberId
  ) {
    const member = await db.householdMember.findFirst({
      where: { id: data.ownerMemberId, householdId },
    });
    if (!member) {
      throw new Error("Owner member not found in household.");
    }
  }

  return db.creditCard.create({
    data: {
      householdId,
      ownerMemberId:
        data.attribution === "shared" ? null : data.ownerMemberId ?? null,
      attribution: data.attribution,
      issuerKey: data.issuerKey ?? null,
      name: data.name,
      network: data.network,
      lastFour: data.lastFour,
      currency: data.currency.toUpperCase(),
      creditLimitMinor,
      currentBalanceMinor,
      statementBalanceMinor: currentBalanceMinor,
      minimumPaymentMinor,
      regularAprBps,
      paymentDueDay: data.paymentDueDay ?? null,
      dataSource: "manual",
      syncStatus: "manual",
      status: "active",
    },
  });
}
