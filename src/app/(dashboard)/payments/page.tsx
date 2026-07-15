import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { findDraftIntent } from "@/features/payments/server/intent-repository";

export default async function PaymentsPage() {
  const user = await requireOnboardedUser();
  const draft = await findDraftIntent(user.id);

  if (draft) {
    redirect(`/payments/new?intentId=${draft.id}`);
  }

  redirect("/payments/runway");
}
