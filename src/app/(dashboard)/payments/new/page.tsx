import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { findIntentById } from "@/features/payments/server/intent-repository";
import { getPaymentCardOptions, getFinancialAccounts } from "@/features/payments/server/payment-queries";
import { SelectCardStep } from "@/features/payments/components/select-card-step";
import { SelectAmountStep } from "@/features/payments/components/select-amount-step";
import { SelectAccountStep } from "@/features/payments/components/select-account-step";
import { ConfirmStep } from "@/features/payments/components/confirm-step";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ intentId?: string }>;
}) {
  const user = await requireOnboardedUser();
  const params = await searchParams;

  if (!params.intentId) {
    redirect("/payments/runway");
  }

  const intent = await findIntentById(params.intentId, user.id);
  if (!intent || intent.status !== "draft") {
    redirect("/payments/runway");
  }

  const cards = await getPaymentCardOptions(user.householdId);
  const accounts = await getFinancialAccounts(user.id);

  const currentStep = !intent.cardId
    ? "card"
    : !intent.amountMinor
      ? "amount"
      : !intent.accountId
        ? "account"
        : "confirm";

  const selectedCard = cards.find((c) => c.id === intent.cardId);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        New payment
      </h1>

      <StepIndicator current={currentStep} />

      {currentStep === "card" && (
        <SelectCardStep intentId={intent.id} cards={cards} />
      )}

      {currentStep === "amount" && selectedCard && (
        <SelectAmountStep
          intentId={intent.id}
          cardId={selectedCard.id}
          minimumPaymentMinor={selectedCard.minimumPaymentMinor}
          statementBalanceMinor={selectedCard.statementBalanceMinor}
          currentBalanceMinor={selectedCard.currentBalanceMinor}
          currency={selectedCard.currency}
        />
      )}

      {currentStep === "account" && (
        <SelectAccountStep intentId={intent.id} accounts={accounts} />
      )}

      {currentStep === "confirm" && selectedCard && intent.amountMinor && (
        <ConfirmStep
          intentId={intent.id}
          cardName={selectedCard.name}
          amountMinor={Number(intent.amountMinor)}
          currency={intent.currency ?? "USD"}
          accountName={intent.account?.name ?? "Unknown"}
        />
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: string }) {
  const steps = ["card", "amount", "account", "confirm"];
  const labels = ["Card", "Amount", "Account", "Confirm"];
  const currentIdx = steps.indexOf(current);

  return (
    <nav className="flex gap-2 text-sm">
      {steps.map((step, idx) => (
        <span
          key={step}
          className={`rounded-full px-3 py-1 ${
            idx === currentIdx
              ? "bg-[var(--tk-com)] text-white"
              : idx < currentIdx
                ? "bg-[var(--tk-bg-1)] text-[var(--tk-fg-1)]"
                : "bg-[var(--tk-bg-1)] text-[var(--tk-fg-3)]"
          }`}
        >
          {labels[idx]}
        </span>
      ))}
    </nav>
  );
}
