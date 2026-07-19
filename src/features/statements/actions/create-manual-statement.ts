"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOnboardedUser } from "@/features/authentication/server/queries";

import type { StatementActionState } from "./action-state";
import { createManualStatementSchema } from "../schemas";
import { createManualStatement } from "../server/service";

export async function createManualStatementAction(
  _previous: StatementActionState,
  formData: FormData,
): Promise<StatementActionState> {
  const user = await requireOnboardedUser();

  const parsed = createManualStatementSchema.safeParse({
    cardId: formData.get("cardId"),
    periodStart: formData.get("periodStart"),
    periodEnd: formData.get("periodEnd"),
    closingBalance: formData.get("closingBalance"),
    minimumPayment: formData.get("minimumPayment"),
    paymentDueDate: formData.get("paymentDueDate") || "",
    currency: formData.get("currency") || "USD",
    documentUrl: formData.get("documentUrl") || "",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    await createManualStatement({
      userId: user.id,
      householdId: user.householdId,
      data: parsed.data,
    });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not create the statement.",
    };
  }

  const cardId = parsed.data.cardId;
  revalidatePath(`/cards/${cardId}/statements`);
  revalidatePath(`/cards/${cardId}`);
  redirect(`/cards/${cardId}/statements`);
}
