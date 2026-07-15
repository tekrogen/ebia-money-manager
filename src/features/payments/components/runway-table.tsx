"use client";

import { useActionState } from "react";
import { startPaymentIntentAction } from "../server/actions";
import type { RunwayItemDTO } from "../types";

function formatMoneyFromMinor(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export function RunwayTable({
  items,
  totalMinor,
  currency,
}: {
  items: RunwayItemDTO[];
  totalMinor: number;
  currency: string;
}) {
  const [, formAction, isPending] = useActionState(
    startPaymentIntentAction,
    undefined,
  );

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--tk-border)] bg-white p-8 text-center">
        <p className="text-[var(--tk-fg-2)]">
          No runway items yet. Generate from active cards to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-[var(--tk-border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--tk-border)] bg-[var(--tk-bg-1)] text-[var(--tk-fg-3)]">
            <tr>
              <th className="px-3 py-2 font-medium">Card</th>
              <th className="px-3 py-2 font-medium">Owner</th>
              <th className="px-3 py-2 font-medium">Planned date</th>
              <th className="px-3 py-2 font-medium">Due date</th>
              <th className="px-3 py-2 font-medium text-right">Amount</th>
              <th className="px-3 py-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--tk-border)] last:border-0"
              >
                <td className="px-3 py-2 font-medium">
                  {item.cardName}{" "}
                  <span className="text-[var(--tk-fg-3)]">
                    ••{item.lastFour}
                  </span>
                </td>
                <td className="px-3 py-2 text-[var(--tk-fg-2)]">
                  {item.ownerLabel}
                </td>
                <td className="px-3 py-2">{item.plannedPayDate}</td>
                <td className="px-3 py-2 text-[var(--tk-fg-2)]">
                  {item.contractualDueDate ?? "—"}
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {formatMoneyFromMinor(item.amountMinor, item.currency)}
                </td>
                <td className="px-3 py-2">
                  <span className="inline-block rounded bg-[var(--tk-bg-1)] px-2 py-0.5 text-xs text-[var(--tk-fg-3)]">
                    {item.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-[var(--tk-border)] bg-[var(--tk-bg-1)]">
            <tr>
              <td colSpan={4} className="px-3 py-2 font-medium">
                Total upcoming
              </td>
              <td className="px-3 py-2 text-right font-mono font-medium">
                {formatMoneyFromMinor(totalMinor, currency)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--tk-com)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Starting…" : "Make a payment"}
        </button>
      </form>
    </div>
  );
}
