import { db } from "@/lib/db/client";

export interface CreateStatementParams {
  userId: string;
  cardId: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  closingBalanceMinor: bigint;
  minimumPaymentMinor: bigint;
  paymentDueDate: string | null;
  documentUrl: string | null;
}

export async function verifyCardInHousehold(
  cardId: string,
  householdId: string,
) {
  return db.creditCard.findFirst({
    where: { id: cardId, householdId },
    select: { id: true, currency: true, name: true },
  });
}

export async function createStatement(params: CreateStatementParams) {
  return db.statement.create({
    data: {
      userId: params.userId,
      cardId: params.cardId,
      currency: params.currency,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      closingBalanceMinor: params.closingBalanceMinor,
      minimumPaymentMinor: params.minimumPaymentMinor,
      paymentDueDate: params.paymentDueDate,
      documentUrl: params.documentUrl,
      source: "manual",
    },
  });
}

export async function findStatementsByCardId(
  cardId: string,
  householdId: string,
) {
  return db.statement.findMany({
    where: {
      cardId,
      card: { householdId },
    },
    orderBy: { periodEnd: "desc" },
  });
}

export async function findStatementByPeriod(params: {
  cardId: string;
  periodStart: string;
  periodEnd: string;
}) {
  return db.statement.findFirst({
    where: {
      cardId: params.cardId,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
    },
  });
}
