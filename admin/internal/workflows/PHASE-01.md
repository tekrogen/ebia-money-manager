# PHASE-01 — Payment runway + payment intent flow

**Status:** Phase 4 locked (Option 2 feature architecture) — awaiting Implementation approval  
**Date:** 2026-07-12 (Discovery) / 2026-07-13 (Exploration + defaults)  
**Remote:** https://github.com/tekrogen/ebia-money-manager  
**Feature workflow:** 7-phase (`/feature/workflow`)  
**Slice:** Phase 01 vertical slice #3

---

## Phase 1: Discovery

**Verdict:** Next *feature* work is **Phase 01 vertical slice #3 — Payment runway + payment intent flow**.

**Gate before Exploration:** Install/configure Vitest + Playwright and validate **what’s already done** (slices 1–2). Phase-end validation rules in `README.md` apply — do not skip ahead to slice #3 Exploration while the harness/validation gate is open.

### What’s done

Slices 1–2 are shipped: auth stub, onboarding, cards table, overview metrics, paydown priority, promo payoff. Prisma already has `PaymentIntent` / `Payment` models.

### What’s next (slice #3)

| Surface | Status | Goal |
|---------|--------|------|
| `/payments` | Placeholder | Upcoming payments + history + entry to runway / one-click pay |
| `/payments/runway` | Placeholder | Calendar lanes, strategies, drag to reschedule **planned** pay dates |
| `/payments/new` (+ steps) | Missing | Intent lifecycle: card → amount → account → schedule → review → success |

### Problem / user

Household members need a **planning calendar** for when to pay which cards, and a **manual payment intent flow** that starts from runway (or Payments) with card + amount prefilled — without building an in-house autopay scheduler.

### Key requirements (from architecture)

- Cards = lanes; due events on a calendar; strategies: `avalanche` \| `snowball` \| `by_due_date` \| `by_statement_close`
- Drag updates `plannedPayDate` only — not issuer contractual due dates
- One-click pay → `/payments/new` with prefill
- Interest impact reuses `features/paydown` helpers
- Money stays integer minor units; feature code under `features/payments/`
- Autopay = provider-managed only; else reminders + one-click pay

### Assumptions

1. Slice #3 is the full next *feature* scope (not jumping to statements/search/reminders).
2. Manual / stub payment submit is fine (no real bank provider yet).
3. `RunwayItem` may need a new model or derived view — schema doesn’t have it yet.
4. Route-driven stepper is preferred over a pure client store (architecture Option A).
5. Test harness + green suites for shipped work are a **prerequisite** to Exploration for slice #3.

### Explicitly deferred

Aggregator/Plaid, in-house autopay, rewards, landing marketing, statements, global search, reminder jobs.

### Discovery checkpoint

Confirm slice #3 feature scope — but **run the validation gate below first** before Phase 2 (codebase exploration).

---

## Validation gate — test what’s done (slices 1–2)

Per `admin/internal/workflows/README.md`: phase-end validation uses Vitest + Playwright; file issues for gaps; follow GIT-Workflows branching.

### Harness (2026-07-12)

| Tool | Config | Scripts |
|------|--------|---------|
| Vitest | `vitest.config.ts` | `pnpm test` / `pnpm test:watch` |
| Playwright | `playwright.config.ts` | `pnpm test:e2e` / `pnpm test:e2e:ui` |

Layout matches architecture: `tests/unit/**`, `tests/integration/**`, `tests/e2e/**`.

### Suites covering shipped work

| Suite | Path | Coverage |
|-------|------|----------|
| Unit | `tests/unit/cards/calculate-utilization.test.ts` | money / utilization |
| Unit | `tests/unit/cards/create-card-schema.test.ts` | manual card Zod schema |
| Unit | `tests/unit/paydown/promo-math.test.ts` | promo months / payoff / interest |
| Integration | `tests/integration/cards/create-card.test.ts` | create card + household owner enforcement |
| E2E | `tests/e2e/slices-01-02.spec.ts` | sign-in → overview metrics; cards table; paydown + promo panels |

### Results (2026-07-12)

- [x] Vitest: **19 passed** (15 unit + 4 integration)
- [x] Playwright: **3 passed** (seeded DB required: `pnpm db:seed`)
- [x] Lint: green (mockup extract ignored)
- [x] Commitlint: conventional + no-emoji rule
- [ ] Branch/PR for this gate work (when committing)

### Follow-up issues — done in-repo (2026-07-12)

| Item | Status | Location |
|------|--------|----------|
| CI wiring | Done | `.github/workflows/ci.yml` (lint, vitest, playwright, commitlint on PR) |
| Integration tests | Done | `tests/integration/cards/create-card.test.ts` + global setup → `test.db` |
| release-please + issue templates | Done | `release-please-config.json`, `.release-please-manifest.json`, `.github/workflows/release-please.yml`, `.github/ISSUE_TEMPLATE/` |
| Branch / commit conventions | Done | `BRANCH-WORKFLOWS.md` (trunk-based; not ebia’s multi-tier), husky + commitlint |

Patterns mirrored from sibling `ebia` (CI/release/husky/commitlint/templates), adapted for this app’s trunk-based + SQLite MVP.

---

## Remaining 7-phase checkpoints (slice #3)

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Discovery | Done | Confirmed |
| Gate: harness + slices 1–2 + tooling | Green; on `main` @ origin | https://github.com/tekrogen/ebia-money-manager |
| 2. Exploration | Done (2026-07-13) | See § Phase 2 below |
| 3. Clarifying questions | Done (defaults 2026-07-13) | See § Phase 3 below |
| 4. Architecture | **Locked: Option 2 (feature architecture)** | See § Phase 4 below |
| 5. Implementation | Pending | After approach approval |
| 6. Review | Pending | code-reviewer |
| 7. Summary | Pending | Document shipped work + update CHANGELOG |

---

## Phase 2: Codebase Exploration Summary

### Existing Patterns

- **Feature public API via `index.ts`** — cross-feature imports only through `@/features/<domain>` (files: `src/features/{paydown,cards,authentication,overview,household}/index.ts`)
- **Server action + Zod + `useActionState`** — gold standard: `create-card.ts` / `add-card-form.tsx` (`CreateCardState`, `fieldErrors`, `revalidatePath`, `redirect`)
- **Thin dashboard pages** — `requireOnboardedUser()` → parallel fetch → pass props to feature components (`overview/page.tsx`)
- **Service owns Prisma** — no separate repository layer yet (`paydown/server/service.ts`, `cards/server/service.ts`)
- **Money** — `bigint` minor units + ISO currency; display via `formatMoney` / `formatPercent` (`lib/formatting/money.ts`)
- **Dates** — calendar `YYYY-MM-DD` strings in domain; `paymentDueDay` is day-of-month int on cards

### Architecture (payments gap)

```
src/app/(dashboard)/payments/**          ← stubs only (nav already wired)
src/features/payments/                   ← DOES NOT EXIST — create whole feature
prisma PaymentIntent / Payment           ← schema ready; unused by app code
```

### Conventions to follow

- Household-scoped data (`householdId`), never user-owned cards alone
- Attribution labels: Shared vs member displayName
- Continue `revalidatePath` (no `revalidateTag` infrastructure yet)
- BigInt → Client: format server-side or coerce carefully (runway is a Client shell)

### Reusable components / helpers

| Piece | Use for slice #3 |
|-------|------------------|
| `getCardsForHousehold` | Runway lanes + card picker |
| `promo-math.ts` | Interest impact (export via paydown `index.ts`) |
| `formatMoney` / utilization | Amounts, urgency |
| `create-card` action/form | Mirror for payment intent steps |
| `signInAsMarti` e2e helper | Slice #3 Playwright specs |

### Key files

1. `prisma/schema.prisma` — PaymentIntent / Payment ready
2. `src/features/cards/server/queries.ts` — lane data
3. `src/features/cards/actions/create-card.ts` — action pattern
4. `src/features/paydown/utils/promo-math.ts` — runway interest math
5. `src/app/(dashboard)/payments/{page,runway/page}.tsx` — stubs to replace
6. `src/components/layout/dashboard-shell.tsx` — Payments / Runway nav

### Gaps that need decisions (→ Phase 3)

1. **RunwayItem persistence** — no model; drag needs somewhere to store `plannedPayDate`
2. **PaymentIntent.accountId** — no Prisma relation to `FinancialAccount` (Payment has it; Intent does not)
3. **Due dates** — seed has `paymentDueDay` only; runway needs calendar dates (derive utility)
4. **FinancialAccount seed** — account step empty without at least one demo account
5. **Strategy sort** — `avalanche | snowball | by_due_date | by_statement_close` specified, not implemented
6. **promo-math / ownerLabel** — not on public APIs yet; extract before cross-feature use

### Recommended tests for Implementation

- Unit: `sort-runway-strategy`, `calculate-payment-options`, planned-date reschedule
- Integration: create-payment-intent, reschedule-runway-item
- E2E: `slice-03-runway.spec.ts`, `slice-03-payment-flow.spec.ts`

---

## Phase 3: Clarifying answers (defaults)

| # | Decision | Default chosen |
|---|----------|----------------|
| 1 | Runway drag persistence | **New `RunwayItem` model** (`plannedPayDate`, amount, source, cardId, householdId) |
| 2 | Account step | **Seed one demo `FinancialAccount`**; keep account step in the flow |
| 3 | Intent stepper | **Full route-driven Option A** (`/payments/new` → amount → account → schedule → review → success) |
| 4 | Due dates | **Derive next calendar date from `paymentDueDay`**; `by_statement_close` uses `statementCloseDay` when set, else falls back to due date |
| 5 | Shared helpers | **Export `promo-math` from paydown `index.ts`**; **extract `ownerLabel` to household** |
| 6 | `/payments` page | **Thin**: upcoming hero + links to runway / make payment; light history stub OK |
| 7 | Runway client state | **Local React state / `useReducer`** — no Zustand |
| 8 | Remote | **GitHub** [`tekrogen/ebia-money-manager`](https://github.com/tekrogen/ebia-money-manager) (already `origin`) |

Also in scope for schema polish: add `PaymentIntent` → `FinancialAccount` Prisma relation (parity with `Payment`).

---

## Phase 4: Architecture options (awaiting choice)

### Option 1: Minimal Changes
**Approach:** Smallest delta — mirror create-card loops, service→Prisma like paydown, `?intentId=` query param through Option A steps, HTML5 drag, surgical promo-math/ownerLabel exports.  
**Files:** ~36 (~29 new)  
**Pros:** Fastest; max pattern reuse; independently verifiable steps  
**Cons:** Less structure for intent mutation lifecycle; drag UX rough on touch  
**Detail:** [minimal architect](f0f072de-ac5a-435b-b764-5f7c06311519)

### Option 2: Clean Architecture
**Approach:** Explicit layers (types → schemas → utils → queries/service → actions → components); thin **write** repository for PaymentIntent lifecycle; RunwayItemDTO with bigint→number at boundary; useReducer BEGIN/COMMIT/REVERT for drag.  
**Files:** ~45  
**Pros:** Best maintainability; strong client/server money typing; ownership guards centralized  
**Cons:** Heavier than siblings; repository is a new pattern for this repo  
**Detail:** [clean architect](82a7d769-a693-4ca0-a1e7-c9e2a303086b)

### Option 3: Pragmatic Balance (recommended)
**Approach:** Same locked defaults; service→Prisma (match existing features); DB-backed intent via URL `paymentIntentId`; HTML5 drag + useReducer; serialize BigInt once at query boundary; stub payment provider; 37 must-have files in ~4 commits; isolate nice-to-haves (payment-options util, runway-summary, history stub).  
**Files:** ~37 must-have (+3 optional)  
**Pros:** Speed + quality; CI-green commit chunks; no new runtime deps; matches Phase 01 MVP appetite  
**Cons:** HTML5 drag touch limits (file follow-up issue); no write repository  
**Detail:** [pragmatic architect](372c80da-a60e-4b64-8ea4-09294235a97b)

### Recommendation

**Option 3 — Pragmatic Balance**, because:
- Honors all Phase 3 defaults without over-abstracting beyond current codebase patterns
- Keeps intent refresh/back-button correct (DB + URL) without cookies/Zustand
- Separates must-have vs nice-to-have so the slice can ship without blocking polish
- Defers dnd-kit / write-repository as tracked follow-ups, not blockers

### Decision (2026-07-15)

**Option 2 — feature architecture with layered boundaries.** Not textbook Clean Architecture. Implements what `admin/internal/features/architecture/README.md` already specifies.

Terminology:
- **Actions** orchestrate user requests
- **Services** contain business rules
- **Repositories** own persistence and transactions (only for mutation-lifecycle domains)
- **Queries** are read-only
- **Providers** abstract external integrations (starting with `ManualPaymentProvider`)
- **DTOs** define the server-to-client contract
- **Components** remain presentation-focused

Scope: payments only. Other features (cards, paydown) keep collapsed service→Prisma until they grow a mutation lifecycle. This is not a mandate to restructure the entire repo.

**CHECKPOINT:** Implementation approval needed. Proceed?

---

## Phase-end validation (required)

At the end of **each** phase (and before PR merge for implementation), run validation:

### Tests

- **Vitest** — unit / integration coverage for domain logic (runway strategies, payment options, intent state).
- **Playwright** — e2e for critical paths (`/payments/runway` drag/reschedule, `/payments/new` intent flow, one-click prefill).

Harness is installed. Slice #3 e2e specs are **not** written yet — add them during Implementation of slice #3.

### Issues from testing

File any failures, gaps, flakes, or deferred edge cases as GitHub issues (do not lose them in chat). Use templates from the shared library:

- `/Volumes/SERV01-DTMAC/_Code_Library/GIT-Workflows/issues-template/`
  - `bug_report.md` — test failures / regressions
  - `feature_request.md` — follow-up product gaps
  - `task.md` — harness setup, CI wiring, tech debt

### Branching & commits

Follow shared GIT-Workflows policy:

| Guide | Path |
|-------|------|
| Branch lifecycle | `/Volumes/SERV01-DTMAC/_Code_Library/GIT-Workflows/BRANCH-WORKFLOWS.md` |
| Incremental commits | `/Volumes/SERV01-DTMAC/_Code_Library/GIT-Workflows/incrementally-commit-based-on-file-creation.md` |
| Commit grouping scripts | `/Volumes/SERV01-DTMAC/_Code_Library/GIT-Workflows/utils/git/` |
| release-please | `/Volumes/SERV01-DTMAC/_Code_Library/GIT-Workflows/release-please/` |
| Issue templates | `/Volumes/SERV01-DTMAC/_Code_Library/GIT-Workflows/issues-template/` |

**Branch naming:** `<type>/<issue#>-<short-slug>` (e.g. `feat/42-payment-runway`)  
**Commits:** Conventional Commits, no leading emoji (release-please). Prefer grouped incremental commits via `utils/git/` dry-run then apply.  
**PR:** Conventional title + `Closes #N`; squash-merge when CI green.  
**Surfaced follow-ups:** file issues; do not block merge on non-blockers.

### Validation checklist (copy per phase close-out)

- [ ] Phase deliverable complete and recorded in this file (or CHANGELOG for Implementation)
- [x] Vitest suite green (slices 1–2 unit + integration)
- [x] Playwright e2e green for shipped paths (slices 1–2)
- [x] Test-related tooling landed (CI, release-please, issue templates)
- [ ] Work on correctly named branch tied to a tracked issue
- [ ] Conventional commits; dry-run grouping when many files
- [ ] No secrets / `*.db` / mockup binaries committed

---

## Prior Phase 01 slices (context)

1. ~~Scaffold Next.js app — App Router groups, features shells, auth stub.~~ **Done**
2. ~~Lock data model — Prisma + SQLite.~~ **Done**
3. ~~Vertical slice #1 — Sign in → onboarding → /cards → /overview.~~ **Done** (+ e2e)
4. ~~Vertical slice #2 — Paydown priority + promo payoff.~~ **Done** (+ e2e / unit promo-math)
5. **Vertical slice #3 — Payment runway + `/payments/new` intent flow.** ← next *after* gate
6. Then statements, search, reminders/jobs — still MVP, after the core loop works.

### How to run (local)

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm test
pnpm test:e2e
pnpm dev
```

Sign in as Marti → Overview (metrics + paydown + promo plan) + Cards table.
