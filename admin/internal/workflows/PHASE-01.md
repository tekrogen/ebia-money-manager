# PHASE-01 — Payment runway + payment intent flow

**Status:** Discovery complete — **validation gate green locally** (CI/release/issue templates + integration tests in place). Exploration unblocked after stakeholder confirm + commit/branch.  
**Date:** 2026-07-12  
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
| 1. Discovery | Done (this file) | Confirm with stakeholder |
| **Gate: harness + slices 1–2 tests + tooling** | **Green locally** | Ready for Exploration after confirm |
| 2. Exploration | Pending | code-explorer: payments / paydown / cards patterns |
| 3. Clarifying questions | Pending | Fill gaps before architecture |
| 4. Architecture | Pending | code-architect options + recommendation |
| 5. Implementation | Pending | After approach approval |
| 6. Review | Pending | code-reviewer |
| 7. Summary | Pending | Document shipped work + update CHANGELOG |

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
