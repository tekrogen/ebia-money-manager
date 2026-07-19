import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { getCardById } from "@/features/cards";
import { ManualStatementForm } from "@/features/statements";

type PageProps = {
  params: Promise<{ cardId: string }>;
};

export default async function NewStatementPage({ params }: PageProps) {
  const user = await requireOnboardedUser();
  const { cardId } = await params;
  const card = await getCardById(cardId, user.householdId);

  if (!card) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={`/cards/${cardId}/statements`}
          className="text-sm text-[var(--tk-com)] hover:underline"
        >
          ← Back to statements
        </Link>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">
          Add statement
        </h2>
        <p className="text-sm text-[var(--tk-fg-3)]">
          Record a billing period for {card.name}.
        </p>
      </div>
      <ManualStatementForm cardId={card.id} currency={card.currency} />
    </div>
  );
}
