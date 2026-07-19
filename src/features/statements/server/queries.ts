import type { StatementDTO } from "../types";
import { findStatementsByCardId } from "./repository";

function toStatementDTO(row: {
  id: string;
  cardId: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  closingBalanceMinor: bigint;
  minimumPaymentMinor: bigint;
  paymentDueDate: string | null;
  source: string;
  documentUrl: string | null;
}): StatementDTO {
  return {
    id: row.id,
    cardId: row.cardId,
    currency: row.currency,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    closingBalanceMinor: Number(row.closingBalanceMinor),
    minimumPaymentMinor: Number(row.minimumPaymentMinor),
    paymentDueDate: row.paymentDueDate,
    source: row.source as StatementDTO["source"],
    documentUrl: row.documentUrl,
  };
}

export async function getStatementsForCard(
  cardId: string,
): Promise<StatementDTO[]> {
  const rows = await findStatementsByCardId(cardId);
  return rows.map(toStatementDTO);
}
