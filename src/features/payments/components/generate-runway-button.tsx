"use client";

import { useActionState } from "react";
import { regenerateRunwayAction } from "../server/actions";
import { initialIntentState } from "../server/action-state";

export function GenerateRunwayButton() {
  const [state, formAction, isPending] = useActionState(
    regenerateRunwayAction,
    initialIntentState,
  );

  return (
    <form action={formAction} className="inline-block">
      {state.message && state.success && (
        <p className="mb-2 text-sm text-green-600">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-[var(--tk-border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--tk-bg-1)] disabled:opacity-50"
      >
        {isPending ? "Generating…" : "Generate from cards"}
      </button>
    </form>
  );
}
