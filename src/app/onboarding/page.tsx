import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/features/authentication/server/queries";
import { AddCardForm } from "@/features/cards/components/add-card-form";
import { getHouseholdMembers } from "@/features/household/server/queries";

export default async function OnboardingPage() {
  const user = await requireCurrentUser();
  if (user.onboardingComplete) {
    redirect("/overview");
  }

  const members = await getHouseholdMembers(user.householdId);

  return (
    <div className="min-h-full bg-[var(--tk-bg-1)] px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <p className="text-sm text-[var(--tk-com)]">Onboarding</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Add your first card
          </h1>
          <p className="mt-2 text-sm text-[var(--tk-fg-2)]">
            Household attribution is required. Seeded members: Marti and Bob.
          </p>
        </header>
        <div className="rounded-xl border border-[var(--tk-border)] bg-white p-6 shadow-sm">
          <AddCardForm
            members={members.map((m) => ({
              id: m.id,
              displayName: m.displayName,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
