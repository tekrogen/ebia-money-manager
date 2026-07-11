import { db } from "@/lib/db/client";
import { calculateUtilization } from "@/lib/formatting/money";
import {
  estimateMonthlyInterestMinor,
  monthsUntilInclusive,
  requiredMonthlyPayoffMinor,
} from "@/features/paydown/utils/promo-math";

const HIGH_UTIL_THRESHOLD = 0.3;

export type PaydownPriorityItem = {
  cardId: string;
  name: string;
  ownerLabel: string;
  utilization: number;
  balanceMinor: bigint;
  currency: string;
  promoEndsOn: string | null;
};

export type PromoPayoffItem = {
  cardId: string;
  name: string;
  ownerLabel: string;
  currency: string;
  balanceMinor: bigint;
  shelteredBalanceMinor: bigint;
  endsOn: string;
  daysLeft: number;
  monthsRemaining: number;
  requiredMonthlyMinor: bigint;
  minimumPaymentMinor: bigint;
  missingMinimum: boolean;
  onTrack: boolean;
  leftoverIfMinOnlyMinor: bigint;
  estimatedInterestMinor: bigint;
  regularAprBpsAfter: number;
};

export type PaydownDashboard = {
  priority: PaydownPriorityItem[];
  promoPayoffPlan: PromoPayoffItem[];
  planTotalRequiredMinor: bigint;
  planTotalMinimumMinor: bigint;
  planShortfallMinor: bigint;
  currency: string;
};

function ownerLabel(
  attribution: "member" | "shared",
  displayName: string | null | undefined,
): string {
  if (attribution === "shared") {
    return "Shared";
  }
  return displayName ?? "Unassigned";
}

export async function getPaydownDashboard(
  householdId: string,
): Promise<PaydownDashboard> {
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
      },
    },
  });

  const currency = cards[0]?.currency ?? "USD";
  const today = new Date();

  const priority = cards
    .map((card) => {
      const utilization = calculateUtilization(
        card.currentBalanceMinor,
        card.creditLimitMinor,
      );
      const promo = card.promoPeriods[0];
      return {
        cardId: card.id,
        name: card.name,
        ownerLabel: ownerLabel(card.attribution, card.ownerMember?.displayName),
        utilization,
        balanceMinor: card.currentBalanceMinor,
        currency: card.currency,
        promoEndsOn: promo?.endsOn ?? null,
      };
    })
    .filter((item) => item.utilization >= HIGH_UTIL_THRESHOLD)
    .sort((a, b) => b.utilization - a.utilization);

  const promoPayoffPlan: PromoPayoffItem[] = [];
  for (const card of cards) {
    for (const promo of card.promoPeriods) {
      const monthsRemaining = monthsUntilInclusive(promo.endsOn, today);
      const end = new Date(`${promo.endsOn}T00:00:00`);
      const daysLeft = Math.max(
        0,
        Math.ceil((end.getTime() - today.getTime()) / 86_400_000),
      );
      const requiredMonthlyMinor = requiredMonthlyPayoffMinor(
        promo.shelteredBalanceMinor,
        monthsRemaining,
      );
      const missingMinimum = card.minimumPaymentMinor <= 0n;
      const leftoverIfMinOnlyMinor = missingMinimum
        ? promo.shelteredBalanceMinor
        : promo.shelteredBalanceMinor -
          card.minimumPaymentMinor * BigInt(monthsRemaining);
      const leftover =
        leftoverIfMinOnlyMinor > 0n ? leftoverIfMinOnlyMinor : 0n;
      const onTrack =
        !missingMinimum && card.minimumPaymentMinor >= requiredMonthlyMinor;

      promoPayoffPlan.push({
        cardId: card.id,
        name: card.name,
        ownerLabel: ownerLabel(card.attribution, card.ownerMember?.displayName),
        currency: card.currency,
        balanceMinor: card.currentBalanceMinor,
        shelteredBalanceMinor: promo.shelteredBalanceMinor,
        endsOn: promo.endsOn,
        daysLeft,
        monthsRemaining,
        requiredMonthlyMinor,
        minimumPaymentMinor: card.minimumPaymentMinor,
        missingMinimum,
        onTrack,
        leftoverIfMinOnlyMinor: leftover,
        estimatedInterestMinor: estimateMonthlyInterestMinor(
          leftover,
          promo.regularAprBpsAfter,
        ),
        regularAprBpsAfter: promo.regularAprBpsAfter,
      });
    }
  }

  promoPayoffPlan.sort((a, b) => a.daysLeft - b.daysLeft);

  const planTotalRequiredMinor = promoPayoffPlan.reduce(
    (sum, item) => sum + item.requiredMonthlyMinor,
    0n,
  );
  const planTotalMinimumMinor = promoPayoffPlan.reduce(
    (sum, item) => sum + item.minimumPaymentMinor,
    0n,
  );
  const planShortfallMinor =
    planTotalRequiredMinor > planTotalMinimumMinor
      ? planTotalRequiredMinor - planTotalMinimumMinor
      : 0n;

  return {
    priority,
    promoPayoffPlan,
    planTotalRequiredMinor,
    planTotalMinimumMinor,
    planShortfallMinor,
    currency,
  };
}
