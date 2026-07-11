import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { getHouseholdMembers } from "@/features/household/server/queries";

export default async function HouseholdSettingsPage() {
  const user = await requireOnboardedUser();
  const members = await getHouseholdMembers(user.householdId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Household
        </h1>
        <p className="mt-1 text-sm text-[var(--tk-fg-3)]">
          Members used for card attribution labels.
        </p>
      </header>
      <ul className="divide-y divide-[var(--tk-border)] rounded-lg border border-[var(--tk-border)] bg-white">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="font-medium">{member.displayName}</span>
            <span className="text-[var(--tk-fg-3)]">{member.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
