import { db } from "@/lib/db/client";

const RESULT_CAP = 5;

export type CardSearchRow = {
  id: string;
  name: string;
  lastFour: string;
  network: string;
  issuerKey: string | null;
  currency: string;
  currentBalanceMinor: bigint;
  attribution: "member" | "shared";
  ownerMember: { displayName: string } | null;
  promoPeriods: { endsOn: string }[];
};

export type StatementSearchRow = {
  id: string;
  cardId: string;
  periodStart: string;
  periodEnd: string;
  closingBalanceMinor: bigint;
  minimumPaymentMinor: bigint;
  currency: string;
  card: { id: string; name: string };
};

export type RunwaySearchRow = {
  id: string;
  amountMinor: bigint;
  currency: string;
  plannedPayDate: string;
  source: string;
  card: { id: string; name: string; lastFour: string };
};

export type IntentSearchRow = {
  id: string;
  amountMinor: bigint | null;
  currency: string | null;
  status: string;
  card: { id: string; name: string; lastFour: string } | null;
};

export async function searchCards(
  query: string,
  householdId: string,
  limit = RESULT_CAP,
): Promise<CardSearchRow[]> {
  return db.creditCard.findMany({
    where: {
      householdId,
      status: { not: "archived" },
      OR: [
        { name: { contains: query } },
        { lastFour: { startsWith: query } },
        { network: { contains: query } },
        { issuerKey: { contains: query } },
      ],
    },
    select: {
      id: true,
      name: true,
      lastFour: true,
      network: true,
      issuerKey: true,
      currency: true,
      currentBalanceMinor: true,
      attribution: true,
      ownerMember: { select: { displayName: true } },
      promoPeriods: {
        where: { status: "active" },
        take: 1,
        orderBy: { endsOn: "asc" },
        select: { endsOn: true },
      },
    },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function searchStatements(
  query: string,
  householdId: string,
  limit = RESULT_CAP,
): Promise<StatementSearchRow[]> {
  return db.statement.findMany({
    where: {
      card: { householdId },
      OR: [
        { card: { name: { contains: query } } },
        { periodStart: { contains: query } },
        { periodEnd: { contains: query } },
      ],
    },
    select: {
      id: true,
      cardId: true,
      periodStart: true,
      periodEnd: true,
      closingBalanceMinor: true,
      minimumPaymentMinor: true,
      currency: true,
      card: { select: { id: true, name: true } },
    },
    take: limit,
    orderBy: { periodEnd: "desc" },
  });
}

export async function searchRunwayItems(
  query: string,
  householdId: string,
  limit = RESULT_CAP,
): Promise<RunwaySearchRow[]> {
  return db.runwayItem.findMany({
    where: {
      householdId,
      OR: [
        { card: { name: { contains: query } } },
        { card: { lastFour: { startsWith: query } } },
        { plannedPayDate: { contains: query } },
      ],
    },
    select: {
      id: true,
      amountMinor: true,
      currency: true,
      plannedPayDate: true,
      source: true,
      card: { select: { id: true, name: true, lastFour: true } },
    },
    take: limit,
    orderBy: { plannedPayDate: "asc" },
  });
}

export async function searchPaymentIntents(
  query: string,
  userId: string,
  limit = RESULT_CAP,
): Promise<IntentSearchRow[]> {
  return db.paymentIntent.findMany({
    where: {
      userId,
      status: { in: ["submitted", "processing"] },
      OR: [
        { card: { name: { contains: query } } },
        { card: { lastFour: { startsWith: query } } },
      ],
    },
    select: {
      id: true,
      amountMinor: true,
      currency: true,
      status: true,
      card: { select: { id: true, name: true, lastFour: true } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
