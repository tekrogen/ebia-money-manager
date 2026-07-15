"use client";

import { useActionState } from "react";
import { selectCardAction } from "../server/actions";
import { initialIntentState } from "../server/action-state";
import type { PaymentCardOption } from "../types";

function formatMoneyFromMinor(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export function SelectCardStep({
  intentId,
  cards,
  onComplete,
}: {
  intentId: string;
  cards: PaymentCardOption[];
  onComplete?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (prev: typeof initialIntentState, formData: FormData) => {
      const result = await selectCardAction(prev, formData);
      if (result.success && onComplete) {
        onComplete();
      }
      return result;
    },
    initialIntentState,
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select a card to pay</h2>

      {state.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="intentId" value={intentId} />

        <div className="grid gap-3">
          {cards.map((card) => (
            <label
              key={card.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--tk-border)] p-3 hover:border-[var(--tk-com)] has-[:checked]:border-[var(--tk-com)] has-[:checked]:bg-[var(--tk-com)]/5"
            >
              <input
                type="radio"
                name="cardId"
                value={card.id}
                className="accent-[var(--tk-com)]"
              />
              <div className="flex-1">
                <p className="font-medium">
                  {card.name}{" "}
                  <span className="text-[var(--tk-fg-3)]">
                    ••{card.lastFour}
                  </span>
                </p>
                <p className="text-sm text-[var(--tk-fg-2)]">
                  {card.ownerLabel} &middot; Balance:{" "}
                  {formatMoneyFromMinor(card.currentBalanceMinor, card.currency)}
                </p>
              </div>
              <div className="text-right text-sm text-[var(--tk-fg-2)]">
                <p>Min: {formatMoneyFromMinor(card.minimumPaymentMinor, card.currency)}</p>
              </div>
            </label>
          ))}
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
