"use client";

import { useActionState } from "react";

import { initialCreateCardState } from "@/features/cards/actions/action-state";
import { createManualCardAction } from "@/features/cards/actions/create-card";

type MemberOption = {
  id: string;
  displayName: string;
};

export function AddCardForm({ members }: { members: MemberOption[] }) {
  const [state, formAction, pending] = useActionState(
    createManualCardAction,
    initialCreateCardState,
  );

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span>Card name</span>
          <input
            name="name"
            required
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
            placeholder="Chase Sapphire"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Network</span>
          <input
            name="network"
            required
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
            placeholder="Visa"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Last four</span>
          <input
            name="lastFour"
            required
            pattern="\d{4}"
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
            placeholder="1234"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Currency</span>
          <input
            name="currency"
            defaultValue="USD"
            maxLength={3}
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Credit limit</span>
          <input
            name="creditLimit"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Current balance</span>
          <input
            name="currentBalance"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Minimum payment</span>
          <input
            name="minimumPayment"
            type="number"
            step="0.01"
            min="0"
            defaultValue={0}
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>APR %</span>
          <input
            name="regularAprPercent"
            type="number"
            step="0.01"
            min="0"
            defaultValue={0}
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Due day (1–31)</span>
          <input
            name="paymentDueDay"
            type="number"
            min="1"
            max="31"
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span>Attribution</span>
          <select
            name="attribution"
            defaultValue="member"
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
          >
            <option value="member">Member</option>
            <option value="shared">Shared</option>
          </select>
        </label>
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span>Owner</span>
          <select
            name="ownerMemberId"
            className="w-full rounded-md border border-[var(--tk-border)] bg-white px-3 py-2"
            defaultValue={members[0]?.id ?? ""}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.message ? (
        <p aria-live="polite" className="text-sm text-[var(--tk-danger)]">
          {state.message}
        </p>
      ) : null}

      <button
        disabled={pending}
        type="submit"
        className="rounded-md bg-[var(--tk-com)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Adding card…" : "Add card"}
      </button>
    </form>
  );
}
