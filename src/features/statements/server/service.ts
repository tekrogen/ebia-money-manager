import type { CreateManualStatementInput } from "../schemas";
import { createStatement, verifyCardInHousehold } from "./repository";

function dollarsToMinor(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

export async function createManualStatement(params: {
  userId: string;
  householdId: string;
  data: CreateManualStatementInput;
}) {
  const card = await verifyCardInHousehold(
    params.data.cardId,
    params.householdId,
  );
  if (!card) {
    throw new Error("Card not found in your household.");
  }

  const paymentDueDate =
    params.data.paymentDueDate && params.data.paymentDueDate.length > 0
      ? params.data.paymentDueDate
      : null;
  const documentUrl =
    params.data.documentUrl && params.data.documentUrl.length > 0
      ? params.data.documentUrl
      : null;

  return createStatement({
    userId: params.userId,
    cardId: params.data.cardId,
    currency: params.data.currency || card.currency,
    periodStart: params.data.periodStart,
    periodEnd: params.data.periodEnd,
    closingBalanceMinor: dollarsToMinor(params.data.closingBalance),
    minimumPaymentMinor: dollarsToMinor(params.data.minimumPayment),
    paymentDueDate,
    documentUrl,
  });
}
