import { formatMoney } from "@/lib/formatting/money";

import type { SearchGroupsDTO, SearchResultItem } from "../types";
import { emptySearchGroups } from "../types";
import {
  searchCards,
  searchPaymentIntents,
  searchRunwayItems,
  searchStatements,
  type CardSearchRow,
  type IntentSearchRow,
  type RunwaySearchRow,
  type StatementSearchRow,
} from "./queries";

const RESULT_CAP = 5;

export type SearchContext = {
  userId: string;
  householdId: string;
};

function ownerLabel(card: CardSearchRow): string {
  if (card.attribution === "shared") {
    return "Shared";
  }
  return card.ownerMember?.displayName ?? "Member";
}

export function mapCardRow(row: CardSearchRow): SearchResultItem {
  const promo = row.promoPeriods[0];
  return {
    id: `card:${row.id}`,
    kind: "card",
    title: row.name,
    subtitle: `····${row.lastFour} · ${ownerLabel(row)} · ${row.network}`,
    meta: promo
      ? `Promo ends ${promo.endsOn} · ${formatMoney(row.currentBalanceMinor, row.currency)}`
      : formatMoney(row.currentBalanceMinor, row.currency),
    href: `/cards/${row.id}`,
  };
}

export function mapStatementRow(row: StatementSearchRow): SearchResultItem {
  return {
    id: `statement:${row.id}`,
    kind: "statement",
    title: `Statement · ${row.card.name}`,
    subtitle: `${formatMoney(row.closingBalanceMinor, row.currency)} · min ${formatMoney(row.minimumPaymentMinor, row.currency)}`,
    meta: `${row.periodStart} – ${row.periodEnd}`,
    href: `/cards/${row.card.id}/statements`,
  };
}

export function mapRunwayRow(row: RunwaySearchRow): SearchResultItem {
  return {
    id: `runway:${row.id}`,
    kind: "payment",
    title: `Runway · ${row.card.name}`,
    subtitle: `${formatMoney(row.amountMinor, row.currency)} · ····${row.card.lastFour}`,
    meta: `Planned ${row.plannedPayDate}`,
    href: "/payments/runway",
  };
}

export function mapIntentRow(row: IntentSearchRow): SearchResultItem {
  const cardName = row.card?.name ?? "Payment";
  const lastFour = row.card?.lastFour ?? "····";
  const amount =
    row.amountMinor != null && row.currency
      ? formatMoney(row.amountMinor, row.currency)
      : "Amount TBD";
  return {
    id: `intent:${row.id}`,
    kind: "payment",
    title: `Intent · ${cardName}`,
    subtitle: `${amount} · ····${lastFour}`,
    meta: row.status,
    href: "/payments/runway",
  };
}

export async function search(
  query: string,
  ctx: SearchContext,
): Promise<SearchGroupsDTO> {
  const [cards, statements, runway, intents] = await Promise.all([
    searchCards(query, ctx.householdId, RESULT_CAP),
    searchStatements(query, ctx.householdId, RESULT_CAP),
    searchRunwayItems(query, ctx.householdId, RESULT_CAP),
    searchPaymentIntents(query, ctx.userId, RESULT_CAP),
  ]);

  const cardItems = cards.map(mapCardRow);
  const statementItems = statements.map(mapStatementRow);
  const paymentItems = [
    ...runway.map(mapRunwayRow),
    ...intents.map(mapIntentRow),
  ].slice(0, RESULT_CAP);

  const groups = {
    cards: cardItems,
    statements: statementItems,
    payments: paymentItems,
  };

  return {
    query,
    groups,
    totalCount:
      groups.cards.length +
      groups.statements.length +
      groups.payments.length,
  };
}

export function searchOrEmpty(
  query: string,
  ctx: SearchContext,
): Promise<SearchGroupsDTO> {
  return search(query, ctx).catch(() => emptySearchGroups(query));
}
