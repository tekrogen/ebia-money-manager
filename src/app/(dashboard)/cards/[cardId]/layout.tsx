import { notFound } from "next/navigation";

import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { getCardById } from "@/features/cards";
import { CardDetailTabs } from "@/features/cards/components/card-detail-tabs";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ cardId: string }>;
};

export default async function CardDetailLayout({
  children,
  params,
}: LayoutProps) {
  const user = await requireOnboardedUser();
  const { cardId } = await params;
  const card = await getCardById(cardId, user.householdId);

  if (!card) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-[var(--tk-fg-3)]">
          {card.network} ···{card.lastFour} · {card.ownerLabel}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          {card.name}
        </h1>
      </header>
      <CardDetailTabs card={card} />
      {children}
    </div>
  );
}
