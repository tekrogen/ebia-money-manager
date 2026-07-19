# PHASE-01 Slice #4 — Statements

**Status:** Phase 6 Review complete — awaiting Phase 7 Summary  
**Date:** 2026-07-15 (Discovery) / 2026-07-19 (Architecture + Implementation + Review)  
**Remote:** https://github.com/tekrogen/ebia-money-manager  
**Feature workflow:** 7-phase (`/feature/workflow`)  
**Slice:** Phase 01 vertical slice #4

---

## Phase 1: Discovery

**Verdict:** Next feature work is **Phase 01 vertical slice #4 — Statements**.

### What's done

Slices 1–3 are shipped: auth stub, onboarding, cards table, overview metrics, paydown priority, promo payoff, payment runway + intent flow. Phase 6/7 review complete — 8 issues closed.

### What's next (slice #4)

| Surface | Status | Goal |
|---------|--------|------|
| `/cards/[cardId]/statements` | Missing | Per-card statement list with period, closing balance, min due, due date |
| `/cards/[cardId]` layout | Missing | Card detail shell with tab nav (statements, payments, activity, details) |
| Manual statement form | Missing | Create/edit a statement for a card (CRUD) |
| `src/features/statements/` | Missing | Full feature domain (types, schemas, queries, actions, components) |

### Problem / user

Household members need to **view and manually record credit card statements** — the closing balance, minimum due, payment due date, and period — to track billing cycles and confirm payment obligations before using the runway/paydown tools.

### Key requirements (from architecture)

- Statements are **first-class immutable financial records** — not derived from transactions
- Create/edit manually per card; treat closed statements as immutable after confirmation
- Optional PDF/document attachment metadata (`documentUrl`)
- Source enum: `manual` | `aggregator` | `import` (MVP = manual only)
- Nested under card detail route: `/cards/[cardId]/statements`
- Money in integer minor units + explicit currency
- Aggregator import maps to the same `Statement` entity later (design for it)

### Schema (existing)

```prisma
model Statement {
  id                   String          @id @default(cuid())
  userId               String
  cardId               String
  currency             String
  periodStart          String
  periodEnd            String
  closingBalanceMinor  BigInt
  minimumPaymentMinor  BigInt
  paymentDueDate       String?
  source               StatementSource @default(manual)
  providerStatementId  String?
  documentUrl          String?
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt
  card                 CreditCard      @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId])
  @@index([userId])
}
```

### Known issue (prerequisite)

- **#10:** `Statement.userId` has no `User` relation — must add `user User @relation(...)` for referential integrity.

### Architecture file structure (target)

```text
features/statements/
├── components/
│   ├── statement-list.tsx
│   ├── statement-row.tsx
│   ├── statement-detail.tsx
│   ├── manual-statement-form.tsx
│   └── statement-document-link.tsx
├── server/
│   ├── queries.ts
│   ├── repository.ts
│   └── service.ts
├── actions/
│   ├── create-manual-statement.ts
│   └── update-manual-statement.ts
├── schemas/
│   └── manual-statement-schema.ts
├── types/
│   └── statement.ts
└── utils/
    └── statement-period-label.ts
```

### Component tree (from architecture)

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

### Assumptions

1. Card detail route (`/cards/[cardId]`) must exist to host statements — this slice creates the layout with tab nav.
2. MVP scope = statement list + create + basic detail; no line items, no transaction linking.
3. StatementDetail is a nice-to-have; list + create form is the must-have.
4. Immutability = no edit after "confirmed" (but MVP can start without a confirmed/draft state — just manual records).
5. Household scoping: statements belong to a card, cards belong to a household. Query via card → household chain.
6. `userId` on Statement = who recorded it, not who "owns" it; household members all see all card statements.

### Explicitly deferred

- StatementLineItems / transaction linking (architecture mentions but marks optional in MVP)
- Aggregator/import statement source
- PDF upload (just store `documentUrl` metadata for now)
- Insights/analytics derived from statement history
- Statement → Payment cross-reference (show which payments covered a statement)

### Dependencies / prerequisites

1. Fix issue #10 (add User relation to Statement model) — schema change
2. Create `/cards/[cardId]` layout with tab navigation
3. Follow existing patterns from payments feature (layered: types → schemas → repository → service → actions → components)

### Discovery checkpoint

Scope confirmed. Ready for Phase 2 (Codebase Exploration) to map existing patterns and identify integration points.

---

## Phase 2: Codebase Exploration (2026-07-15)

Explored via code-explorer agent. Full findings:

### Feature layer pattern (payments = gold standard)

```text
src/features/payments/
├── types.ts            # DTOs — plain serializable interfaces (number not bigint)
├── schemas.ts          # Zod schemas + z.infer<> type exports
├── index.ts            # Public API — re-exports everything
├── utils/              # Pure business logic (no DB)
├── server/
│   ├── action-state.ts # { success, message, fieldErrors? } + initialState
│   ├── actions.ts      # "use server" — Zod parse → repo/service → revalidatePath → redirect
│   ├── *-repository.ts # Raw Prisma calls, typed params, ownership verification
│   ├── *-queries.ts    # Read-only, returns DTOs
│   └── *-service.ts    # Business logic, maps bigint → number for DTOs
└── components/         # "use client" — useActionState + native <form action={}>
```

### Route conventions

- Pages are thin: `requireOnboardedUser()` → fetch → render
- No `/cards/[cardId]` layout exists yet — must create
- Next.js 16 async params: `params: Promise<{ cardId: string }>`
- Forms use native `<form action={formAction}>` + `useActionState` (React 19)

### Available card queries

- `getCardsForHousehold(householdId)` → `CardListItem[]` (exported)
- **No `getCardById` exists** — must add for card detail layout

### Shared utilities

- `formatMoney(bigint, currency)` — exists in `src/lib/formatting/money.ts`
- **No date formatting utility** — dates stored as YYYY-MM-DD strings
- `requireOnboardedUser()` → `{ id, email, name, householdId, onboardingComplete }`
- `getOwnerLabel(attribution, displayName)` — from `@/features/household`

### Key gaps requiring decisions

| # | Gap |
|---|-----|
| G1 | No `getCardById` query — add to cards feature or create internally? |
| G2 | Schema fix #10 — add User relation to Statement |
| G3 | Seed data — how many demo statements per card? |
| G4 | Statement create: page or modal/sheet? |
| G5 | No date utility — add shared `src/lib/formatting/dates.ts`? |
| G6 | Card detail tab nav scope — which tabs? |
| G7 | `documentUrl` handling — link or placeholder? |
| G8 | Cross-feature import bypass (#7) — fix now or later? |

---

## Phase 3: Clarifying answers (defaults)

| # | Decision | Default chosen |
|---|----------|----------------|
| 1 | `getCardById` | **Add to `src/features/cards/server/queries.ts`** + export via `index.ts` — fills a real gap, follows cross-feature public API convention |
| 2 | Schema fix #10 | **Add `user User @relation(...)` to Statement** + add `statements Statement[]` to User model |
| 3 | Seed data | **2 statements per seeded card** (last 2 billing cycles) — keeps seed fast, exercises the list |
| 4 | Statement create UX | **Dedicated sub-page `/cards/[cardId]/statements/new`** — mirrors `/cards/new` pattern, simpler than modal for initial build |
| 5 | Date utility | **Add `src/lib/formatting/dates.ts`** with `formatDateShort(iso: string)` and `formatDateRange(start, end)` using `Intl.DateTimeFormat` |
| 6 | Card detail tabs | **Two tabs for now: Statements (active) + Details (stub)** — payments/activity/rewards tabs added in later slices when those nested views are needed |
| 7 | `documentUrl` | **Render as external link if present, else show "—"** — no upload UI in MVP |
| 8 | Cross-feature bypass (#7) | **Defer** — tracked as existing issue; fix in a dedicated chore branch, not this feature slice |

---

## Phase 4: Architecture (2026-07-19)

### Goals

- [x] Translate the locked Phase 3 decisions into implementation-ready architecture options.
- [x] Define each option's feature boundaries, data flow, ownership enforcement, and client/server serialization boundaries.
- [x] Identify the exact routes, feature layers, schema changes, shared utilities, and public API changes required.
- [x] Define the statement lifecycle and clarify how MVP immutability is enforced without silently editing confirmed records.
- [x] Define the test strategy for schema integrity, household authorization, validation, statement creation, listing, and critical browser flows.
- [x] Estimate file scope, implementation sequence, risks, and deferred work for each option.
- [x] Compare at least two viable approaches with concrete pros and cons.
- [x] Recommend one approach based on repository conventions and MVP scope.
- [x] Record the selected approach and obtain explicit approval before Phase 5 implementation.

### Completion evidence

Architecture options designed via code-architect agents. Plan approved 2026-07-19. Locked Option 3 recorded below. No feature implementation in this phase.

### Option comparison

| Dimension | Option 1 Minimal | Option 2 Layered | Option 3 Pragmatic |
|-----------|------------------|------------------|--------------------|
| File count | ~20 (4 mod / 16 new) | ~30 (6 mod / 24 new) | ~25 (4 mod / 21 new) |
| Layering | payments-shaped, lean | full types→schemas→repo→service/queries→actions→components | same layered stack, with cards action-state correction |
| Tabs | inlined in layout | componentized | componentized lightly |
| Detail / update | omitted | update omitted (no dead code) | write-once create only |
| Ownership | layout + action checks | layout + action checks | layout + household join ownership |
| DTO money | number at DTO; BigInt at formatMoney call sites | bigint→number at service fence | bigint→number mapped end-to-end |
| Notable extras | fewest files | closest to architecture README tree | `React.cache(getCardById)`, UTC date formatting, explicit conflict register |

Architecture designs:
- Option 1 — Minimal Changes
- Option 2 — Layered Feature Architecture
- Option 3 — Pragmatic Balance

### Recommendation

**Option 3 — Pragmatic Balance.**

Why:
- Honors the architecture README / payments layered boundaries without shipping unused update/detail surfaces
- Adopts the corrected `actions/action-state.ts` pattern from the cards `"use server"` fix (non-async exports must leave `"use server"` files)
- Includes practical hardening: `React.cache()` for layout+page card fetches, UTC-safe date formatting, write-once immutability
- Mid-scope (~25 files) — faster than full layered Option 2, safer than Minimal's inlined shortcuts

### Decision (2026-07-19)

**Locked: Option 3 — Pragmatic Balance.**

### Conflicts resolved

1. Architecture README §6 shows `[cardId]/page.tsx` redirecting to `/activity`. This slice redirects to `/statements` until activity ships — annotate README delta in the same Phase 5 changeset.
2. Action state lives in `actions/action-state.ts` (not `server/action-state.ts`) to keep plain object exports out of `"use server"` files — matches the cards fix.
3. Issue #10 (`Statement → User` FK) must land before seeding statements.
4. MVP immutability = write-once (create only). No `update-manual-statement.ts` / edit route / confirmed status field in this slice.
5. `getCardById` is added to the cards public API and consumed via `@/features/cards` only.
6. Issue #7 (cross-feature import bypass) remains deferred per Phase 3.

### Locked blueprint (Option 3)

#### Feature shape

```text
src/features/statements/
├── types.ts
├── schemas.ts
├── index.ts
├── utils/statement-period-label.ts
├── actions/
│   ├── action-state.ts         # no "use server"
│   └── create-manual-statement.ts
├── server/
│   ├── queries.ts
│   ├── repository.ts
│   └── service.ts
└── components/
    ├── statement-list.tsx
    ├── statement-row.tsx
    ├── manual-statement-form.tsx
    └── statement-document-link.tsx
```

#### Routes

```text
src/app/(dashboard)/cards/[cardId]/
├── layout.tsx          # requireOnboardedUser + getCardById + tabs
├── page.tsx            # redirect → /statements
├── details/page.tsx    # stub
└── statements/
    ├── page.tsx        # list
    └── new/page.tsx    # create form
```

#### Supporting changes

| Area | Change |
|------|--------|
| `prisma/schema.prisma` | Add `Statement.user` relation + `User.statements` (closes #10) |
| `prisma/seed.ts` | 2 statements per seeded card (last 2 billing cycles) |
| `src/features/cards/server/queries.ts` + `index.ts` | `getCardById(cardId, householdId)` wrapped with `React.cache()` |
| `src/lib/formatting/dates.ts` | `formatDateShort`, `formatDateRange` with `{ timeZone: "UTC" }` |
| Cards action-state | Include already-local `"use server"` state extraction in the implementation branch |

#### Ownership / lifecycle

- Layout: household-scoped card lookup → `notFound()` on miss
- Create action: re-verify card belongs to household before insert; set `userId` to recorder
- MVP immutability = write-once (create only; no update action/route)
- Money: Prisma `bigint` → DTO `number` at service/query boundary; display via `formatMoney(BigInt(...), currency)`
- `documentUrl`: external link if present, else "—"

#### Data flow

```text
app/cards/[cardId] routes
  → @/features/cards (getCardById cached)
  → @/features/statements public API
      → actions + action-state
      → components (list / row / form / document link)
      → service / queries
          → repository
              → Prisma Statement
```

### Test plan

| Layer | Coverage |
|-------|----------|
| Unit | Manual-statement Zod schema; date helpers / period label |
| Integration | Create statement with household ownership enforcement; Statement→User FK integrity |
| E2E | Open card → statements list (seeded) → create statement → list updates |

### Implementation sequence (Phase 5)

1. Schema + `db:push` + seed
2. Cards `getCardById` + dates util + action-state fix
3. Statements types / schemas / utils / repository / service / queries
4. Create action + form components
5. Card detail routes / layout / tabs
6. Tests + Phase 6 review

### Risks / deferred

- Base redirect to `/statements` instead of `/activity` — temporary until activity tab ships
- No statement detail page or edit/update path in MVP
- No PDF upload (metadata URL only)
- Line items / payment cross-reference deferred
- Issue #7 cross-feature import cleanup deferred to chore branch

**CHECKPOINT:** Phase 5 implementation approved 2026-07-19. Proceeded to Implementation.

---

## Phase 5: Implementation (2026-07-19)

### Goals

- [x] Apply schema fix #10 (`Statement → User`) and seed 2 statements per card.
- [x] Add `getCardById` (cached) to cards public API and shared UTC date helpers.
- [x] Ship `src/features/statements/` layered feature (types → schemas → repository → service/queries → actions → components).
- [x] Add card detail layout with Statements + Details tabs and create-statement page.
- [x] Enforce household ownership on layout and create path; write-once create only.
- [x] Include cards `"use server"` action-state extraction fix.
- [x] Green Vitest + Playwright coverage for schema, ownership, and create flow.

### What shipped

| Area | Detail |
|------|--------|
| Schema | `Statement.user` relation + `User.statements` (closes #10) |
| Seed | 8 statements (2 × 4 cards) |
| Cards | `getCardById` via `React.cache()`; portfolio links to card detail; action-state extracted |
| Shared | `src/lib/formatting/dates.ts` (`formatDateShort`, `formatDateRange`, UTC) |
| Feature | `src/features/statements/` — list, create form, document link, repository/service/queries/actions |
| Routes | `/cards/[cardId]` → statements; `/statements`, `/statements/new`, `/details` stub |

### Validation

- Vitest: **40 passed** (8 files)
- Playwright: **8 passed** (including new statements E2E)
- TypeScript / ESLint: clean (pre-existing payment `_previous` warnings only)

---

## Phase 6: Quality Review (2026-07-19)

### Goals

- [x] Review statements feature for bugs, ownership gaps, and convention violations.
- [x] Verify schema integrity and write-once create path against Phase 4 blueprint.
- [x] Identify missing tests and deferred follow-ups.
- [x] File GitHub issues for non-blocking findings; fix only Critical blockers if found.
- [x] Record review outcomes in this document before Phase 7.

### Completion evidence

Reviewed via code-reviewer. **No Critical blockers.** Phase 6 closes with issue filing. Recommended quick patch for #28 (XSS) and #29 (BigInt max) before real multi-user use.

### What looks solid

- Household ownership at layout + pages via `getCardById`
- `"use server"` only exports async actions; action-state separate
- Money as minor units; Zod + `useActionState`; UTC date formatting
- Integration ownership rejection test; feature imports via public API

### Findings filed

| Severity | Issue | Title |
|----------|-------|-------|
| Important | [#28](https://github.com/tekrogen/ebia-money-manager/issues/28) | Restrict `documentUrl` to http/https (stored XSS) — **patched** |
| Important | [#29](https://github.com/tekrogen/ebia-money-manager/issues/29) | Max bound on money inputs (BigInt RangeError) — **patched** |
| Important | [#30](https://github.com/tekrogen/ebia-money-manager/issues/30) | Household guard on `getStatementsForCard` |
| Important | [#31](https://github.com/tekrogen/ebia-money-manager/issues/31) | E2E cross-household URL traversal |
| Important | [#32](https://github.com/tekrogen/ebia-money-manager/issues/32) | Unique Statement period per card |
| Minor | [#33](https://github.com/tekrogen/ebia-money-manager/issues/33) | Form message color ignores success |
| Minor | [#34](https://github.com/tekrogen/ebia-money-manager/issues/34) | Table headers missing `scope="col"` |

Note: list+create E2E already exists in `tests/e2e/statements.spec.ts`; #31 covers the missing ownership-traversal case only.

---

## Remaining 7-phase checkpoints (slice #4)

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Discovery | Done (2026-07-15) | Scope confirmed |
| 2. Exploration | Done (2026-07-15) | code-explorer — patterns mapped |
| 3. Clarifying questions | Done (2026-07-15) | 8 defaults locked above |
| 4. Architecture | **Locked: Option 3 (Pragmatic Balance)** (2026-07-19) | See § Phase 4 above |
| 5. Implementation | **Done (2026-07-19)** | Merged via PR #26 |
| 6. Review | **Done (2026-07-19)** | 7 issues filed (#28–#34); no Critical |
| 7. Summary | Pending | Document + CHANGELOG |
