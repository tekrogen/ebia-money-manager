"use client";

import { useActionState } from "react";
import { selectAmountAction } from "../server/actions";
import { initialIntentState } from "../server/action-state";

export function SelectAmountStep({
  intentId,
  cardId,
  minimumPaymentMinor,
  statementBalanceMinor,
  currentBalanceMinor,
  currency,
  onComplete,
}: {
  intentId: string;
  cardId: string;
  minimumPaymentMinor: number;
  statementBalanceMinor: number;
  currentBalanceMinor: number;
  currency: string;
  onComplete?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (prev: typeof initialIntentState, formData: FormData) => {
      const result = await selectAmountAction(prev, formData);
      if (result.success && onComplete) {
        onComplete();
      }
      return result;
    },
    initialIntentState,
  );

  function fmt(minor: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(minor / 100);
  }

  const options = [
    { type: "minimum", label: "Minimum payment", amount: minimumPaymentMinor },
    { type: "statement", label: "Statement balance", amount: statementBalanceMinor },
    { type: "current", label: "Current balance", amount: currentBalanceMinor },
    { type: "custom", label: "Custom amount", amount: null },
  ] as const;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Choose payment amount</h2>

      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="intentId" value={intentId} />
        <input type="hidden" name="cardId" value={cardId} />

        <div className="grid gap-3">
          {options.map((opt) => (
            <label
              key={opt.type}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--tk-border)] p-3 hover:border-[var(--tk-com)] has-[:checked]:border-[var(--tk-com)] has-[:checked]:bg-[var(--tk-com)]/5"
            >
              <input
                type="radio"
                name="amountType"
                value={opt.type}
                className="accent-[var(--tk-com)]"
              />
              <span className="flex-1 font-medium">{opt.label}</span>
              {opt.amount !== null && (
                <span className="font-mono text-sm text-[var(--tk-fg-2)]">
                  {fmt(opt.amount)}
                </span>
              )}
            </label>
          ))}
        </div>

        <div className="pt-1">
          <label className="block text-sm text-[var(--tk-fg-2)]">
            Custom amount (cents)
            <input
              type="number"
              name="customAmountMinor"
              min="1"
              placeholder="e.g. 50000 = $500.00"
              className="mt-1 block w-full rounded-md border border-[var(--tk-border)] px-3 py-2 text-sm"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--tk-com)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
