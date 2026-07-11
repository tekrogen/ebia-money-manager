import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { AddCardForm } from "@/features/cards/components/add-card-form";
import { getHouseholdMembers } from "@/features/household/server/queries";

export default async function NewCardPage() {
  const user = await requireOnboardedUser();
  const members = await getHouseholdMembers(user.householdId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Add card
        </h1>
        <p className="mt-1 text-sm text-[var(--tk-fg-3)]">
          Manual entry for Phase 01. Aggregator connect comes later.
        </p>
      </header>
      <AddCardForm
        members={members.map((m) => ({
          id: m.id,
          displayName: m.displayName,
        }))}
      />
    </div>
  );
}
