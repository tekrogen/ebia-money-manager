"use client";

import { useActionState } from "react";

import { initialStatementState } from "@/features/statements/actions/action-state";
import { createManualStatementAction } from "@/features/statements/actions/create-manual-statement";

export function ManualStatementForm({
  cardId,
  currency,
}: {
  cardId: string;
  currency: string;
}) {
  const [state, formAction, pending] = useActionState(
    createManualStatementAction,
    initialStatementState,
  );

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-4">
      <input type="hidden" name="cardId" value={cardId} />
      <input type="hidden" name="currency" value={currency} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span>Period start</span>
          <input
            name="periodStart"
            type="date"
            required
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
          {state.fieldErrors?.periodStart?.[0] ? (
            <span className="text-xs text-[var(--tk-danger)]">
              {state.fieldErrors.periodStart[0]}
            </span>
          ) : null}
        </label>
        <label className="block space-y-1 text-sm">
          <span>Period end</span>
          <input
            name="periodEnd"
            type="date"
            required
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
          {state.fieldErrors?.periodEnd?.[0] ? (
            <span className="text-xs text-[var(--tk-danger)]">
              {state.fieldErrors.periodEnd[0]}
            </span>
          ) : null}
        </label>
        <label className="block space-y-1 text-sm">
          <span>Closing balance</span>
          <input
            name="closingBalance"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
          {state.fieldErrors?.closingBalance?.[0] ? (
            <span className="text-xs text-[var(--tk-danger)]">
              {state.fieldErrors.closingBalance[0]}
            </span>
          ) : null}
        </label>
        <label className="block space-y-1 text-sm">
          <span>Minimum payment</span>
          <input
            name="minimumPayment"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={0}
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
          {state.fieldErrors?.minimumPayment?.[0] ? (
            <span className="text-xs text-[var(--tk-danger)]">
              {state.fieldErrors.minimumPayment[0]}
            </span>
          ) : null}
        </label>
        <label className="block space-y-1 text-sm">
          <span>Payment due date</span>
          <input
            name="paymentDueDate"
            type="date"
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Document URL (optional)</span>
          <input
            name="documentUrl"
            type="url"
            placeholder="https://"
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
          {state.fieldErrors?.documentUrl?.[0] ? (
            <span className="text-xs text-[var(--tk-danger)]">
              {state.fieldErrors.documentUrl[0]}
            </span>
          ) : null}
        </label>
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={`text-sm ${
            state.success
              ? "text-[var(--tk-fg-2)]"
              : "text-[var(--tk-danger)]"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        disabled={pending}
        type="submit"
        className="rounded-md bg-[var(--tk-com)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save statement"}
      </button>
    </form>
  );
}
