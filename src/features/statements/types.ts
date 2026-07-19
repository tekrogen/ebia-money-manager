export type StatementDTO = {
  id: string;
  cardId: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  closingBalanceMinor: number;
  minimumPaymentMinor: number;
  paymentDueDate: string | null;
  source: "manual" | "aggregator" | "import";
  documentUrl: string | null;
};
