import { formatMoney } from "@/lib/formatting/money";
import type { PaydownDashboard } from "@/features/paydown/server/service";

export function PromoPayoffPlanPanel({
  dashboard,
}: {
  dashboard: PaydownDashboard;
}) {
  const { promoPayoffPlan: items, currency } = dashboard;
  const notOnTrack = items.filter((item) => !item.onTrack).length;

  return (
    <section className="rounded-lg border border-[var(--tk-border)] bg-white p-4 shadow-sm">
      <header className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          0% promo payoff plan
        </h2>
        <p className="mt-1 text-sm text-[var(--tk-fg-3)]">
          {items.length === 0
            ? "No active promo periods."
            : `What each promo balance needs per month to reach $0 before regular APR — ${notOnTrack} card${notOnTrack === 1 ? "" : "s"} not on track at the current minimum.`}
        </p>
      </header>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={`${item.cardId}-${item.endsOn}`} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <span className="font-medium">
                  {item.name} ({item.ownerLabel})
                </span>
                <span className="ml-2 rounded-full bg-[var(--tk-bg-3)] px-2 py-0.5 text-xs text-[var(--tk-fg-3)]">
                  {item.daysLeft}d left
                </span>
              </div>
              <div className="text-right text-xs text-[var(--tk-fg-3)] tabular-nums">
                {formatMoney(item.shelteredBalanceMinor, item.currency)} · 0%
                ends {item.endsOn}
              </div>
            </div>
            <p className="mt-1 font-medium">
              Pay {formatMoney(item.requiredMonthlyMinor, item.currency)}/mo (
              {item.monthsRemaining} payment
              {item.monthsRemaining === 1 ? "" : "s"}) to clear it in time.
            </p>
            {item.missingMinimum ? (
              <p className="mt-1 text-[var(--tk-fg-3)]">
                Add this card&apos;s minimum payment to see whether you&apos;re
                on track.
              </p>
            ) : item.onTrack ? (
              <p className="mt-1 text-emerald-700">
                Current minimum of{" "}
                {formatMoney(item.minimumPaymentMinor, item.currency)}/mo is on
                track.
              </p>
            ) : (
              <p className="mt-1 text-[var(--tk-danger)]">
                At the {formatMoney(item.minimumPaymentMinor, item.currency)}/mo
                minimum, ~
                {formatMoney(item.leftoverIfMinOnlyMinor, item.currency)} remains
                — ~
                {formatMoney(item.estimatedInterestMinor, item.currency)}/mo
                interest at {(item.regularAprBpsAfter / 100).toFixed(2)}%.
              </p>
            )}
          </li>
        ))}
      </ul>

      {items.length > 0 ? (
        <div className="mt-4 rounded-md bg-[var(--tk-bg-1)] p-3 text-sm">
          <div className="flex justify-between gap-3 font-medium">
            <span>Minimum payoff plan total</span>
            <span className="tabular-nums">
              {formatMoney(dashboard.planTotalRequiredMinor, currency)}/mo
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--tk-fg-3)]">
            vs {formatMoney(dashboard.planTotalMinimumMinor, currency)} recorded
            minimums
            {dashboard.planShortfallMinor > 0n
              ? ` — ${formatMoney(dashboard.planShortfallMinor, currency)}/mo short`
              : ""}
            .
          </p>
        </div>
      ) : null}
    </section>
  );
}
