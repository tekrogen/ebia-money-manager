Below is a scalable **Next.js App Router** architecture for the Credit Card Manager UX. It keeps route files lightweight, groups code by business domain, uses Server Components by default, and isolates mutations, validation, data access, and client interactions.

MVP assumes a **manual data model** first (cards, balances, statements), plus **household card attribution**, **payment runway**, **paydown priority**, and **0% promo payoff planning**. Aggregator sync is a later phase, but the domain model stays multi-currency-safe and sync-ready.

## 1. Recommended project structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── not-found.tsx
│   ├── error.tsx
│   │
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   └── auth/
│   │       ├── sign-in/
│   │       │   └── page.tsx
│   │       ├── sign-up/
│   │       │   └── page.tsx
│   │       └── callback/
│   │           └── route.ts
│   │
│   ├── onboarding/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   │
│   │   ├── connect/
│   │   │   └── page.tsx
│   │   │
│   │   ├── manual-card/
│   │   │   └── page.tsx
│   │   │
│   │   └── complete/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   │
│   │   ├── overview/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── cards/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   │
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── [cardId]/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       ├── error.tsx
│   │   │       ├── not-found.tsx
│   │   │       │
│   │   │       ├── activity/
│   │   │       │   └── page.tsx
│   │   │       ├── statements/
│   │   │       │   └── page.tsx
│   │   │       ├── payments/
│   │   │       │   └── page.tsx
│   │   │       ├── rewards/
│   │   │       │   └── page.tsx
│   │   │       └── details/
│   │   │           └── page.tsx
│   │   │
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   │
│   │   │   ├── runway/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   │
│   │   │   └── new/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       ├── error.tsx
│   │   │       │
│   │   │       ├── amount/
│   │   │       │   └── page.tsx
│   │   │       ├── account/
│   │   │       │   └── page.tsx
│   │   │       ├── schedule/
│   │   │       │   └── page.tsx
│   │   │       ├── review/
│   │   │       │   └── page.tsx
│   │   │       └── success/
│   │   │           └── page.tsx
│   │   │
│   │   ├── rewards/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── insights/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── settings/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── household/
│   │   │   │   └── page.tsx
│   │   │   ├── accounts/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   └── security/
│   │   │       └── page.tsx
│   │   │
│   │   └── @transactionDrawer/
│   │       ├── default.tsx
│   │       └── (.)transactions/
│   │           └── [transactionId]/
│   │               └── page.tsx
│   │
│   └── api/
│       ├── webhooks/
│       │   └── financial-provider/
│       │       └── route.ts
│       └── health/
│           └── route.ts
│
├── features/
│   ├── overview/
│   ├── cards/
│   ├── transactions/
│   ├── statements/
│   ├── payments/
│   ├── paydown/
│   ├── household/
│   ├── rewards/
│   ├── insights/
│   ├── search/
│   ├── accounts/
│   ├── notifications/
│   ├── onboarding/
│   └── authentication/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── feedback/
│   └── charts/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── cache/
│   ├── validation/
│   ├── observability/
│   ├── security/
│   ├── formatting/
│   └── constants/
│
├── server/
│   ├── database/
│   ├── integrations/
│   ├── jobs/
│   └── events/
│
├── hooks/
├── types/
├── middleware.ts
└── instrumentation.ts
```

The important boundary is:

```text
app/        → routing and page composition
features/   → domain behavior and domain UI
components/ → reusable generic UI
lib/        → shared infrastructure
server/     → server-only integrations and persistence
```

---

# 2. Application route hierarchy

## Dashboard shell

```text
app/(dashboard)/layout.tsx
```

This layout owns:

* desktop sidebar
* mobile bottom navigation
* top bar
* global search
* notification menu
* user menu
* transaction drawer slot
* authenticated route protection

```tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentUser } from "@/features/authentication/server/queries";
import { redirect } from "next/navigation";

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
  transactionDrawer: React.ReactNode;
}>;

export default async function DashboardLayout({
  children,
  transactionDrawer,
}: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <DashboardShell user={user}>
      {children}
      {transactionDrawer}
    </DashboardShell>
  );
}
```

The shell can be a Server Component while individual interactive elements remain Client Components.

```text
components/layout/
├── dashboard-shell.tsx
├── dashboard-sidebar.tsx
├── dashboard-mobile-nav.tsx
├── dashboard-header.tsx
├── global-search.tsx          → thin shell importing @/features/search
├── notification-menu.tsx
└── user-menu.tsx
```

Possible component boundaries:

```text
DashboardShell                         Server Component
├── DashboardSidebar                  Server Component
│   └── NavigationItem                Server Component
├── DashboardHeader                   Server Component
│   ├── GlobalSearch                  Client Component
│   ├── NotificationMenu              Client Component
│   └── UserMenu                      Client Component
├── MainContent                       Server Component
└── TransactionDrawerSlot             Parallel Route
```

---

# 3. Feature folder standard

Every business domain should use a consistent internal structure.

```text
features/cards/
├── components/
├── server/
├── actions/
├── schemas/
├── types/
├── constants/
├── utils/
└── index.ts
```

A more complete cards feature:

```text
features/cards/
├── components/
│   ├── card-portfolio.tsx
│   ├── card-portfolio-row.tsx
│   ├── card-compact-grid.tsx
│   ├── card-compact-item.tsx
│   ├── credit-card-visual.tsx
│   ├── card-balance-summary.tsx
│   ├── card-utilization-bar.tsx
│   ├── card-status-badge.tsx
│   ├── card-detail-header.tsx
│   ├── card-detail-tabs.tsx
│   ├── add-card-form.tsx
│   ├── card-settings-form.tsx
│   ├── card-portfolio-table.tsx
│   ├── freeze-card-dialog.tsx
│   └── archive-card-dialog.tsx
│
├── server/
│   ├── queries.ts
│   ├── repository.ts
│   ├── service.ts
│   ├── mappers.ts
│   └── permissions.ts
│
├── actions/
│   ├── create-card.ts
│   ├── update-card.ts
│   ├── archive-card.ts
│   ├── freeze-card.ts
│   ├── unfreeze-card.ts
│   └── reconnect-card.ts
│
├── schemas/
│   ├── create-card-schema.ts
│   ├── update-card-schema.ts
│   └── card-filter-schema.ts
│
├── types/
│   ├── card.ts
│   ├── card-summary.ts
│   ├── card-provider.ts
│   └── promo-period.ts
│
├── constants/
│   ├── card-networks.ts
│   ├── card-statuses.ts
│   └── issuer-logos.ts
│
├── utils/
│   ├── calculate-utilization.ts
│   ├── get-card-display-name.ts
│   ├── get-payment-urgency.ts
│   └── get-promo-days-remaining.ts
│
└── index.ts
```

This pattern avoids folders such as:

```text
components/
services/
types/
utils/
```

containing unrelated code from every feature in the application.

---

# 4. Overview page hierarchy

## Route

```text
app/(dashboard)/overview/page.tsx
```

The page should only coordinate data and sections.

```tsx
import { Suspense } from "react";

import { DashboardAttention } from "@/features/overview/components/dashboard-attention";
import { DashboardCards } from "@/features/overview/components/dashboard-cards";
import { DashboardSpending } from "@/features/overview/components/dashboard-spending";
import { PortfolioMetricGrid } from "@/features/overview/components/portfolio-metric-grid";
import { UpcomingPaymentSummary } from "@/features/overview/components/upcoming-payment-summary";
import { PaydownPriorityPanel } from "@/features/paydown";
import { PromoPayoffPlanPanel } from "@/features/paydown";

import {
  BalanceSummarySkeleton,
  CardPortfolioSkeleton,
  SpendingChartSkeleton,
} from "@/features/overview/components/overview-skeletons";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Overview</h1>
      </header>

      <Suspense fallback={<BalanceSummarySkeleton />}>
        <PortfolioMetricGrid />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<BalanceSummarySkeleton />}>
          <PaydownPriorityPanel />
        </Suspense>

        <Suspense fallback={<BalanceSummarySkeleton />}>
          <PromoPayoffPlanPanel />
        </Suspense>
      </div>

      <Suspense fallback={<CardPortfolioSkeleton />}>
        <DashboardCards />
      </Suspense>

      <DashboardAttention />

      <Suspense fallback={<BalanceSummarySkeleton />}>
        <UpcomingPaymentSummary />
      </Suspense>

      <Suspense fallback={<SpendingChartSkeleton />}>
        <DashboardSpending />
      </Suspense>
    </div>
  );
}
```

## Component tree

```text
OverviewPage
├── PageHeader
│   └── AddCardButton
├── PortfolioMetricGrid
│   ├── TotalBalanceMetric
│   ├── AvailableCreditMetric
│   ├── OverallUtilizationMetric
│   └── MinPaymentsDueMetric
├── PaydownPriorityPanel          → features/paydown
├── PromoPayoffPlanPanel          → features/paydown
├── DashboardCards
│   ├── SectionHeader
│   └── CardSummaryCarousel
│       └── DashboardCardItem[]
├── DashboardAttention
│   └── AttentionItem[]
├── UpcomingPaymentSummary
└── DashboardSpending
    ├── SpendingPeriodSelector
    ├── SpendingChart
    └── CategoryBreakdown
```

Metric cards mirror the mockup (`2a`): total balance vs limit, available credit with sheltered 0% balance, overall utilization with guidance, and minimum payments due with estimated interest + next promo end.

Feature folder:

```text
features/overview/
├── components/
│   ├── portfolio-metric-grid.tsx
│   ├── total-balance-metric.tsx
│   ├── available-credit-metric.tsx
│   ├── overall-utilization-metric.tsx
│   ├── min-payments-due-metric.tsx
│   ├── upcoming-payment-summary.tsx
│   ├── dashboard-cards.tsx
│   ├── dashboard-card-item.tsx
│   ├── dashboard-attention.tsx
│   ├── attention-item.tsx
│   ├── dashboard-spending.tsx
│   └── overview-skeletons.tsx
│
├── server/
│   ├── queries.ts
│   └── service.ts
│
├── types/
│   └── overview.ts
│
└── utils/
    └── build-attention-items.ts
```

Overview composes `features/paydown` public components for Paydown Priority and 0% Promo Payoff Plan rather than reimplementing those calculators.

The server service can aggregate multiple domains:

```ts
export async function getOverviewData(userId: string) {
  const [cards, payments, spending, rewards, paydown] = await Promise.all([
    getCardSummaries(userId),
    getUpcomingPayments(userId),
    getMonthlySpending(userId),
    getRewardSummaries(userId),
    getPaydownDashboard(userId),
  ]);

  return {
    metrics: buildPortfolioMetrics(cards),
    utilization: calculatePortfolioUtilization(cards),
    balances: calculatePortfolioBalance(cards),
    cards,
    nextPayment: payments.at(0) ?? null,
    paydownPriority: paydown.priority,
    promoPayoffPlan: paydown.promoPayoffPlan,
    attentionItems: buildAttentionItems({
      cards,
      payments,
      spending,
      rewards,
      paydown,
    }),
    spending,
  };
}
```

For better streaming, each dashboard section can call a narrower cached query instead of one monolithic query.

---

# 5. Cards page hierarchy

## Cards portfolio route

```text
app/(dashboard)/cards/page.tsx
```

```text
CardsPage
├── CardsPageHeader
│   ├── PortfolioSummary
│   └── AddCardButton
├── CardFilters
│   ├── CardTypeFilter
│   ├── CardStatusFilter
│   └── HouseholdMemberFilter
├── CardViewToggle
└── CardCollection
    ├── CardPortfolioTable          (default power-user view)
    │   ├── sortable columns
    │   ├── issuer logo + display name + owner label
    │   ├── limit / balance / available / utilization bar
    │   ├── APR + promo countdown
    │   ├── due day / min pay / status badge
    │   ├── freeze / edit actions
    │   └── offset pagination footer
    ├── CardPortfolio
    │   └── CardPortfolioRow[]
    └── CardCompactGrid
        └── CardCompactItem[]
```

The view mode can be controlled with a URL query parameter:

```text
/cards?view=portfolio
/cards?view=compact
/cards?status=active&type=business
```

The page remains a Server Component.

```tsx
import { CardCollection } from "@/features/cards/components/card-collection";
import { CardsPageHeader } from "@/features/cards/components/cards-page-header";
import { parseCardFilters } from "@/features/cards/schemas/card-filter-schema";
import { getCardsPageData } from "@/features/cards/server/queries";

type CardsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CardsPage({
  searchParams,
}: CardsPageProps) {
  const filters = parseCardFilters(await searchParams);
  const data = await getCardsPageData(filters);

  return (
    <div className="space-y-6">
      <CardsPageHeader summary={data.summary} />
      <CardCollection cards={data.cards} view={filters.view} />
    </div>
  );
}
```

Use a Client Component only for instant view-toggle behavior if necessary. Otherwise, use links that update `searchParams`.

---

# 6. Card detail hierarchy

## Shared card layout

```text
app/(dashboard)/cards/[cardId]/layout.tsx
```

This layout owns the card summary header and tabs.

```tsx
import { CardDetailHeader } from "@/features/cards/components/card-detail-header";
import { CardDetailTabs } from "@/features/cards/components/card-detail-tabs";
import { getCardDetailSummary } from "@/features/cards/server/queries";
import { notFound } from "next/navigation";

type CardLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ cardId: string }>;
}>;

export default async function CardLayout({
  children,
  params,
}: CardLayoutProps) {
  const { cardId } = await params;
  const card = await getCardDetailSummary(cardId);

  if (!card) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <CardDetailHeader card={card} />
      <CardDetailTabs cardId={card.id} />
      {children}
    </div>
  );
}
```

## Component tree

```text
CardDetailLayout
├── Breadcrumbs
├── CardDetailHeader
│   ├── CreditCardVisual
│   ├── CurrentBalance
│   ├── AvailableCredit
│   ├── UtilizationBar
│   ├── MakePaymentButton
│   └── ManageCardMenu
├── PaymentMetricGrid
│   ├── StatementBalanceMetric
│   ├── MinimumDueMetric
│   └── DueDateMetric
├── CardDetailTabs
└── NestedRouteContent
```

Nested routes:

```text
/cards/[cardId]              → redirect or activity summary
/cards/[cardId]/activity
/cards/[cardId]/statements
/cards/[cardId]/payments
/cards/[cardId]/rewards
/cards/[cardId]/details
```

The base page can redirect:

```tsx
import { redirect } from "next/navigation";

type CardPageProps = {
  params: Promise<{ cardId: string }>;
};

export default async function CardPage({ params }: CardPageProps) {
  const { cardId } = await params;
  redirect(`/cards/${cardId}/activity`);
}
```

---

# 7. Transactions page hierarchy

## Main page

```text
TransactionsPage
├── TransactionsHeader
├── TransactionSearch
├── TransactionFilterBar
│   ├── CardFilter
│   ├── DateFilter
│   ├── CategoryFilter
│   ├── AmountFilter
│   └── FilterResetButton
├── TransactionBulkActions
└── TransactionGroups
    └── TransactionDateGroup[]
        └── TransactionRow[]
```

Feature folder:

```text
features/transactions/
├── components/
│   ├── transaction-search.tsx
│   ├── transaction-filter-bar.tsx
│   ├── transaction-date-group.tsx
│   ├── transaction-row.tsx
│   ├── transaction-status-badge.tsx
│   ├── transaction-drawer.tsx
│   ├── transaction-details.tsx
│   ├── transaction-category-form.tsx
│   ├── transaction-note-form.tsx
│   └── transaction-list-skeleton.tsx
│
├── server/
│   ├── queries.ts
│   ├── repository.ts
│   └── service.ts
│
├── actions/
│   ├── update-transaction-category.ts
│   ├── add-transaction-note.ts
│   └── report-transaction.ts
│
├── schemas/
│   ├── transaction-filter-schema.ts
│   ├── transaction-category-schema.ts
│   └── transaction-note-schema.ts
│
├── types/
│   └── transaction.ts
│
└── utils/
    └── group-transactions-by-date.ts
```

## Transaction drawer using intercepted routes

The UX calls for a drawer that opens without leaving the transaction list.

Use:

* a parallel route for the drawer
* an intercepted route for transaction details
* a normal full-page fallback for direct navigation

```text
app/(dashboard)/
├── @transactionDrawer/
│   ├── default.tsx
│   └── (.)transactions/
│       └── [transactionId]/
│           └── page.tsx
│
└── transactions/
    ├── page.tsx
    └── [transactionId]/
        └── page.tsx
```

`default.tsx`:

```tsx
export default function TransactionDrawerDefault() {
  return null;
}
```

Intercepted drawer route:

```tsx
import { TransactionDrawer } from "@/features/transactions/components/transaction-drawer";
import { getTransactionById } from "@/features/transactions/server/queries";
import { notFound } from "next/navigation";

type TransactionDrawerPageProps = {
  params: Promise<{ transactionId: string }>;
};

export default async function TransactionDrawerPage({
  params,
}: TransactionDrawerPageProps) {
  const { transactionId } = await params;
  const transaction = await getTransactionById(transactionId);

  if (!transaction) {
    notFound();
  }

  return <TransactionDrawer transaction={transaction} />;
}
```

Transaction rows link normally:

```tsx
<Link href={`/transactions/${transaction.id}`}>
  {transaction.merchantName}
</Link>
```

When clicked from the transactions page, the intercepted route appears in the drawer. When loaded directly, the full transaction page renders.

---

# 8. Payments page hierarchy

## Payments overview

```text
PaymentsPage
├── PaymentsHeader
│   ├── MakePaymentButton
│   └── OpenRunwayLink → /payments/runway
├── UpcomingPaymentHero
│   ├── PaymentUrgencyBadge
│   ├── StatementBalance
│   ├── MinimumPayment
│   ├── DueDate
│   ├── AutopayStatus
│   ├── PayNowButton
│   └── ReminderStatus
├── UpcomingPaymentList
│   └── UpcomingPaymentRow[]
└── PaymentHistory
    ├── PaymentHistoryFilters
    └── PaymentHistoryRow[]
```

When the institution exposes provider-managed autopay, surface `ProviderAutopayStatus` and a link-out/configure action. When it does not, show reminder status and one-click pay instead of a fake in-app autopay scheduler.

Feature structure:

```text
features/payments/
├── components/
│   ├── upcoming-payment-hero.tsx
│   ├── upcoming-payment-list.tsx
│   ├── payment-history.tsx
│   ├── payment-history-row.tsx
│   ├── payment-reminder-banner.tsx
│   ├── payment-runway.tsx
│   ├── payment-runway-lane.tsx
│   ├── payment-runway-toolbar.tsx
│   ├── payment-stepper.tsx
│   ├── payment-card-step.tsx
│   ├── payment-amount-step.tsx
│   ├── payment-account-step.tsx
│   ├── payment-schedule-step.tsx
│   ├── payment-review.tsx
│   ├── payment-success.tsx
│   └── provider-autopay-status.tsx
│
├── server/
│   ├── queries.ts
│   ├── repository.ts
│   ├── service.ts
│   ├── runway-service.ts
│   └── payment-provider.ts
│
├── actions/
│   ├── create-payment.ts
│   ├── cancel-payment.ts
│   ├── reschedule-runway-item.ts
│   └── link-provider-autopay.ts
│
├── schemas/
│   ├── payment-schema.ts
│   ├── payment-amount-schema.ts
│   ├── payment-account-schema.ts
│   ├── runway-schema.ts
│   └── provider-autopay-schema.ts
│
├── state/
│   ├── payment-flow-store.ts
│   └── runway-view-store.ts
│
├── types/
│   ├── payment.ts
│   └── runway.ts
│
└── utils/
    ├── calculate-payment-options.ts
    ├── get-payment-status-label.ts
    └── sort-runway-strategy.ts
```

### Autopay MVP policy

```text
Provider-managed autopay when the institution supports it.
If unsupported: upcoming payment reminders + one-click pay.
Do not build an in-app autopay scheduler in MVP.
```

Payment runway (`/payments/runway`) is an MVP surface distinct from provider autopay. It is a planning calendar: cards are lanes, due dates are the plot, and strategies reorder priority. Drag-to-reschedule updates the user's planned payment date / runway item — not the issuer's contractual due date.

---

# 9. Payment flow architecture

There are two reasonable implementations.

## Option A: Route-driven stepper

Best for:

* browser history
* refresh persistence
* deep linking
* server validation at each step

```text
/payments/new
/payments/new/amount
/payments/new/account
/payments/new/schedule
/payments/new/review
/payments/new/success
```

The flow state can be persisted using:

* encrypted HTTP-only cookie
* database-backed payment intent
* URL-safe temporary identifier
* server session

Recommended model:

```text
Start flow
    ↓
Create payment intent record
    ↓
Receive paymentIntentId
    ↓
Each step updates the draft intent
    ↓
Review reads authoritative server data
    ↓
Confirmation submits final mutation
```

Database concept:

```ts
type PaymentIntent = {
  id: string;
  userId: string;
  cardId: string | null;
  currency: string | null; // ISO 4217, copied from card when selected
  amountType: "minimum" | "statement" | "current" | "custom" | null;
  amountMinor: bigint | null;
  accountId: string | null;
  scheduledFor: Date | null;
  status: "draft" | "processing" | "submitted" | "expired";
  expiresAt: Date;
};
```

This is safer than trusting a client-side store with financial information.

## Option B: Single-page client stepper

Best for:

* manual prototype
* simpler onboarding
* fewer route transitions

```text
PaymentFlow Client Component
├── local reducer
├── CardStep
├── AmountStep
├── AccountStep
├── ReviewStep
└── Server Action submission
```

For a production financial manager, I would use the route-driven payment intent.

---

# 10. Payment confirmation action

The final mutation must validate everything again on the server.

```ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireCurrentUser } from "@/features/authentication/server/queries";
import { paymentConfirmationSchema } from "@/features/payments/schemas/payment-schema";
import { submitPaymentIntent } from "@/features/payments/server/service";

export type ConfirmPaymentState = {
  success: boolean;
  message: string;
  paymentId?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function confirmPayment(
  _previousState: ConfirmPaymentState,
  formData: FormData,
): Promise<ConfirmPaymentState> {
  const user = await requireCurrentUser();

  const parsed = paymentConfirmationSchema.safeParse({
    paymentIntentId: formData.get("paymentIntentId"),
    confirmationToken: formData.get("confirmationToken"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the payment information.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const payment = await submitPaymentIntent({
      userId: user.id,
      paymentIntentId: parsed.data.paymentIntentId,
      confirmationToken: parsed.data.confirmationToken,
    });

    revalidateTag(`user:${user.id}:payments`);
    revalidateTag(`user:${user.id}:cards`);
    revalidateTag(`user:${user.id}:overview`);

    revalidatePath("/payments");
    revalidatePath("/overview");

    return {
      success: true,
      message: "Payment submitted successfully.",
      paymentId: payment.id,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "The payment could not be submitted.",
    };
  }
}
```

The service layer should handle:

* ownership checks
* payment intent expiration
* current balance refresh
* funding account verification
* currency and amount invariant checks
* duplicate submission protection
* idempotency keys
* provider communication
* database transaction
* audit event creation

### Post-submit payment lifecycle

Confirmation is not settlement. After `confirmPayment` succeeds, the payment continues:

```text
draft → submitted → processing → settled
                              ↘ failed
                              ↘ returned
```

```ts
type PaymentStatus =
  | "draft"
  | "submitted"
  | "processing"
  | "settled"
  | "failed"
  | "returned"
  | "cancelled";

type Payment = {
  id: string;
  userId: string;
  cardId: string;
  accountId: string;
  amountMinor: bigint;
  currency: string; // ISO 4217
  status: PaymentStatus;
  providerPaymentId: string | null;
  idempotencyKey: string;
  submittedAt: Date | null;
  settledAt: Date | null;
  failureReason: string | null;
};
```

While `status` is `submitted` or `processing`:

* prefer webhook updates for speed
* run short-term polling as a reliability backstop
* revalidate `user:{userId}:payments`, `user:{userId}:cards`, and `card:{cardId}` on every terminal transition

`PaymentAttempts[]` record each provider attempt, response code, and idempotency key. Retries create new attempts; they do not mutate history.

---

# 11. Rewards page hierarchy

```text
RewardsPage
├── RewardsHeader
├── TotalRewardValue
├── RewardAccountList
│   └── RewardAccountCard[]
│       ├── RewardBalance
│       ├── EstimatedCashValue
│       ├── RecommendedRedemption
│       └── ViewRewardsButton
├── RewardOpportunities
│   └── RewardOpportunityCard[]
└── CardOptimizationRecommendations
    └── MerchantCardRecommendation[]
```

Feature folder:

```text
features/rewards/
├── components/
│   ├── total-reward-value.tsx
│   ├── reward-account-card.tsx
│   ├── reward-opportunity-card.tsx
│   ├── reward-value-disclaimer.tsx
│   └── card-optimization-recommendation.tsx
│
├── server/
│   ├── queries.ts
│   ├── service.ts
│   └── valuation.ts
│
├── types/
│   └── reward.ts
│
└── utils/
    └── recommend-card-for-category.ts
```

Reward valuations should contain an explicit timestamp because values change.

```ts
type RewardValuation = {
  points: number;
  estimatedValue: number;
  valuationRate: number;
  calculatedAt: Date;
  methodology: string;
};
```

---

# 12. Insights page hierarchy

```text
InsightsPage
├── InsightsHeader
│   └── PeriodSelector
├── SpendingOverview
│   ├── TotalSpending
│   ├── PeriodComparison
│   └── SpendingTrendChart
├── CategoryBreakdown
│   └── CategorySpendingRow[]
├── InsightFeed
│   └── FinancialInsightCard[]
└── MerchantAnalysis
    └── TopMerchantList
```

Feature structure:

```text
features/insights/
├── components/
│   ├── spending-overview.tsx
│   ├── spending-trend-chart.tsx
│   ├── category-breakdown.tsx
│   ├── category-spending-row.tsx
│   ├── insight-feed.tsx
│   ├── financial-insight-card.tsx
│   └── merchant-analysis.tsx
│
├── server/
│   ├── queries.ts
│   ├── service.ts
│   ├── insight-engine.ts
│   └── aggregations.ts
│
├── schemas/
│   └── insight-period-schema.ts
│
├── types/
│   └── insight.ts
│
└── utils/
    ├── calculate-period-change.ts
    └── describe-spending-change.ts
```

Charts should receive already-transformed view data.

```tsx
type SpendingChartProps = {
  data: Array<{
    label: string;
    amount: number;
  }>;
};
```

Do not place financial aggregation logic inside chart components.

---

# 13. Add-card and onboarding flow

## Component hierarchy

```text
AddCardPage
├── AddCardMethodSelector
│   ├── ConnectFinancialInstitutionCard
│   └── ManualCardEntryCard
├── ProviderDisclosure
└── SecurityNotice
```

Manual entry:

```text
ManualCardPage
└── ManualCardForm
    ├── CardNameField
    ├── CardNetworkSelect
    ├── LastFourDigitsField
    ├── CreditLimitField
    ├── CurrentBalanceField
    ├── StatementBalanceField
    ├── MinimumPaymentField
    ├── DueDateField
    └── SubmitButton
```

Connected flow:

```text
ConnectPage
├── InstitutionSearch
├── InstitutionList
├── ProviderConnectionModal
└── ConnectionStatus
```

Feature structure:

```text
features/onboarding/
├── components/
│   ├── onboarding-progress.tsx
│   ├── add-card-method-selector.tsx
│   ├── manual-card-form.tsx
│   ├── institution-search.tsx
│   ├── institution-list.tsx
│   └── connection-status.tsx
│
├── actions/
│   ├── create-manual-card.ts
│   └── complete-onboarding.ts
│
├── schemas/
│   └── manual-card-schema.ts
│
└── server/
    ├── service.ts
    └── onboarding-state.ts
```

MVP onboarding uses manual card entry. Institution connect UI can exist as a gated Phase 2 path without becoming the default.

---

# 14. Server Component versus Client Component boundaries

Use Server Components for:

* page composition
* database queries
* card summaries
* balances
* transaction lists
* upcoming payments
* reward summaries
* insight calculations
* permission checks
* initial filter state

Use Client Components for:

* drawers
* dialogs
* dropdown menus
* date pickers
* searchable comboboxes
* transaction filter interaction
* chart rendering
* optimistic category updates
* mobile navigation menu
* payment amount selectors
* form interactions requiring local state

Example:

```tsx
// Server Component
export async function DashboardCards() {
  const cards = await getDashboardCards();

  return <CardSummaryCarousel cards={cards} />;
}
```

```tsx
"use client";

// Client Component
export function CardSummaryCarousel({
  cards,
}: {
  cards: CardSummary[];
}) {
  // Keyboard navigation, touch gestures, carousel controls.
}
```

Avoid turning a full page into a Client Component because one child needs `useState`.

---

# 15. Data access layers

Use this dependency direction:

```text
Page or Server Component
        ↓
Feature Query
        ↓
Feature Service
        ↓
Feature Repository
        ↓
Database Client
```

Example:

```text
features/cards/server/queries.ts
features/cards/server/service.ts
features/cards/server/repository.ts
lib/db/client.ts
```

## Query layer

Knows:

* current user
* caching
* route-facing response shape

```ts
import { cache } from "react";

import { requireCurrentUser } from "@/features/authentication/server/queries";
import { cardService } from "./service";

export const getCardDetailSummary = cache(async (cardId: string) => {
  const user = await requireCurrentUser();

  return cardService.getCardDetailSummary({
    cardId,
    userId: user.id,
  });
});
```

## Service layer

Knows:

* business rules
* authorization requirements
* transformations
* orchestration

```ts
export const cardService = {
  async getCardDetailSummary(input: {
    cardId: string;
    userId: string;
  }) {
    const card = await cardRepository.findById(input.cardId);

    if (!card || card.userId !== input.userId) {
      return null;
    }

    return {
      id: card.id,
      name: card.name,
      lastFour: card.lastFour,
      balance: card.currentBalance,
      availableCredit: Math.max(
        card.creditLimit - card.currentBalance,
        0,
      ),
      utilization: calculateUtilization(
        card.currentBalance,
        card.creditLimit,
      ),
      paymentDueDate: card.paymentDueDate,
    };
  },
};
```

## Repository layer

Knows:

* ORM
* database schema
* persistence implementation

```ts
export const cardRepository = {
  findById(cardId: string) {
    return db.creditCard.findUnique({
      where: { id: cardId },
    });
  },
};
```

Route components should not contain raw ORM queries unless the application is very small.

---

# 16. Database domain model

A starting relational model:

```text
User
├── HouseholdMembership[]
├── FinancialAccount[]
├── CreditCard[]          (cards the user can access via household)
├── UserPreference?
├── NotificationPreference[]
└── AuditEvent[]

Household
├── HouseholdMember[]
└── CreditCard[]

HouseholdMember
└── attributed CreditCard[]

CreditCard
├── PromoPeriod?
├── Transactions[]
├── Statements[]
├── Payments[]
├── RewardAccount?
├── ProviderAutopayLink?
└── FinancialInstitutionConnection?

FinancialAccount
└── Payments[]

Transaction
├── Category
├── Notes[]
└── Dispute?

Statement
├── StatementLineItems[]
└── linked Payments[] / Transactions[] (optional)

Payment
├── CreditCard
├── FinancialAccount
└── PaymentAttempts[]

RewardAccount
└── RewardValuations[]

Notification
└── (in-app delivery + read state)
```

Example entities:

```ts
type HouseholdMember = {
  id: string;
  householdId: string;
  displayName: string; // e.g. "Marti", "Bob"
  userId: string | null; // null for label-only members without login
  role: "owner" | "member";
  createdAt: Date;
  updatedAt: Date;
};

type CreditCard = {
  id: string;
  householdId: string;
  ownerMemberId: string | null; // null => shared household card
  attribution: "member" | "shared";
  connectionId: string | null;
  institutionId: string | null;
  issuerKey: string | null; // logo lookup key
  name: string;
  network: string;
  lastFour: string;
  cardType: "personal" | "business";
  currency: string; // ISO 4217, card billing currency
  creditLimitMinor: bigint;
  currentBalanceMinor: bigint;
  statementBalanceMinor: bigint;
  minimumPaymentMinor: bigint;
  regularAprBps: number; // 2274 => 22.74%
  paymentDueDay: number | null; // 1-31 day-of-month from mockup
  paymentDueDate: string | null; // next due calendar date, YYYY-MM-DD
  paymentDueTimeZone: string; // IANA
  status: "active" | "frozen" | "locked" | "disconnected" | "archived";
  utilizationStatus: "ok" | "high"; // derived for badges; may be computed
  dataSource: "manual" | "aggregator";
  syncStatus: "synced" | "pending" | "failed" | "manual";
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type PromoPeriod = {
  id: string;
  cardId: string;
  promoAprBps: number; // usually 0
  regularAprBpsAfter: number;
  startsOn: string; // YYYY-MM-DD
  endsOn: string; // YYYY-MM-DD
  shelteredBalanceMinor: bigint; // balance still at promo APR
  status: "active" | "expired" | "cancelled";
};

type UserPreference = {
  userId: string;
  displayCurrency: string; // ISO 4217 preference for aggregates/UI
};

type Statement = {
  id: string;
  userId: string;
  cardId: string;
  currency: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;
  closingBalanceMinor: bigint;
  minimumPaymentMinor: bigint;
  paymentDueDate: string | null;
  source: "manual" | "aggregator" | "import";
  providerStatementId: string | null;
  documentUrl: string | null; // PDF when available
  createdAt: Date;
  updatedAt: Date;
};
```

Statements are first-class immutable financial records. They are not derived views of transactions. MVP creates and edits them through the manual model; aggregator import is a later phase.

Store money in minor units with an explicit currency:

```text
USD 42.81 → { amountMinor: 4281n, currency: "USD" }
```

Do not use JavaScript floating-point values as the source of truth for currency. Never add amounts across currencies without an explicit conversion step and rate timestamp.

---

# 17. Cache strategy

Suggested cache scopes:

```text
user:{userId}:overview
user:{userId}:cards
user:{userId}:transactions
user:{userId}:statements
user:{userId}:payments
user:{userId}:paydown
user:{userId}:household
user:{userId}:rewards
user:{userId}:insights
user:{userId}:search
card:{cardId}
transaction:{transactionId}
statement:{statementId}
household:{householdId}
```

After creating a payment:

```ts
revalidateTag(`user:${userId}:overview`);
revalidateTag(`user:${userId}:cards`);
revalidateTag(`user:${userId}:payments`);
revalidateTag(`card:${cardId}`);
```

Cache relatively stable data longer:

* institution metadata
* card network metadata
* reward program rules

Cache volatile financial data briefly or mark it dynamic:

* current balance
* pending transactions
* payment processing status
* available credit

A useful principle:

```text
Static reference data → long cache
Historical data        → moderate cache
Financial position     → short cache
Payment confirmation   → no stale reads
```

---

# 18. Middleware responsibilities

```text
src/middleware.ts
```

Middleware should handle lightweight request concerns:

* authentication redirect
* onboarding redirect
* request ID
* locale
* basic security headers
* protected route matching

It should not:

* query large financial datasets
* calculate balances
* call payment providers
* execute heavy authorization logic

Example matcher:

```ts
export const config = {
  matcher: [
    "/overview/:path*",
    "/cards/:path*",
    "/transactions/:path*",
    "/payments/:path*",
    "/rewards/:path*",
    "/insights/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
```

Keep definitive authorization checks inside server queries and actions. Middleware is not the only security boundary.

---

# 19. Error and loading boundaries

## Global

```text
app/error.tsx
app/not-found.tsx
```

## Dashboard

```text
app/(dashboard)/loading.tsx
app/(dashboard)/error.tsx
```

## Per feature

```text
app/(dashboard)/cards/loading.tsx
app/(dashboard)/cards/error.tsx

app/(dashboard)/payments/loading.tsx
app/(dashboard)/payments/error.tsx
```

## Per dynamic entity

```text
app/(dashboard)/cards/[cardId]/not-found.tsx
app/(dashboard)/cards/[cardId]/error.tsx
```

Use route-level loading UI for page navigation, plus component-level `Suspense` for streaming.

```text
Page skeleton      → route transition
Section skeleton   → slow independent data source
Inline spinner     → local mutation
Toast/status       → completed mutation
Error boundary     → failed render or query
Field error        → validation problem
```

---

# 20. Shared UI library

Generic components belong in `components/ui`.

```text
components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── select.tsx
├── dialog.tsx
├── drawer.tsx
├── sheet.tsx
├── tabs.tsx
├── badge.tsx
├── progress.tsx
├── table.tsx
├── skeleton.tsx
├── tooltip.tsx
├── dropdown-menu.tsx
├── form-field.tsx
├── currency-input.tsx
├── date-picker.tsx
└── empty-state.tsx
```

Financially meaningful components belong in the feature:

```text
features/cards/components/card-utilization-bar.tsx
features/payments/components/payment-urgency-badge.tsx
features/transactions/components/transaction-status-badge.tsx
```

Do not put domain behavior into generic UI components.

For example:

```text
components/ui/progress.tsx
```

renders a generic progress bar.

```text
features/cards/components/card-utilization-bar.tsx
```

decides:

* what utilization means
* warning thresholds
* labels
* accessibility text
* whether the balance exceeds the limit

---

# 21. URL state and filter design

Use URL parameters for shareable, reload-safe state:

```text
/transactions?card=card_123&category=dining&from=2026-07-01
/insights?period=3m
/cards?view=compact&status=active
/payments?status=completed
```

Use local state for temporary UI state:

* open menu
* selected tab inside a dialog
* input before submission
* carousel index
* hover state

Use server-managed state for:

* payment drafts
* disputes
* bank connections
* financial preferences
* persisted card view preference

---

# 22. Forms and validation

Each form should have:

```text
Schema
Server Action
Service
Repository
Client or Server form component
Mutation feedback
Cache invalidation
```

Example:

```text
features/cards/
├── components/add-card-form.tsx
├── schemas/create-card-schema.ts
├── actions/create-card.ts
└── server/service.ts
```

Client form:

```tsx
"use client";

import { useActionState } from "react";

import {
  createManualCard,
  initialCreateCardState,
} from "@/features/cards/actions/create-card";

export function AddCardForm() {
  const [state, formAction, pending] = useActionState(
    createManualCard,
    initialCreateCardState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {/* Fields */}

      {state.message ? (
        <p aria-live="polite">{state.message}</p>
      ) : null}

      <button disabled={pending} type="submit">
        {pending ? "Adding card..." : "Add card"}
      </button>
    </form>
  );
}
```

Every action must assume the submitted data is untrusted.

---

# 23. Authentication and authorization

Feature structure:

```text
features/authentication/
├── components/
│   ├── sign-in-form.tsx
│   └── user-avatar.tsx
├── server/
│   ├── queries.ts
│   ├── session.ts
│   └── permissions.ts
├── actions/
│   ├── sign-in.ts
│   └── sign-out.ts
└── types/
    └── authenticated-user.ts
```

Core helpers:

```ts
export async function getCurrentUser() {
  // Return user or null.
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}
```

Entity authorization should require household membership, not only a personal `userId` on the card:

```ts
getCard({
  cardId,
  userId, // resolved through household membership
});
```

Avoid fetching by `cardId` and assuming the current user owns it. Shared and member-attributed cards are visible to all household members with access.

---

# 24. Financial integration layer

External providers belong outside feature UI.

```text
server/integrations/
├── financial-data/
│   ├── client.ts
│   ├── types.ts
│   ├── mapper.ts
│   ├── errors.ts
│   └── webhook-handler.ts
│
├── payments/
│   ├── client.ts
│   ├── types.ts
│   ├── idempotency.ts
│   └── errors.ts
│
└── notifications/
    ├── email.ts
    └── push.ts
```

Your feature service calls an abstraction:

```ts
export interface PaymentProvider {
  submitPayment(input: SubmitPaymentInput): Promise<ProviderPayment>;
  getPaymentStatus(providerPaymentId: string): Promise<PaymentStatus>;
  cancelPayment(providerPaymentId: string): Promise<void>;
}
```

This prevents provider-specific API types from leaking into UI and domain code.

---

# 25. Webhook architecture

```text
app/api/webhooks/financial-provider/route.ts
```

Treat webhooks as **notifications that data changed**, not as the permanent source of truth. After verifying the event, fetch authoritative state from the provider API (or apply a carefully validated payload, then reconcile).

The webhook handler should:

1. verify signature
2. reject expired or malformed events
3. deduplicate by provider event ID
4. store raw event metadata
5. enqueue a domain sync/reconciliation job
6. return quickly
7. let the job update the database and revalidate cache tags

```text
Webhook route
    ↓
Signature verification
    ↓
Event deduplication
    ↓
Enqueue sync / reconciliation job
    ↓
Fetch authoritative provider state
    ↓
Database transaction
    ↓
Cache invalidation
```

Do not put thousands of lines of synchronization logic inside `route.ts`.

---

# 26. Suggested component responsibility table

| Component               | Type            | Responsibility                          |
| ----------------------- | --------------- | --------------------------------------- |
| `OverviewPage`          | Server          | Compose dashboard sections              |
| `UtilizationSummary`    | Server          | Fetch and present portfolio utilization |
| `SpendingTrendChart`    | Client          | Render interactive visualization        |
| `CardPortfolio`         | Server          | Render card collection                  |
| `CardViewToggle`        | Client or links | Change portfolio presentation           |
| `TransactionFilterBar`  | Client          | Update filter URL                       |
| `TransactionGroups`     | Server          | Render filtered transaction data        |
| `TransactionDrawer`     | Client shell    | Drawer behavior and dismissal           |
| `PaymentReview`         | Server          | Render authoritative payment details    |
| `ConfirmPaymentButton`  | Client          | Pending state and action submission     |
| `RewardOpportunityCard` | Server          | Present reward recommendation           |
| `NotificationMenu`      | Client          | Menu interaction and read state         |
| `GlobalSearch`          | Client shell    | Debounced query; results from search feature |
| `StatementList`         | Server          | Render first-class statement records    |
| `PaydownPriorityPanel`  | Server          | Rank high-utilization cards             |
| `PromoPayoffPlanPanel`  | Server          | Compute promo clearance plan            |
| `PaymentRunway`         | Client shell    | Calendar lanes, drag, strategy switch   |
| `CardPortfolioTable`    | Server          | Sortable paged card ops table           |
| `CardOwnerBadge`        | Server          | Household member / shared attribution   |

---

# 27. Testing architecture

```text
tests/
├── unit/
│   ├── cards/
│   │   └── calculate-utilization.test.ts
│   ├── payments/
│   │   └── calculate-payment-options.test.ts
│   └── insights/
│       └── insight-engine.test.ts
│
├── integration/
│   ├── cards/
│   │   └── create-card.test.ts
│   ├── payments/
│   │   └── submit-payment.test.ts
│   └── transactions/
│       └── update-category.test.ts
│
└── e2e/
    ├── onboarding.spec.ts
    ├── cards.spec.ts
    ├── transactions.spec.ts
    ├── payment-flow.spec.ts
    └── accessibility.spec.ts
```

Testing priorities:

```text
Unit
├── utilization calculations + high-util threshold
├── money formatting + cross-currency guards
├── due-date urgency (timezone-aware)
├── promo days remaining + payoff $/mo
├── paydown priority ranking
├── runway strategy sort (avalanche / snowball / due date)
├── payment status transitions
├── reward recommendation rules
└── insight calculations

Integration
├── household membership + card attribution access
├── ownership enforcement
├── payment idempotency
├── freeze / unfreeze card
├── manual statement create/immutability
├── card creation with promo period
├── webhook dedup + reconcile job enqueue
├── search scoping by user
└── cache invalidation

E2E
├── add card (manual) with household owner label
├── cards table sort / page / freeze
├── overview paydown + promo payoff panels
├── payment runway drag + strategy switch
├── search transactions / cards / merchants
├── open transaction drawer
├── complete payment flow
├── link provider autopay when available
├── reminder + one-click pay when autopay unavailable
└── recover from provider failure
```

---

# 28. Final page-to-feature map

```text
/
└── redirect by auth + onboarding state

/overview
└── features/overview
    ├── features/cards
    ├── features/paydown
    ├── features/payments
    ├── features/household
    ├── features/transactions
    ├── features/rewards
    └── features/insights

/cards
└── features/cards + features/household

/cards/[cardId]/activity
└── features/cards + features/transactions

/cards/[cardId]/statements
└── features/cards + features/statements

/cards/[cardId]/payments
└── features/cards + features/payments

/cards/[cardId]/rewards
└── features/cards + features/rewards

/transactions
└── features/transactions

/payments
└── features/payments

/payments/runway
└── features/payments (+ cards, household labels)

/rewards
└── features/rewards

/insights
└── features/insights

/onboarding
└── features/onboarding + features/cards + features/accounts + features/household

/settings
└── features/accounts + features/household + features/notifications + authentication

/settings/household
└── features/household

/settings/accounts
└── features/accounts
```

Global search is owned by `features/search` and mounted from the dashboard shell, not a dedicated route.

## Architectural rule of thumb

```text
Route files decide what appears on a URL.

Feature components decide how a business capability is presented.

Feature services decide how the business behaves.

Repositories decide how data is stored and retrieved.

Integrations decide how outside providers are contacted.

Jobs and events decide how asynchronous work stays durable.
```

That separation keeps the App Router pages small while allowing Cards, Transactions, Statements, Payments, Paydown, Household, Rewards, Insights, and Search to evolve independently.

---

# 29. Money rules

Multi-currency is a product requirement. Every monetary value carries currency.

```ts
type Money = {
  amountMinor: bigint;
  currency: string; // ISO 4217
};
```

Rules:

* Persist amounts as integer minor units plus ISO 4217 currency.
* Card balances, statement balances, payments, and funding accounts each declare currency.
* Refuse cross-currency arithmetic in services unless an explicit FX conversion with rate + timestamp is supplied.
* Format for display in `lib/formatting` using locale + currency; never format inside repositories.
* Due dates are calendar dates (`YYYY-MM-DD`) interpreted in the card's `paymentDueTimeZone`.
* Utilization and reward valuations document rounding mode (typically half-up to the currency's minor unit or basis points for rates).
* MVP may start with manually entered single-currency cards per household, but the schema and services must not assume one global currency.
* `UserPreference.displayCurrency` is a presentation preference for aggregates, not a replacement for per-card currency.

---

# 30. Synchronization architecture

Phased data sources:

```text
Phase 1 (MVP): manual card + statement + balance entry
Phase 2: fintech aggregator connection + hybrid sync
```

Even in the manual phase, keep `dataSource` and `syncStatus` fields so aggregator sync does not rewrite the domain model later.

## Hybrid sync model (aggregator phase)

Webhook-first for speed, polling for reliability.

| Data | Approach |
| --- | --- |
| New transactions | Webhook + reconciliation polling |
| Balance changes | Webhook + periodic polling |
| Payment status | Webhook + short-term polling while processing |
| Initial account connection | Immediate full API sync |
| Missed or delayed events | Scheduled reconciliation |
| Provider without webhooks | Poll-first |

```text
Provider event / schedule / user reconnect
        ↓
Sync job (server/jobs)
        ↓
Fetch authoritative provider snapshots
        ↓
Map → domain entities (server/integrations + feature mappers)
        ↓
Transactional upsert + audit
        ↓
Cache revalidation
        ↓
UI reflects syncStatus / lastSyncedAt / errors
```

Webhooks notify; provider API reads (or reconciled snapshots) decide durable state.

## Connection lifecycle

```text
disconnected → connecting → initial_sync → synced
                                    ↘ sync_failed → reconnect
manual cards remain dataSource=manual, syncStatus=manual
```

UI responsibilities:

* show stale/failed sync banners on cards and overview
* offer reconnect from card manage menu
* never hide a failed sync behind a cached “healthy” balance

---

# 31. Jobs and domain events

`server/jobs/` and `server/events/` are required runtime seams, not placeholders.

```text
server/
├── jobs/
│   ├── sync-connection.ts
│   ├── reconcile-account.ts
│   ├── poll-payment-status.ts
│   ├── send-payment-reminders.ts
│   └── expire-payment-intents.ts
│
└── events/
    ├── publishers.ts
    ├── handlers/
    │   ├── payment-settled.ts
    │   ├── sync-completed.ts
    │   └── reminder-due.ts
    └── types.ts
```

Jobs own:

* provider fetches and reconciliation
* payment status polling windows
* reminder fan-out
* intent expiration
* anything that must survive a short webhook HTTP timeout

Domain events own:

* in-process or queued notifications after durable writes
* cache invalidation coordination
* audit fan-out

Route handlers and Server Actions may enqueue work. They should not perform long provider sync loops inline.

MVP without an aggregator still needs:

* `expire-payment-intents`
* `send-payment-reminders`
* optional async notification delivery

---

# 32. Statements feature

Statements are first-class. Nested card routes compose cards + statements.

```text
features/statements/
├── components/
│   ├── statement-list.tsx
│   ├── statement-row.tsx
│   ├── statement-detail.tsx
│   ├── manual-statement-form.tsx
│   └── statement-document-link.tsx
│
├── server/
│   ├── queries.ts
│   ├── repository.ts
│   └── service.ts
│
├── actions/
│   ├── create-manual-statement.ts
│   └── update-manual-statement.ts
│
├── schemas/
│   └── manual-statement-schema.ts
│
├── types/
│   └── statement.ts
│
└── utils/
    └── statement-period-label.ts
```

```text
StatementList
├── StatementFilters
└── StatementRow[]
    ├── Period
    ├── ClosingBalance
    ├── MinimumDue
    ├── DueDate
    └── DocumentLink?

StatementDetail
├── StatementHeader
├── BalanceSummary
├── LineItems (optional in MVP)
└── RelatedPayments
```

MVP rules:

* create/edit statements manually per card
* treat closed statements as immutable after confirmation (corrections via explicit revision/audit, not silent edits)
* support optional PDF/document attachment metadata
* do not synthesize statements from transactions
* aggregator import maps into the same `Statement` entity later via `source: "aggregator"`

---

# 33. Feature boundaries and public API

Dependency direction:

```text
app/ routes
  → features/*/index.ts (public API)
    → feature components / actions / server queries
      → feature services
        → feature repositories
          → lib/db + server/integrations

features/overview may compose other features' public queries/components.
features/* must not import another feature's repository or internal server files.
shared non-domain utilities live in lib/.
```

Each feature exports only what other features and routes may use:

```ts
// features/cards/index.ts
export { CardPortfolio } from "./components/card-portfolio";
export { getCardSummaries } from "./server/queries";
export type { CardSummary } from "./types/card-summary";
```

Forbidden:

```text
features/overview/server/service.ts
  → import from features/cards/server/repository.ts
```

Allowed:

```text
features/overview/server/service.ts
  → import { getCardSummaries } from "@/features/cards"
```

Cross-cutting financial formatting, money helpers, and auth session helpers belong in `lib/` or `features/authentication`, not copy-pasted into every feature.

---

# 34. Auth, onboarding, and root redirects

Canonical entry flow:

```text
Unauthenticated "/" or protected path
  → /auth/sign-in

Authenticated + onboarding incomplete
  → /onboarding

Authenticated + onboarding complete
  → /overview
```

Onboarding completeness (MVP):

```ts
type OnboardingState = {
  hasAcceptedDisclosures: boolean;
  hasFundingAccountOrSkipped: boolean;
  hasAtLeastOneCard: boolean;
};

function isOnboardingComplete(state: OnboardingState) {
  return (
    state.hasAcceptedDisclosures &&
    state.hasFundingAccountOrSkipped &&
    state.hasAtLeastOneCard
  );
}
```

Middleware may soft-redirect using session claims or a lightweight onboarding flag. Definitive checks still run in `onboarding/layout.tsx` and `(dashboard)/layout.tsx`.

```text
app/(public)/page.tsx     → marketing or redirect
app/(dashboard)/          → no index page; use /overview as home
middleware + layouts      → enforce the state machine above
```

Avoid bounce loops: dashboard layout must not redirect to onboarding while onboarding layout redirects back to dashboard for the same incomplete predicate.

---

# 35. Transaction list pagination

Transaction lists use keyset (cursor) pagination, not offset pages.

```ts
type TransactionCursor = {
  bookedAt: string; // ISO timestamp
  id: string;
};

type TransactionPage = {
  items: TransactionListItem[];
  nextCursor: TransactionCursor | null;
};
```

Defaults:

* initial window: last 30 days (URL-overridable via `from` / `to`)
* page size: 50
* group-by-date runs on the current page payload only
* filters (`card`, `category`, `amount`, search) are applied server-side before pagination

Infinite scroll or “Load more” updates the URL or a cursor param without turning the whole page into a Client Component. Keep the list Server Component; make the pager a small Client Component.

---

# 36. Global search (MVP)

Global search is a real MVP capability, not a shell placeholder.

Scope:

```text
Transactions (merchant name, memo, amount)
Cards (name, last four, institution)
Merchants (distinct merchant names / normalized merchants)
```

```text
features/search/
├── components/
│   ├── global-search.tsx
│   ├── search-results.tsx
│   └── search-result-group.tsx
│
├── server/
│   ├── queries.ts
│   └── service.ts
│
├── schemas/
│   └── search-query-schema.ts
│
└── types/
    └── search-result.ts
```

```text
GlobalSearch (Client shell)
  → debounced query to search action/route
    → searchService.search({ userId, query })
      → cards + transactions + merchants queries
        → grouped results with deep links
```

Rules:

* always scope by `userId`
* return deep links (`/cards/[id]`, `/transactions/[id]`, merchant-filtered transaction URL)
* keep result payloads small; click-through loads full entities
* reuse the same server search service if a future `/search` route is added
* mount from `components/layout/global-search.tsx` by importing `@/features/search`

---

# 37. Notifications model

Preferences alone are incomplete. Persist in-app notifications for reminders and sync/payment events.

```ts
type AppNotification = {
  id: string;
  userId: string;
  type: "payment_reminder" | "payment_update" | "sync_failure" | "statement_ready";
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};
```

`NotificationMenu` reads this store. Reminder jobs create rows (and optional email/push via `server/integrations/notifications`). Provider-managed autopay status changes should also emit notifications when webhooks/polls observe them.

---

# 38. Phased delivery summary

```text
MVP
├── Manual cards, balances, statements, APR, and promo periods
├── Household members + card attribution (member | shared)
├── Overview metric cards + paydown priority + promo payoff plan
├── Cards table with issuer logos, sort, offset paging, freeze/unfreeze
├── Payment runway calendar (lanes, strategies, drag reschedule)
├── Manual / user-initiated payments with full intent lifecycle
├── Provider-managed autopay link when available
├── Reminders + one-click pay when autopay unavailable
├── Settings: display currency + connected accounts UI (manual refresh ready)
├── Transaction list with cursor pagination
├── Global search: transactions, cards, merchants
├── Multi-currency-safe money model
└── Jobs for reminders + payment intent expiry + promo-ending alerts

Later
├── Aggregator connection + hybrid webhook/poll sync
├── Provider statement/PDF import into Statement entities
├── Live institution connect behind connected-accounts
├── Rewards swipe matrix / deeper insights
├── Richer reward valuation
└── In-house autopay scheduler only if product explicitly requires it
```

---

# 39. Household cards (MVP)

Household attribution is required for the mockup labels `(Marti)`, `(Bob)`, `(Shared)`.

```text
features/household/
├── components/
│   ├── household-member-list.tsx
│   ├── household-member-form.tsx
│   ├── card-owner-badge.tsx
│   └── card-attribution-select.tsx
│
├── server/
│   ├── queries.ts
│   ├── repository.ts
│   ├── service.ts
│   └── permissions.ts
│
├── actions/
│   ├── create-member.ts
│   ├── update-member.ts
│   └── assign-card-owner.ts
│
├── schemas/
│   └── household-schema.ts
│
└── types/
    └── household.ts
```

Rules:

* Every card belongs to a `householdId`.
* `attribution: "shared"` means no single `ownerMemberId`.
* `attribution: "member"` requires `ownerMemberId`.
* Display name on cards = `card.name` + owner/shared badge from household.
* Authorization: user must be a household member to read/mutate cards in that household.
* Label-only members (`userId: null`) are allowed so non-login spouses/partners can appear on cards without accounts.
* Settings route `/settings/household` manages members; card forms assign attribution.

MVP does **not** require full multi-login family billing. It does require correct attribution and access scoping so shared wallets work.

---

# 40. Paydown and promo planning (MVP)

```text
features/paydown/
├── components/
│   ├── paydown-priority-panel.tsx
│   ├── paydown-priority-row.tsx
│   ├── promo-payoff-plan-panel.tsx
│   ├── promo-payoff-plan-row.tsx
│   └── interest-impact-callout.tsx
│
├── server/
│   ├── queries.ts
│   ├── service.ts
│   ├── priority-engine.ts
│   └── promo-payoff-engine.ts
│
├── types/
│   └── paydown.ts
│
└── utils/
    ├── rank-by-utilization.ts
    ├── months-until.ts
    ├── required-monthly-payoff.ts
    └── estimate-post-promo-interest.ts
```

## Paydown Priority

Rank active cards with utilization ≥ 30% (configurable) descending by utilization. Each row shows owner/shared label, utilization, balance, and active promo end date when present.

## 0% Promo Payoff Plan

For each active `PromoPeriod`:

```text
requiredMonthly = ceil(shelteredBalance / monthsRemainingInclusive)
compare against minimumPayment
if minimum too low → show remaining balance + est. interest at regularAprBpsAfter
aggregate household "Minimum Payoff Plan total" and shortfall vs recorded mins
```

Missing minimum payment is a first-class empty state ("Add this card's minimum payment…"), not a silent zero.

These panels mount on `/overview` and may also deep-link from Insights later. Calculation logic stays in `features/paydown`, not in chart or layout components.

---

# 41. Payment runway (MVP)

Route: `app/(dashboard)/payments/runway/page.tsx`

```text
PaymentRunwayPage
├── RunwayToolbar
│   ├── StrategySelect (avalanche | snowball | by_due_date | by_statement_close)
│   ├── HorizonSelect (e.g. next 45 days)
│   └── ExtraPaymentInput (what-if $/mo)
├── RunwayCalendar
│   └── CardLane[]
│       ├── lane header (card + owner badge + issuer)
│       └── DueEvent[] (draggable)
└── RunwaySummary
    ├── cash needed / week
    └── interest impact preview
```

```ts
type RunwayStrategy =
  | "avalanche"
  | "snowball"
  | "by_due_date"
  | "by_statement_close";

type RunwayItem = {
  id: string;
  cardId: string;
  plannedPayDate: string; // YYYY-MM-DD user plan
  contractualDueDate: string | null;
  amountMinor: bigint;
  currency: string;
  source: "minimum" | "promo_plan" | "custom";
};
```

Behavior:

* Cards are horizontal/vertical lanes; due events plot on the calendar.
* Dragging reschedules `plannedPayDate` only.
* Strategy changes sort/emphasize lanes; they do not invent provider autopay.
* One-click pay from a runway event starts `/payments/new` with card + amount prefilled.
* Interest impact previews call `features/paydown` helpers where promo/APR math is shared.

---

# 42. Settings: profile, currency, connected accounts

Align with mockup `0c`:

```text
/settings/profile
├── identity fields (may be read-only if auth-provider managed)
└── displayCurrency preference

/settings/household
└── members + roles

/settings/accounts
├── ConnectedAccountRow[]
│   ├── institution name + icon
│   ├── lastSyncedAt
│   ├── status badge
│   ├── manual refresh action
│   ├── manage / reconnect
│   └── remove
└── + Link institution (Phase 2 gated; MVP may show disabled/coming soon)
```

`displayCurrency` affects aggregate formatting on overview when cards mix currencies (show converted totals only with explicit FX; otherwise group by currency). Card-level amounts always render in the card's own currency.

---

# 43. Card list power-user table (MVP)

Default `/cards` view for desktop matches mockup `2d`:

| Column | Source |
| --- | --- |
| Card | issuer logo, name, network, last four, owner/shared badge |
| Limit / Balance / Available | money fields |
| Utilization | % + bar; red when high |
| APR | regular or `0% promo` + days left + revert APR |
| Due day | `paymentDueDay` |
| Min pay | `minimumPaymentMinor` |
| Status | OK / High util / Frozen / Disconnected |
| Actions | edit, freeze/unfreeze |

Paging: offset pagination is acceptable for card counts in the tens (`page` + `pageSize` URL params). Prefer cursor pagination only if card volume grows large.

Sortable columns update `searchParams` and stay Server Component-driven.
