# PHASE-01 Slice #5 — Global Search

**Status:** Phases 1–7 complete (close-out)  
**Date:** 2026-07-19 (Discovery → Implementation) / 2026-07-20 (Review + Summary)  
**Remote:** https://github.com/tekrogen/ebia-money-manager  
**Issue:** [#38](https://github.com/tekrogen/ebia-money-manager/issues/38) (closed via PR #40)  
**Shipped:** PR [#40](https://github.com/tekrogen/ebia-money-manager/pull/40) · Release [v0.4.0](https://github.com/tekrogen/ebia-money-manager/releases) via PR [#27](https://github.com/tekrogen/ebia-money-manager/pull/27)  
**Feature workflow:** 7-phase (`/feature/workflow`)  
**Slice:** Phase 01 vertical slice #5  
**Canonical architecture:** `admin/internal/features/architecture/README.md` §36  

---

## Phase 1: Discovery

### Goals

- [x] Confirm Slice #5 is next feature work after Slice #4 close-out + cleanup (#30–#34)
- [x] Capture problem, architecture target, and current codebase reality
- [x] List searchable entities that exist today vs architecture MVP scope
- [x] Record assumptions, out-of-scope, and open questions for Phase 3
- [x] File tracking issue (#38) and start workflow doc

**Verdict:** Next feature work is **Phase 01 vertical slice #5 — Global Search**.

### What's done

| Slice | Status |
|-------|--------|
| #1 Auth + onboarding + cards + overview | Done |
| #2 Paydown priority + promo payoff | Done |
| #3 Payment runway + intent flow | Done (Phases 6–7 closed) |
| #4 Statements | Done (Phases 1–7); cleanup PR #37 for #30–#34 |

### What's next (slice #5)

| Surface | Status | Goal |
|---------|--------|------|
| `src/features/search/` | Missing | Search domain: types, schemas, service, queries, components |
| `components/layout/global-search.tsx` | Missing | Thin shell importing `@/features/search` |
| Dashboard header mount | Missing | Search in `DashboardShell` top bar (architecture §2 / §36) |
| Debounced client → server search | Missing | Grouped results with deep links, household/user scoped |

### Problem / user

Household members need a **fast way to find cards (and later transactions/merchants)** from anywhere in the dashboard — by name, last four, institution — without navigating through lists first.

### Key requirements (from architecture §36)

- Real MVP capability, not a shell placeholder
- Scope (architecture text):
  - **Transactions** — merchant name, memo, amount
  - **Cards** — name, last four, institution
  - **Merchants** — distinct / normalized merchant names
- `features/search/` owns UI + server search service
- Mount from dashboard shell; not a dedicated `/search` route (service reusable if route added later)
- Always scope by `userId` (project practice: also household for card ownership)
- Deep links; small result payloads; click-through loads full entities
- Debounced client shell → search action/route → `searchService.search({ userId, query })`

### Architecture file structure (target)

```text
features/search/
├── components/
│   ├── global-search.tsx
│   ├── search-results.tsx
│   └── search-result-group.tsx
├── server/
│   ├── queries.ts
│   └── service.ts
├── schemas/
│   └── search-query-schema.ts
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

### Codebase reality (verified 2026-07-19)

| Entity | In Prisma? | Searchable fields today | Deep link today |
|--------|------------|-------------------------|-----------------|
| **CreditCard** | Yes | `name`, `lastFour`, `issuerKey` / `institutionId` | `/cards/[cardId]` (statements/details) |
| **Statement** | Yes | period dates, balances (not in §36 scope) | `/cards/[cardId]/statements` |
| **Payment / PaymentIntent** | Yes | amounts, status (not in §36 scope) | `/payments/...` |
| **Transaction** | **No** | — | `/transactions/[id]` does not exist |
| **Merchant** | **No** | — | merchant-filtered txn URL does not exist |

Dashboard shell (`src/components/layout/dashboard-shell.tsx`) has brand + nav + sign-out only — **no search control**. No `features/search/` and no `global-search.tsx` stub.

### Gap vs architecture

Architecture §36 and §38 list transactions + merchants as MVP search targets, but **Phase 01 has not shipped a Transaction (or Merchant) model or routes**. Building full §36 literally would require either:

1. **Defer** txn/merchant result groups until those domains exist (search cards now; keep empty/stub groups or omit), or  
2. **Expand this slice** to introduce Transaction (+ optional Merchant) schema + seed + minimal list/detail — much larger than “global search,” or  
3. **Search adjacent existing records** (statements / payments) as interim substitutes — diverges from §36 naming.

**Discovery recommendation:** Treat Slice #5 as **cards-first global search** with architecture-shaped feature folder and result-group UI that can grow; explicitly defer transaction/merchant queries to a later slice (or a follow-up issue). Confirm in Phase 3.

### Assumptions

1. Cleanup #30–#34 (PR #37) can merge in parallel; search does not depend on it.
2. Search scopes to the **session user’s household** for cards (same pattern as cards/statements), even though §36 says `userId` only.
3. No dedicated `/search` page in this slice.
4. Minimum query length + debounce (e.g. 2+ chars, ~200–300ms) TBD in Defaults.
5. Institution display can use `issuerKey` until a real Institution entity exists.

### Out of scope (this slice)

- Transaction list / drawer / intercepting routes
- Merchant normalization / merchant entity
- Full-text / SQLite FTS indexes (start with `contains` / prefix filters)
- Notifications menu, sidebar refactor beyond mounting search
- Slice #6 reminder jobs

### Open questions (Phase 3)

Resolved 2026-07-19 — see Phase 3.

### Success criteria (slice done when)

- [x] Global search mounted in dashboard header + ⌘K / Ctrl+K
- [x] Household-scoped **cards**, **statements**, and **payments** results with deep links
- [x] Debounced client shell + Zod-validated server search
- [x] Unit/integration + E2E coverage green
- [x] Phases 6–7 review/summary complete

---

## Phase 2: Codebase Exploration

### Goals

- [x] Map dashboard shell mount points and auth/session helpers reusable by search
- [x] Trace how cards queries enforce household ownership (pattern to copy)
- [x] Inventory money/date formatting and public `index.ts` patterns for a new feature
- [x] Record exploration findings (gaps, reuse, risks) in this section

### Completion evidence

Exploration recorded 2026-07-19 (codebase walk + explore agent). Findings below.

### Findings

| Area | Finding |
|------|---------|
| **Shell** | `DashboardShell` is an RSC; mount Client `GlobalSearch` island in header (between nav and user). No search stub today. |
| **Auth** | `requireCurrentUser()` → `{ id, householdId, … }`. Actions must resolve scope server-side; never trust client `householdId`. |
| **Cards** | `getCardsForHousehold(householdId)` / `getCardById(cardId, householdId)` via `@/features/cards`. Prefer search-owned Prisma `contains` queries over returning full card DTOs. |
| **Statements** | Only `getStatementsForCard` today — **no household-wide search API**. Need new query joining `card: { householdId }`. |
| **Payments** | Runway is household-scoped with good labels; `PaymentIntent` is user-scoped; durable `Payment` has **no list API** / little seed use. |
| **Client patterns** | `useActionState` + forms everywhere; **no debounce, no ⌘K** precedent — new pattern required. |
| **Money** | `@/lib/formatting/money` `formatMoney(bigint, currency)` — format at service fence so Client never sees BigInt. |
| **Risks** | Weak statement ownership on list-by-card alone; payment deep links are page-level (`/payments/runway`); mobile header crowding. |

### Reuse map

| Need | Reuse |
|------|--------|
| Session | `requireCurrentUser()` |
| Format amounts | `formatMoney` from `@/lib/formatting/money` |
| Mount | `DashboardShell` + thin `components/layout/global-search.tsx` |
| Feature shape | Mirror statements/payments: types → schemas → server → components → `index.ts` |

---

## Phase 3: Clarifying Questions / Defaults

### Goals

- [x] Resolve open questions from Discovery
- [x] Lock defaults (debounce, min length, result caps, groups in/out)
- [x] Document decisions in this section before Architecture

### Completion evidence

User confirmed 2026-07-19: (1) defer Transaction/Merchant schema, (2) include statements + payments groups, (3) header + ⌘K.

### Locked decisions

| # | Decision | Locked default |
|---|----------|----------------|
| 1 | Transaction / Merchant | **Defer** — no new schema this slice |
| 2 | Result groups | **Cards + Statements + Payments** |
| 3 | Keyboard | **Header input + ⌘K / Ctrl+K** palette |
| 4 | Min query length | **2** characters (after trim) |
| 5 | Debounce | **250ms** |
| 6 | Cap | **5** results per group |
| 7 | Route | **No** dedicated `/search` page |
| 8 | Payments meaning | **RunwayItem** (household) + **submitted/processing PaymentIntent** (user); exclude draft/expired; durable `Payment` rows out of MVP |
| 9 | Scope | `householdId` for cards / statements / runway; `userId` for intents |
| 10 | Institution field | Match `issuerKey` / `network` until Institution entity exists |
| 11 | Money in results | Pre-format strings in service via `formatMoney` |
| 12 | Empty / short query | `< 2` chars → no fetch / clear results; `≥ 2` + zero hits → “No results for '…'” |

---

## Phase 4: Architecture Design

### Goals

- [x] Propose ≥2 approaches with trade-offs
- [x] Select one approach and document boundaries (feature public API, actions vs RSC)
- [x] Obtain explicit user approval before Phase 5
- [x] No implementation in this phase

### Completion evidence

Architecture options designed 2026-07-19. **Option A approved by user 2026-07-19.**

### Option comparison

| Dimension | A — Search-owned queries | B — Feature adapters | C — Inline in layout |
|-----------|--------------------------|----------------------|----------------------|
| Coupling | None (own Prisma reads) | Imports cards/statements/payments search helpers | Violates §36 feature folder |
| Extensibility | Add group = add query fn | Each feature must publish adapter | Refactor later when Transactions land |
| Testability | Clear service/integration surface | Split across features | Weak |
| Fit | Matches “search owns queries” constraint | Allowed via public API but coordination-heavy | Rejected |

### Recommendation

**Option A — Search-owned queries** in `src/features/search/`.

Why: matches architecture §36 + repo constraint that search owns household-filtered Prisma reads; keeps adapters out of other features; easy to add `transaction` / `merchant` kinds later.

### Locked blueprint (Option A)

#### Feature tree

```text
src/features/search/
├── types.ts
├── schemas.ts                 # searchQuerySchema min 2 / max 200
├── server/
│   ├── queries.ts             # searchCards / searchStatements / searchPayments
│   ├── service.ts             # Promise.all + formatMoney → SearchGroupsDTO
│   └── actions.ts             # searchAction(query) — requireCurrentUser
├── components/
│   ├── search-palette.tsx
│   ├── search-result-group.tsx
│   └── search-result-item.tsx
└── index.ts

src/components/layout/
├── global-search.tsx          # Client island: debounce, ⌘K, mounts palette
└── dashboard-shell.tsx        # inject <GlobalSearch />
```

#### Data flow

```text
Header input or ⌘K/Ctrl+K
  → GlobalSearch (Client): debounce 250ms, useTransition
    → searchAction(query)
      → requireCurrentUser() + Zod
        → searchService.search({ userId, householdId, query })
          → Promise.all([cards, statements, payments])
            → SearchGroupsDTO (strings only; no BigInt on client)
              → SearchPalette (listbox, arrows, Enter, Escape)
```

#### Result DTO

```ts
type SearchResultKind = "card" | "statement" | "payment";

type SearchResultItem = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  meta: string | null;
  href: string;
};

type SearchGroupsDTO = {
  query: string;
  groups: {
    cards: SearchResultItem[];
    statements: SearchResultItem[];
    payments: SearchResultItem[];
  };
  totalCount: number;
};
```

#### Deep links

| Kind | href |
|------|------|
| Card | `/cards/[id]` |
| Statement | `/cards/[cardId]/statements` |
| Payment (runway / submitted intent) | `/payments/runway` |

#### Ownership

| Group | Scope |
|-------|--------|
| Cards | `householdId`, not archived |
| Statements | `card.householdId` |
| RunwayItem | `householdId` |
| PaymentIntent | `userId` + status in `submitted` \| `processing` |

#### Keyboard / a11y (MVP)

- ⌘K / Ctrl+K opens; Escape closes and restores focus
- Arrow keys + Enter navigate; `role="dialog"` + combobox/listbox + `aria-live` for count
- Manual focus trap (no new dependency unless tests force it)

#### File estimate

~14 files (9 new source, 1 shell mod, 3 unit/integration, 1 E2E). Sequence: types/schema/action stub → queries/service → palette UI → shell mount → tests.

#### Risks / deferred

- Transactions / merchants still deferred
- Statement period match is ISO substring (`2026-07`), not “July 2026”
- Runway has no per-item route — all payment hits land on `/payments/runway`
- SQLite `contains` ASCII case-folding only

#### Test plan

- Unit: schema trim/min/max; service DTO + money fence + href mapping
- Integration: cross-household / cross-user isolation for all three groups
- E2E: ⌘K → type seeded card name → Enter → `/cards/[id]`; Escape restores focus

### Decision

**Locked: Option A — Search-owned queries** (approved 2026-07-19).

---

## Phase 5: Implementation

### Goals

- [x] Implement approved architecture on `feat/38-global-search`
- [x] Tests green; PR opens with `Closes #38`

### Completion evidence

Implemented Option A: `src/features/search/`, header `GlobalSearch` + ⌘K/Ctrl+K, cards/statements/payments groups. Vitest 52; Playwright search E2E 2/2 green.

---

## Phase 6: Quality Review

### Goals

- [x] Code review against conventions and ownership rules
- [x] File follow-up issues for residual defects

### Completion evidence

Code review completed 2026-07-20 against shipped search on `main` (PR #40). Findings filed as GitHub issues below. No BigInt client leakage; household scoping correct for cards/statements/runway.

### Findings

| # | Severity | Issue | Tracking |
|---|----------|-------|----------|
| 1 | Critical | Stale debounced response can overwrite newer results | [#41](https://github.com/tekrogen/ebia-money-manager/issues/41) |
| 2 | Critical | Server action + client component co-exported from undirected barrel | [#42](https://github.com/tekrogen/ebia-money-manager/issues/42) |
| 3 | Important | Combobox missing accessible name; group headings not `aria-labelledby` | [#43](https://github.com/tekrogen/ebia-money-manager/issues/43) |
| 4 | Important | Swallowed search errors / dead outer try/catch | [#44](https://github.com/tekrogen/ebia-money-manager/issues/44) |
| 5 | Important | PaymentIntent results user-scoped inside household Payments group (design) | [#45](https://github.com/tekrogen/ebia-money-manager/issues/45) |
| 6 | Minor | `contains` without `mode: 'insensitive'` (PG readiness) — note on #44 | (bundle) |
| 7 | Minor | Integration `deleteMany` truncates shared test DB — noted, no issue | — |

### Recommended fix order

1. #41 race → 2. #43 a11y → 3. #44 logging → 4. #42 barrel → 5. #45 design decision

---

## Phase 7: Summary

### Goals

- [x] Document what shipped, test counts, and next slice
- [x] Update CHANGELOG / workflow index as needed

### What shipped

- `src/features/search/` — types, Zod schema, search-owned Prisma queries, service, `searchAction`, palette UI
- Dashboard header `GlobalSearch` + ⌘K / Ctrl+K
- Result groups: cards, statements, payments (runway + submitted/processing intents)
- Tests: unit (schema + mapping), integration (ownership), E2E (⌘K + Escape)
- Released in **v0.4.0** (PR #27) alongside statements slice work

### Test coverage (at ship)

- Vitest: 52+ (grew with statements unique-period tests after #37)
- Playwright: search E2E 2/2 green at merge

### Follow-ups before/during next work

- Patch Phase 6 issues **#41–#44** (and decide **#45**) — prefer a small cleanup PR before or at the start of Slice #6
- Optional CI chore: bump `googleapis/release-please-action@v4` → `@v5` (Node 24; silences deprecation warning) — **not** Slice #5 scope

### What's next (remaining Phase 01)

1. ~~Slice #5 — Global search~~ **Done** (Phases 1–7)
2. **Slice #6 — Reminder jobs** (canonical per `PHASE-01.md` / architecture)
3. Older backlog **#7–#20** (cards/overview/auth) — **not** assigned to Slice #6 in source docs; schedule as an explicit cleanup pass or expand Slice #6 Discovery to include them by decision

---

## Notes for agents

- Architecture §36 still lists transactions/merchants; deferred until those domains exist.
- Do not add AI `Co-Authored-By` trailers to commits in this repo.
