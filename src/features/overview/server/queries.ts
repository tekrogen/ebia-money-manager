import { getCardSummaries } from "@/features/cards/server/queries";
import { calculateUtilization } from "@/lib/formatting/money";

export type PortfolioMetrics = {
  currency: string;
  totalBalanceMinor: bigint;
  totalLimitMinor: bigint;
  availableCreditMinor: bigint;
  shelteredPromoMinor: bigint;
  cardCount: number;
  promoCardCount: number;
  overallUtilization: number;
  minPaymentsDueMinor: bigint;
  nextPromoEndsOn: string | null;
};

export async function getPortfolioMetrics(
  householdId: string,
): Promise<PortfolioMetrics> {
  const cards = await getCardSummaries(householdId);

  const currency = cards[0]?.currency ?? "USD";
  let totalBalanceMinor = 0n;
  let totalLimitMinor = 0n;
  let minPaymentsDueMinor = 0n;
  let shelteredPromoMinor = 0n;
  let promoCardCount = 0;
  let nextPromoEndsOn: string | null = null;

  for (const card of cards) {
    totalBalanceMinor += card.currentBalanceMinor;
    totalLimitMinor += card.creditLimitMinor;
    minPaymentsDueMinor += card.minimumPaymentMinor;
    if (card.promoLabel) {
      promoCardCount += 1;
      const ends = card.promoLabel.replace("0% promo · ends ", "");
      if (!nextPromoEndsOn || ends < nextPromoEndsOn) {
        nextPromoEndsOn = ends;
      }
    }
  }

  // Sheltered promo balance comes from active promo periods.
  const { db } = await import("@/lib/db/client");
  const promos = await db.promoPeriod.findMany({
    where: {
      status: "active",
      card: { householdId, status: { not: "archived" } },
    },
  });
  for (const promo of promos) {
    shelteredPromoMinor += promo.shelteredBalanceMinor;
  }

  const availableCreditMinor =
    totalLimitMinor > totalBalanceMinor
      ? totalLimitMinor - totalBalanceMinor
      : 0n;

  return {
    currency,
    totalBalanceMinor,
    totalLimitMinor,
    availableCreditMinor,
    shelteredPromoMinor,
    cardCount: cards.length,
    promoCardCount,
    overallUtilization: calculateUtilization(totalBalanceMinor, totalLimitMinor),
    minPaymentsDueMinor,
    nextPromoEndsOn,
  };
}
