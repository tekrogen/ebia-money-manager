import type { PortfolioMetrics } from "@/features/overview/server/queries";
import { formatMoney, formatPercent } from "@/lib/formatting/money";

export function PortfolioMetricGrid({ metrics }: { metrics: PortfolioMetrics }) {
  const items = [
    {
      label: "Total balance",
      value: formatMoney(metrics.totalBalanceMinor, metrics.currency),
      meta: `of ${formatMoney(metrics.totalLimitMinor, metrics.currency)} total limit across ${metrics.cardCount} cards`,
    },
    {
      label: "Available credit",
      value: formatMoney(metrics.availableCreditMinor, metrics.currency),
      meta: `${formatMoney(metrics.shelteredPromoMinor, metrics.currency)} sheltered at 0% APR across ${metrics.promoCardCount} cards`,
    },
    {
      label: "Overall utilization",
      value: formatPercent(metrics.overallUtilization),
      meta: "Keeping under 30% is generally good for credit scores.",
    },
    {
      label: "Min. payments due / month",
      value: formatMoney(metrics.minPaymentsDueMinor, metrics.currency),
      meta: metrics.nextPromoEndsOn
        ? `Next 0% ends ${metrics.nextPromoEndsOn}`
        : "No active promo end dates",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-lg border border-[var(--tk-border)] bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-[var(--tk-fg-3)]">{item.label}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            {item.value}
          </p>
          <p className="mt-2 text-xs text-[var(--tk-fg-3)]">{item.meta}</p>
        </article>
      ))}
    </div>
  );
}
