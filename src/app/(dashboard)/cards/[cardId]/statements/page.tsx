import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { getCardById } from "@/features/cards";
import { StatementList, getStatementsForCard } from "@/features/statements";

type PageProps = {
  params: Promise<{ cardId: string }>;
};

export default async function CardStatementsPage({ params }: PageProps) {
  const user = await requireOnboardedUser();
  const { cardId } = await params;
  const card = await getCardById(cardId, user.householdId);

  if (!card) {
    notFound();
  }

  const statements = await getStatementsForCard(cardId);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Statements</h2>
          <p className="text-sm text-[var(--tk-fg-3)]">
            {statements.length} recorded period
            {statements.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={`/cards/${cardId}/statements/new`}
          className="rounded-md bg-[var(--tk-com)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Add statement
        </Link>
      </div>
      <StatementList statements={statements} />
    </div>
  );
}
