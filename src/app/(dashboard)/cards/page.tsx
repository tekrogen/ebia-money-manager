import Link from "next/link";

import { requireOnboardedUser } from "@/features/authentication/server/queries";
import { CardPortfolioTable } from "@/features/cards/components/card-portfolio-table";
import { getCardsForHousehold } from "@/features/cards/server/queries";

export default async function CardsPage() {
  const user = await requireOnboardedUser();
  const cards = await getCardsForHousehold(user.householdId);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Credit cards
          </h1>
          <p className="mt-1 text-sm text-[var(--tk-fg-3)]">
            Showing {cards.length} active card{cards.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/cards/new"
          className="rounded-md bg-[var(--tk-com)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Add card
        </Link>
      </header>
      <CardPortfolioTable cards={cards} />
    </div>
  );
}
