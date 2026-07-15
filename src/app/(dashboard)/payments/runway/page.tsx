import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { getRunwayDashboard } from "@/features/payments/server/runway-service";
import { RunwayTable } from "@/features/payments/components/runway-table";
import { GenerateRunwayButton } from "@/features/payments/components/generate-runway-button";

export default async function PaymentRunwayPage() {
  const user = await requireOnboardedUser();
  const dashboard = await getRunwayDashboard(user.householdId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Payment runway
        </h1>
        <GenerateRunwayButton />
      </div>

      <RunwayTable
        items={dashboard.items}
        totalMinor={dashboard.totalMinor}
        currency={dashboard.currency}
      />
    </div>
  );
}
