"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/features/authentication/server/queries";
import {
  selectCardSchema,
  selectAmountSchema,
  selectAccountSchema,
  confirmIntentSchema,
  rescheduleRunwayItemSchema,
} from "../schemas";
import {
  createIntent,
  findDraftIntent,
  updateIntentCard,
  updateIntentAmount,
  updateIntentAccount,
  confirmIntent,
  expireStaleIntents,
} from "./intent-repository";
import { rescheduleRunwayItem, generateRunwayFromCards } from "./runway-service";
import { computeAmountMinor } from "../utils/runway-helpers";
import { getPaymentCardOptions } from "./payment-queries";

import type { IntentActionState } from "./action-state";

const INTENT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function startPaymentIntentAction(
  _previous?: IntentActionState,
): Promise<IntentActionState> {
  const user = await requireCurrentUser();

  await expireStaleIntents(user.id);

  const existing = await findDraftIntent(user.id);
  if (existing) {
    redirect(`/payments/new?intentId=${existing.id}`);
  }

  const intent = await createIntent({
    userId: user.id,
    expiresAt: new Date(Date.now() + INTENT_TTL_MS),
  });

  redirect(`/payments/new?intentId=${intent.id}`);
}

export async function selectCardAction(
  _previous: IntentActionState,
  formData: FormData,
): Promise<IntentActionState> {
  const user = await requireCurrentUser();

  const parsed = selectCardSchema.safeParse({
    intentId: formData.get("intentId"),
    cardId: formData.get("cardId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please select a card.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const cards = await getPaymentCardOptions(user.householdId);
  if (!cards.some((c) => c.id === parsed.data.cardId)) {
    return { success: false, message: "Card not found in your household." };
  }

  await updateIntentCard({
    intentId: parsed.data.intentId,
    userId: user.id,
    cardId: parsed.data.cardId,
  });

  return {
    success: true,
    message: "",
    intentId: parsed.data.intentId,
  };
}

export async function selectAmountAction(
  _previous: IntentActionState,
  formData: FormData,
): Promise<IntentActionState> {
  const user = await requireCurrentUser();

  const raw = {
    intentId: formData.get("intentId"),
    amountType: formData.get("amountType"),
    customAmountMinor: formData.get("customAmountMinor")
      ? Number(formData.get("customAmountMinor"))
      : undefined,
  };

  const parsed = selectAmountSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please select a payment amount.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const cardId = formData.get("cardId") as string;
  const cards = await getPaymentCardOptions(user.householdId);
  const card = cards.find((c) => c.id === cardId);

  if (!card) {
    return { success: false, message: "Card not found." };
  }

  const amountMinor = computeAmountMinor(
    parsed.data.amountType,
    card,
    parsed.data.customAmountMinor,
  );

  await updateIntentAmount({
    intentId: parsed.data.intentId,
    userId: user.id,
    amountType: parsed.data.amountType,
    amountMinor: BigInt(amountMinor),
    currency: card.currency,
  });

  return {
    success: true,
    message: "",
    intentId: parsed.data.intentId,
  };
}

export async function selectAccountAction(
  _previous: IntentActionState,
  formData: FormData,
): Promise<IntentActionState> {
  const user = await requireCurrentUser();

  const parsed = selectAccountSchema.safeParse({
    intentId: formData.get("intentId"),
    accountId: formData.get("accountId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please select a payment account.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await updateIntentAccount({
    intentId: parsed.data.intentId,
    userId: user.id,
    accountId: parsed.data.accountId,
  });

  return {
    success: true,
    message: "",
    intentId: parsed.data.intentId,
  };
}

export async function confirmIntentAction(
  _previous: IntentActionState,
  formData: FormData,
): Promise<IntentActionState> {
  const user = await requireCurrentUser();

  const parsed = confirmIntentSchema.safeParse({
    intentId: formData.get("intentId"),
    scheduledFor: formData.get("scheduledFor"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please choose a payment date.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await confirmIntent({
    intentId: parsed.data.intentId,
    userId: user.id,
    scheduledFor: new Date(`${parsed.data.scheduledFor}T00:00:00`),
  });

  revalidatePath("/payments");
  revalidatePath("/payments/runway");
  revalidatePath("/overview");
  redirect("/payments/runway");
}

export async function rescheduleRunwayItemAction(
  _previous: IntentActionState,
  formData: FormData,
): Promise<IntentActionState> {
  const user = await requireCurrentUser();

  const parsed = rescheduleRunwayItemSchema.safeParse({
    itemId: formData.get("itemId"),
    newPlannedPayDate: formData.get("newPlannedPayDate"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid date.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await rescheduleRunwayItem(
    parsed.data.itemId,
    parsed.data.newPlannedPayDate,
    user.householdId,
  );

  revalidatePath("/payments/runway");
  return { success: true, message: "Rescheduled." };
}

export async function regenerateRunwayAction(
  _previous: IntentActionState,
): Promise<IntentActionState> {
  const user = await requireCurrentUser();
  const count = await generateRunwayFromCards(user.householdId);

  revalidatePath("/payments/runway");
  return {
    success: true,
    message: `Generated ${count} runway items from active cards.`,
  };
}
