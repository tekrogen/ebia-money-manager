# Changelog

All notable work on Credit Card Manager is tracked here.
Format follows [Keep a Changelog](https://keepachangelog.com/); versions use [Semantic Versioning](https://semver.org/).

## [0.3.1](https://github.com/tekrogen/ebia-money-manager/compare/v0.3.0...v0.3.1) (2026-07-15)


### Bug Fixes

* **payments:** enforce ownership checks and close Phase 6/7 review ([3606243](https://github.com/tekrogen/ebia-money-manager/commit/36062435a61804c986da3d54bf32aa15f7466a90))
* **payments:** enforce ownership checks and close Phase 6/7 review ([f85abe8](https://github.com/tekrogen/ebia-money-manager/commit/f85abe8e7b15a2ef11e79653e945feee7db0dba4))

## [0.3.0](https://github.com/tekrogen/ebia-money-manager/compare/v0.2.0...v0.3.0) (2026-07-15)


### Features

* **payments:** payment runway + intent flow (Phase 01 slice [#3](https://github.com/tekrogen/ebia-money-manager/issues/3)) ([331c72e](https://github.com/tekrogen/ebia-money-manager/commit/331c72ede959041bf4ac97ad8304a4b0a3ab4647))


### Bug Fixes

* **ci:** add DATABASE_URL env for Prisma in GitHub Actions ([8685d38](https://github.com/tekrogen/ebia-money-manager/commit/8685d3835e923a5cfdc2173f43e8f2334627e3aa))

## [0.2.0] — 2026-07-15

### Phase 01 Slice #3 — Payment Runway + Payment Intent Flow

Feature workflow phases completed: Discovery → Validation Gate → Exploration → Questions/Defaults → Architecture → Implementation.

#### Phase 1: Discovery (2026-07-12)

- Confirmed slice #3 scope: `/payments/runway` planning calendar + `/payments/new` manual intent stepper.
- Identified prerequisite: test harness for slices 1–2 must be green before Exploration.

#### Validation Gate (2026-07-12)

- Installed Vitest + Playwright; configured `vitest.config.ts`, `playwright.config.ts`.
- Wrote unit tests for money/utilization, card schema, promo-math (15 pass).
- Wrote integration tests for create-card + household attribution (4 pass).
- Wrote E2E tests for slices 1–2: sign-in → overview → cards → paydown (3 pass).
- Ported CI, release-please, husky/commitlint, issue templates from `ebia`.
- Branch `chore/1-validation-gate` merged to `main`.

#### Phase 2: Exploration (2026-07-13)

- Mapped existing patterns (feature `index.ts` public API, server action + Zod, thin pages, service→Prisma).
- Identified 6 gaps requiring decisions: RunwayItem persistence, Intent→Account relation, due-date derivation, FinancialAccount seed, strategy sort, promo-math/ownerLabel exports.
- Catalogued reusable helpers and key files for slice #3.

#### Phase 3: Questions/Defaults (2026-07-13)

- Locked 8 decisions: new `RunwayItem` model, seed demo `FinancialAccount`, full route-driven stepper, derive dates from `paymentDueDay`, export promo-math + ownerLabel, thin `/payments` page, local `useReducer`, GitHub remote confirmed.
- Added `PaymentIntent → FinancialAccount` relation to scope.

#### Phase 4: Architecture (2026-07-15)

- Evaluated 3 options (Minimal Changes, Clean Architecture, Pragmatic Balance).
- Locked **Option 2: feature architecture with layered boundaries** — explicit types → schemas → utils → repository/service → actions → components layers for `payments` domain only.

#### Phase 5: Implementation (2026-07-15)

##### Schema
- `RunwayItem` model with `RunwayItemSource` enum (`minimum`, `promo_plan`, `custom`).
- `PaymentIntent → FinancialAccount` relation.

##### Seed
- `FinancialAccount` ("Chase Checking ••4821") for Marti's household.

##### Shared extractions
- `promo-math` utilities re-exported from `paydown` feature public API.
- `getOwnerLabel` extracted to `src/features/household/utils/owner-label.ts`.

##### Feature: `src/features/payments/`

| Layer | Files |
|-------|-------|
| Types/DTOs | `types.ts` — `RunwayStrategy`, `RunwayItemDTO`, `PaymentIntentDTO`, `FinancialAccountDTO`, `PaymentCardOption`, `RunwayDashboardDTO`, `InterestPreview` |
| Schemas | `schemas.ts` — Zod for `selectCard`, `selectAmount`, `selectAccount`, `confirmIntent`, `rescheduleRunwayItem` |
| Utils | `utils/runway-helpers.ts` — `sortRunwayItems`, `deriveDueDate`, `computeAmountMinor` |
| Repository | `server/intent-repository.ts` — PaymentIntent full CRUD lifecycle |
| Service | `server/runway-service.ts` — dashboard query + `generateRunwayFromCards` |
| Queries | `server/payment-queries.ts` — card options + financial accounts |
| Actions | `server/actions.ts` — 6 server actions (start, select card/amount/account, confirm, reschedule, regenerate) |
| State | `server/action-state.ts` — shared `IntentActionState` type |
| Components | `RunwayTable`, `SelectCardStep`, `SelectAmountStep`, `SelectAccountStep`, `ConfirmStep`, `GenerateRunwayButton` |

##### Routes
- `/payments/runway` — runway dashboard with generate + "Make a payment" CTA.
- `/payments/new?intentId=` — multi-step stepper (Card → Amount → Account → Confirm).
- `/payments` — redirects to active draft or runway.

### Changed
- `tsconfig.json` target bumped `ES2017 → ES2022` (fixes pre-existing BigInt literal errors across codebase).

### Testing (Phase 5 validation)
- **Unit/Integration:** 34 tests, 6 files — all passing.
  - New: `tests/unit/payments/runway-helpers.test.ts` (sort strategies, due dates, amount computation).
  - New: `tests/integration/payments/intent-lifecycle.test.ts` (draft → submitted lifecycle, runway CRUD).
- **E2E:** 7 tests (4 new + 3 existing) — all passing.
  - New: `tests/e2e/payments-runway.spec.ts` (page load, generate items, start intent flow, card selection step).
- **Validation:** lint clean, production build green, all routes compiled.

---

## [0.1.0] — 2026-07-11

### Phase 01 Slices #1–2: Scaffold, Auth, Overview, Cards, Paydown

#### Architecture
- App Router architecture guide (`admin/internal/features/architecture/README.md`): feature folders, money rules, hybrid sync, statements, household, paydown, payment runway, search, phased MVP.
- UIUX mockup package captured under `admin/internal/features/credit-card-manager-mockup/`.
- Phase 01 workflow initiated (`admin/internal/workflows/PHASE-01.md`).

#### Added
- Next.js 16 App Router app (`src/`) with Tailwind 4, Poppins/Manrope, Tekrogen-inspired tokens.
- Prisma 6 schema + SQLite: household, cards, promo periods, statements, payments/intents, preferences, notifications, audit events.
- Auth stub: cookie session + demo sign-in (`Continue as Marti`).
- Onboarding manual add-card flow; dashboard cards table with owner/shared labels and utilization badges.
- Overview portfolio metric grid (balance, available credit, utilization, min payments).
- Paydown feature: high-utilization priority ranking + 0% promo payoff plan with interest impact callouts.
- Household settings page listing members.
- Local DB path `admin/internal/data/dev.db` with seed data (demo household, members, cards, promos).

#### Stack defaults
- pnpm, Next.js 16, React 19, Prisma 6, Zod 4, SQLite for local MVP.
- Manual-first data model; aggregator sync deferred.
