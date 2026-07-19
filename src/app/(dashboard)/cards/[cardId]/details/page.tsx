import { notFound } from "next/navigation";

import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { getCardById } from "@/features/cards";

type PageProps = {
  params: Promise<{ cardId: string }>;
};

export default async function CardDetailsPage({ params }: PageProps) {
  const user = await requireOnboardedUser();
  const { cardId } = await params;
  const card = await getCardById(cardId, user.householdId);

  if (!card) {
    notFound();
  }

  return (
    <div className="rounded-lg border border-[var(--tk-border)] bg-white p-6 text-sm text-[var(--tk-fg-2)]">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--tk-fg-1)]">
        Details
      </h2>
      <p className="mt-2">
        Card details editing lands in a later slice. Status: {card.status}.
      </p>
    </div>
  );
}
