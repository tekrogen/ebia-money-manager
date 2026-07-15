"use client";

import { useActionState } from "react";
import { selectAccountAction } from "../server/actions";
import { initialIntentState } from "../server/action-state";
import type { FinancialAccountDTO } from "../types";

export function SelectAccountStep({
  intentId,
  accounts,
  onComplete,
}: {
  intentId: string;
  accounts: FinancialAccountDTO[];
  onComplete?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (prev: typeof initialIntentState, formData: FormData) => {
      const result = await selectAccountAction(prev, formData);
      if (result.success && onComplete) {
        onComplete();
      }
      return result;
    },
    initialIntentState,
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pay from account</h2>

      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="intentId" value={intentId} />

        <div className="grid gap-3">
          {accounts.map((acct) => (
            <label
              key={acct.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--tk-border)] p-3 hover:border-[var(--tk-com)] has-[:checked]:border-[var(--tk-com)] has-[:checked]:bg-[var(--tk-com)]/5"
            >
              <input
                type="radio"
                name="accountId"
                value={acct.id}
                className="accent-[var(--tk-com)]"
              />
              <span className="font-medium">{acct.name}</span>
            </label>
          ))}
        </div>

        {accounts.length === 0 && (
          <p className="text-sm text-[var(--tk-fg-2)]">
            No linked accounts. Add a payment account in settings.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || accounts.length === 0}
          className="rounded-md bg-[var(--tk-com)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
