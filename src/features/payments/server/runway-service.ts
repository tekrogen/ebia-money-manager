import { db } from "@/lib/db/client";
import { getOwnerLabel } from "@/features/household";
import { deriveDueDate } from "../utils/runway-helpers";
import type { RunwayItemDTO, RunwayDashboardDTO } from "../types";

export async function getRunwayDashboard(
  householdId: string,
): Promise<RunwayDashboardDTO> {
  const items = await db.runwayItem.findMany({
    where: { householdId },
    orderBy: { plannedPayDate: "asc" },
    include: {
      card: {
        select: {
          id: true,
          name: true,
          lastFour: true,
          attribution: true,
          currency: true,
          paymentDueDay: true,
          ownerMember: { select: { displayName: true } },
        },
      },
    },
  });

  const mapped: RunwayItemDTO[] = items.map((item) => ({
    id: item.id,
    cardId: item.cardId,
    cardName: item.card.name,
    lastFour: item.card.lastFour,
    ownerLabel: getOwnerLabel(
      item.card.attribution as "member" | "shared",
      item.card.ownerMember?.displayName,
    ),
    plannedPayDate: item.plannedPayDate,
    contractualDueDate: item.card.paymentDueDay
      ? deriveDueDate(item.card.paymentDueDay)
      : null,
    amountMinor: Number(item.amountMinor),
    currency: item.currency,
    source: item.source as RunwayItemDTO["source"],
  }));

  const totalMinor = mapped.reduce((sum, i) => sum + i.amountMinor, 0);
  const currency = mapped[0]?.currency ?? "USD";

  return { items: mapped, totalMinor, currency };
}

export async function rescheduleRunwayItem(
  itemId: string,
  newPlannedPayDate: string,
  householdId: string,
) {
  const item = await db.runwayItem.findFirst({
    where: { id: itemId, householdId },
  });
  if (!item) {
    throw new Error("Runway item not found or access denied.");
  }

  return db.runwayItem.update({
    where: { id: itemId },
    data: { plannedPayDate: newPlannedPayDate },
  });
}

export async function generateRunwayFromCards(householdId: string) {
  await db.runwayItem.deleteMany({ where: { householdId } });

  const cards = await db.creditCard.findMany({
    where: { householdId, status: "active" },
    select: {
      id: true,
      minimumPaymentMinor: true,
      paymentDueDay: true,
      currency: true,
    },
  });

  const itemsData = cards
    .filter((c) => c.minimumPaymentMinor > 0n)
    .map((card) => {
      const dueDate = deriveDueDate(card.paymentDueDay);
      const plannedPayDate = dueDate ?? new Date().toISOString().slice(0, 10);
      return {
        householdId,
        cardId: card.id,
        plannedPayDate,
        contractualDueDate: dueDate,
        amountMinor: card.minimumPaymentMinor,
        currency: card.currency,
        source: "minimum" as const,
      };
    });

  if (itemsData.length > 0) {
    await db.runwayItem.createMany({ data: itemsData });
  }

  return itemsData.length;
}
