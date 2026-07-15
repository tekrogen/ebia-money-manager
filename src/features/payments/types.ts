import type { AmountType, PaymentIntentStatus } from "@prisma/client";

export type RunwayStrategy = "avalanche" | "snowball" | "by_due_date";

export interface RunwayItemDTO {
  id: string;
  cardId: string;
  cardName: string;
  lastFour: string;
  ownerLabel: string;
  plannedPayDate: string;
  contractualDueDate: string | null;
  amountMinor: number;
  currency: string;
  source: "minimum" | "promo_plan" | "custom";
}

export interface PaymentIntentDTO {
  id: string;
  cardId: string | null;
  cardName: string | null;
  lastFour: string | null;
  currency: string | null;
  amountType: AmountType | null;
  amountMinor: number | null;
  accountId: string | null;
  accountName: string | null;
  scheduledFor: string | null;
  status: PaymentIntentStatus;
  expiresAt: string;
  createdAt: string;
}

export interface FinancialAccountDTO {
  id: string;
  name: string;
  currency: string;
}

export interface PaymentCardOption {
  id: string;
  name: string;
  lastFour: string;
  ownerLabel: string;
  currentBalanceMinor: number;
  minimumPaymentMinor: number;
  statementBalanceMinor: number;
  currency: string;
}

export interface RunwayDashboardDTO {
  items: RunwayItemDTO[];
  totalMinor: number;
  currency: string;
}

export interface InterestPreview {
  cardId: string;
  monthlyInterestMinor: number;
  annualInterestMinor: number;
  currency: string;
}
