"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/features/authentication/server/queries";
import { createManualCardSchema } from "@/features/cards/schemas/create-card-schema";
import { createManualCard } from "@/features/cards/server/service";

import type { CreateCardState } from "./action-state";

export async function createManualCardAction(
  _previous: CreateCardState,
  formData: FormData,
): Promise<CreateCardState> {
  const user = await requireCurrentUser();

  const parsed = createManualCardSchema.safeParse({
    name: formData.get("name"),
    network: formData.get("network"),
    lastFour: formData.get("lastFour"),
    currency: formData.get("currency") || "USD",
    creditLimit: formData.get("creditLimit"),
    currentBalance: formData.get("currentBalance"),
    minimumPayment: formData.get("minimumPayment") || 0,
    regularAprPercent: formData.get("regularAprPercent") || 0,
    paymentDueDay: formData.get("paymentDueDay") || undefined,
    attribution: formData.get("attribution") || "member",
    ownerMemberId: formData.get("ownerMemberId") || null,
    issuerKey: formData.get("issuerKey") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await createManualCard({
      householdId: user.householdId,
      userId: user.id,
      data: parsed.data,
    });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Could not create the card.",
    };
  }

  revalidatePath("/cards");
  revalidatePath("/overview");
  revalidatePath("/onboarding");
  redirect("/cards");
}
