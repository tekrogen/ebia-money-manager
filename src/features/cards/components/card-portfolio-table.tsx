import Link from "next/link";

import type { CardListItem } from "@/features/cards/server/queries";
import { formatMoney, formatPercent } from "@/lib/formatting/money";

export function CardPortfolioTable({ cards }: { cards: CardListItem[] }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--tk-border)] bg-white p-8 text-center">
        <p className="text-[var(--tk-fg-2)]">No cards yet.</p>
        <Link
          href="/cards/new"
          className="mt-3 inline-block text-[var(--tk-com)] hover:underline"
        >
          Add your first card
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--tk-border)] bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--tk-border)] bg-[var(--tk-bg-1)] text-[var(--tk-fg-3)]">
          <tr>
            <th className="px-3 py-2 font-medium">Card</th>
            <th className="px-3 py-2 font-medium">Limit</th>
            <th className="px-3 py-2 font-medium">Balance</th>
            <th className="px-3 py-2 font-medium">Available</th>
            <th className="px-3 py-2 font-medium">Util</th>
            <th className="px-3 py-2 font-medium">APR</th>
            <th className="px-3 py-2 font-medium">Due</th>
            <th className="px-3 py-2 font-medium">Min pay</th>
            <th className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => {
            const high = card.utilization >= 0.3;
            return (
              <tr
                key={card.id}
                className="border-b border-[var(--tk-border)] last:border-0"
              >
                <td className="px-3 py-3">
                  <div className="font-medium">
                    <Link
                      href={`/cards/${card.id}`}
                      className="hover:text-[var(--tk-com)] hover:underline"
                    >
                      {card.name}
                    </Link>{" "}
                    <span className="text-[var(--tk-fg-3)]">
                      ({card.ownerLabel})
                    </span>
                  </div>
                  <div className="text-xs text-[var(--tk-fg-3)]">
                    {card.network} ···{card.lastFour}
                    {card.promoLabel ? ` · ${card.promoLabel}` : ""}
                  </div>
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {formatMoney(card.creditLimitMinor, card.currency)}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {formatMoney(card.currentBalanceMinor, card.currency)}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {formatMoney(card.availableMinor, card.currency)}
                </td>
                <td
                  className={`px-3 py-3 tabular-nums ${high ? "text-[var(--tk-danger)]" : ""}`}
                >
                  {formatPercent(card.utilization)}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {(card.regularAprBps / 100).toFixed(2)}%
                </td>
                <td className="px-3 py-3">{card.paymentDueDay ?? "—"}</td>
                <td className="px-3 py-3 tabular-nums">
                  {formatMoney(card.minimumPaymentMinor, card.currency)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      high
                        ? "bg-red-50 text-[var(--tk-danger)]"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {high ? "High util" : "OK"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
