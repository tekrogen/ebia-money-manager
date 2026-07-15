"use client";

import { useActionState } from "react";
import { confirmIntentAction } from "../server/actions";
import { initialIntentState } from "../server/action-state";

function formatMoneyFromMinor(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export function ConfirmStep({
  intentId,
  cardName,
  amountMinor,
  currency,
  accountName,
}: {
  intentId: string;
  cardName: string;
  amountMinor: number;
  currency: string;
  accountName: string;
}) {
  const [state, formAction, isPending] = useActionState(
    confirmIntentAction,
    initialIntentState,
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Confirm payment</h2>

      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <div className="rounded-lg border border-[var(--tk-border)] bg-[var(--tk-bg-1)] p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--tk-fg-2)]">Card</span>
          <span className="font-medium">{cardName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--tk-fg-2)]">Amount</span>
          <span className="font-mono font-medium">
            {formatMoneyFromMinor(amountMinor, currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--tk-fg-2)]">From</span>
          <span className="font-medium">{accountName}</span>
        </div>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="intentId" value={intentId} />

        <label className="block text-sm text-[var(--tk-fg-2)]">
          Payment date
          <input
            type="date"
            name="scheduledFor"
            defaultValue={today}
            min={today}
            className="mt-1 block w-full rounded-md border border-[var(--tk-border)] px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-[var(--tk-com)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Submit payment"}
        </button>
      </form>
    </div>
  );
}
