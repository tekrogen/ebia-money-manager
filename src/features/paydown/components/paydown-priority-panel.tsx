import { formatMoney, formatPercent } from "@/lib/formatting/money";
import type { PaydownPriorityItem } from "@/features/paydown/server/service";

export function PaydownPriorityPanel({
  items,
}: {
  items: PaydownPriorityItem[];
}) {
  return (
    <section className="rounded-lg border border-[var(--tk-border)] bg-white p-4 shadow-sm">
      <header className="mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Paydown priority
        </h2>
        <p className="mt-1 text-sm text-[var(--tk-fg-3)]">
          {items.length === 0
            ? "No cards at 30%+ utilization."
            : `${items.length} card${items.length === 1 ? "" : "s"} at 30%+ utilization — paying these down first has the biggest credit-score and interest impact.`}
        </p>
      </header>
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li
            key={item.cardId}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <div>
              <span className="mr-2 text-[var(--tk-fg-3)]">{index + 1}.</span>
              <span className="font-medium">
                {item.name} ({item.ownerLabel})
              </span>
              {item.promoEndsOn ? (
                <span className="ml-2 text-xs text-[var(--tk-fg-3)]">
                  0% ends {item.promoEndsOn}
                </span>
              ) : null}
            </div>
            <div className="text-right tabular-nums">
              <div className="font-medium text-[var(--tk-danger)]">
                {formatPercent(item.utilization)}
              </div>
              <div className="text-xs text-[var(--tk-fg-3)]">
                {formatMoney(item.balanceMinor, item.currency)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
