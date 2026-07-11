import Link from "next/link";

import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { PortfolioMetricGrid } from "@/features/overview/components/portfolio-metric-grid";
import { getPortfolioMetrics } from "@/features/overview/server/queries";
import {
  getPaydownDashboard,
  PaydownPriorityPanel,
  PromoPayoffPlanPanel,
} from "@/features/paydown";

export default async function OverviewPage() {
  const user = await requireOnboardedUser();
  const [metrics, paydown] = await Promise.all([
    getPortfolioMetrics(user.householdId),
    getPaydownDashboard(user.householdId),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-1 text-sm text-[var(--tk-fg-3)]">
            Track limits, utilization, and promo deadlines.
          </p>
        </div>
        <Link
          href="/cards/new"
          className="rounded-md bg-[var(--tk-com)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Add card
        </Link>
      </header>

      <PortfolioMetricGrid metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PaydownPriorityPanel items={paydown.priority} />
        <PromoPayoffPlanPanel dashboard={paydown} />
      </div>
    </div>
  );
}
