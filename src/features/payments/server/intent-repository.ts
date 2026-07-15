import { db } from "@/lib/db/client";
import type { PaymentIntentStatus, AmountType } from "@prisma/client";

export interface CreateIntentParams {
  userId: string;
  expiresAt: Date;
}

export interface UpdateIntentCardParams {
  intentId: string;
  userId: string;
  cardId: string;
}

export interface UpdateIntentAmountParams {
  intentId: string;
  userId: string;
  amountType: AmountType;
  amountMinor: bigint;
  currency: string;
}

export interface UpdateIntentAccountParams {
  intentId: string;
  userId: string;
  accountId: string;
}

export interface ConfirmIntentParams {
  intentId: string;
  userId: string;
  scheduledFor: Date;
}

const INTENT_INCLUDE = {
  card: { select: { id: true, name: true, lastFour: true } },
  account: { select: { id: true, name: true } },
} as const;

export async function createIntent(params: CreateIntentParams) {
  return db.paymentIntent.create({
    data: {
      userId: params.userId,
      status: "draft",
      expiresAt: params.expiresAt,
    },
    include: INTENT_INCLUDE,
  });
}

export async function findDraftIntent(userId: string) {
  return db.paymentIntent.findFirst({
    where: {
      userId,
      status: "draft",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    include: INTENT_INCLUDE,
  });
}

export async function findIntentById(intentId: string, userId: string) {
  return db.paymentIntent.findFirst({
    where: { id: intentId, userId },
    include: INTENT_INCLUDE,
  });
}

export async function updateIntentCard(params: UpdateIntentCardParams) {
  return db.paymentIntent.update({
    where: { id: params.intentId },
    data: { cardId: params.cardId },
    include: INTENT_INCLUDE,
  });
}

export async function updateIntentAmount(params: UpdateIntentAmountParams) {
  return db.paymentIntent.update({
    where: { id: params.intentId },
    data: {
      amountType: params.amountType,
      amountMinor: params.amountMinor,
      currency: params.currency,
    },
    include: INTENT_INCLUDE,
  });
}

export async function updateIntentAccount(params: UpdateIntentAccountParams) {
  return db.paymentIntent.update({
    where: { id: params.intentId },
    data: { accountId: params.accountId },
    include: INTENT_INCLUDE,
  });
}

export async function confirmIntent(params: ConfirmIntentParams) {
  return db.paymentIntent.update({
    where: { id: params.intentId },
    data: {
      status: "submitted",
      scheduledFor: params.scheduledFor,
    },
    include: INTENT_INCLUDE,
  });
}

export async function expireStaleIntents(userId: string) {
  return db.paymentIntent.updateMany({
    where: {
      userId,
      status: "draft",
      expiresAt: { lte: new Date() },
    },
    data: { status: "expired" },
  });
}

export async function getIntentsByStatus(
  userId: string,
  status: PaymentIntentStatus,
) {
  return db.paymentIntent.findMany({
    where: { userId, status },
    orderBy: { createdAt: "desc" },
    include: INTENT_INCLUDE,
  });
}
