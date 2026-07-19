import { cache } from "react";

import { db } from "@/lib/db/client";
import { calculateUtilization } from "@/lib/formatting/money";
import { getOwnerLabel } from "@/features/household";

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

export type CardDetailItem = {
  id: string;
  name: string;
  network: string;
  lastFour: string;
  currency: string;
  attribution: "member" | "shared";
  ownerLabel: string;
  status: string;
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
      ownerLabel: getOwnerLabel(
        card.attribution,
        card.ownerMember?.displayName,
      ),
      promoLabel: promo
        ? `0% promo · ends ${promo.endsOn}`
        : null,
    };
  });
}

export async function getCardSummaries(householdId: string) {
  return getCardsForHousehold(householdId);
}

export const getCardById = cache(
  async (
    cardId: string,
    householdId: string,
  ): Promise<CardDetailItem | null> => {
    const card = await db.creditCard.findFirst({
      where: { id: cardId, householdId },
      include: { ownerMember: { select: { displayName: true } } },
    });

    if (!card) {
      return null;
    }

    return {
      id: card.id,
      name: card.name,
      network: card.network,
      lastFour: card.lastFour,
      currency: card.currency,
      attribution: card.attribution,
      ownerLabel: getOwnerLabel(
        card.attribution,
        card.ownerMember?.displayName,
      ),
      status: card.status,
    };
  },
);

