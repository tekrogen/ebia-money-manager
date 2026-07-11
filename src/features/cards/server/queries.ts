import { db } from "@/lib/db/client";
import { calculateUtilization } from "@/lib/formatting/money";

export type CardListItem = {
  id: string;
  name: string;
  network: string;
  lastFour: string;
  issuerKey: string | null;
  currency: string;
  creditLimitMinor: bigint;
  currentBalanceMinor: bigint;
  availableMinor: bigint;
  utilization: number;
  regularAprBps: number;
  paymentDueDay: number | null;
  minimumPaymentMinor: bigint;
  status: string;
  attribution: "member" | "shared";
  ownerLabel: string;
  promoLabel: string | null;
};

export async function getCardsForHousehold(
  householdId: string,
): Promise<CardListItem[]> {
  const cards = await db.creditCard.findMany({
    where: {
      householdId,
      status: { not: "archived" },
    },
    include: {
      ownerMember: true,
      promoPeriods: {
        where: { status: "active" },
        orderBy: { endsOn: "asc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return cards.map((card) => {
    const available = card.creditLimitMinor - card.currentBalanceMinor;
    const promo = card.promoPeriods[0];
    return {
      id: card.id,
      name: card.name,
      network: card.network,
      lastFour: card.lastFour,
      issuerKey: card.issuerKey,
      currency: card.currency,
      creditLimitMinor: card.creditLimitMinor,
      currentBalanceMinor: card.currentBalanceMinor,
      availableMinor: available > 0n ? available : 0n,
      utilization: calculateUtilization(
        card.currentBalanceMinor,
        card.creditLimitMinor,
      ),
      regularAprBps: card.regularAprBps,
      paymentDueDay: card.paymentDueDay,
      minimumPaymentMinor: card.minimumPaymentMinor,
      status: card.status,
      attribution: card.attribution,
      ownerLabel:
        card.attribution === "shared"
          ? "Shared"
          : (card.ownerMember?.displayName ?? "Unassigned"),
      promoLabel: promo
        ? `0% promo · ends ${promo.endsOn}`
        : null,
    };
  });
}

export async function getCardSummaries(householdId: string) {
  return getCardsForHousehold(householdId);
}
