import { db } from "@/lib/db/client";
import type { FinancialAccountDTO, PaymentCardOption } from "../types";
import { getOwnerLabel } from "@/features/household";

export async function getPaymentCardOptions(
  householdId: string,
): Promise<PaymentCardOption[]> {
  const cards = await db.creditCard.findMany({
    where: { householdId, status: "active" },
    select: {
      id: true,
      name: true,
      lastFour: true,
      attribution: true,
      currentBalanceMinor: true,
      minimumPaymentMinor: true,
      statementBalanceMinor: true,
      currency: true,
      ownerMember: { select: { displayName: true } },
    },
    orderBy: { name: "asc" },
  });

  return cards.map((c) => ({
    id: c.id,
    name: c.name,
    lastFour: c.lastFour,
    ownerLabel: getOwnerLabel(
      c.attribution as "member" | "shared",
      c.ownerMember?.displayName,
    ),
    currentBalanceMinor: Number(c.currentBalanceMinor),
    minimumPaymentMinor: Number(c.minimumPaymentMinor),
    statementBalanceMinor: Number(c.statementBalanceMinor),
    currency: c.currency,
  }));
}

export async function getFinancialAccounts(
  userId: string,
): Promise<FinancialAccountDTO[]> {
  const accounts = await db.financialAccount.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, currency: true },
  });

  return accounts;
}
