# Changelog

All notable work on Credit Card Manager is tracked here.

## [Unreleased] — Phase 01 (2026-07-11)

### Architecture
- Authored App Router architecture guide (`admin/internal/features/architecture/README.md`) covering feature folders, money rules, hybrid sync, statements, household, paydown, payment runway, search, and phased MVP.
- Captured UIUX mockup package under `admin/internal/features/credit-card-manager-mockup/`.
- Defined Phase 01 workflow (`admin/internal/workflows/2607110948-PHASE-01.md`).

### Added
- Scaffolded Next.js 16 App Router app (`src/`) with Tailwind 4, Poppins/Manrope, Tekrogen-inspired tokens.
- Prisma 6 schema + SQLite datasource for household, cards, promo periods, statements, payments/intents, preferences, notifications, audit events.
- Auth stub: cookie session + demo sign-in (`Continue as Marti`).
- Onboarding manual add-card flow; dashboard cards table with owner/shared labels and utilization badges.
- Overview portfolio metric grid (balance, available credit, utilization, min payments).
- Paydown feature: high-utilization priority ranking + 0% promo payoff plan with interest impact callouts.
- Household settings page listing members.
- Placeholder routes for payments and payment runway (slice #3).
- Local DB path `admin/internal/data/dev.db` with seed data (demo household, members, cards, promos).

### Stack defaults
- pnpm, Next.js 16, React 19, Prisma 6, Zod 4, SQLite for local MVP.
- Manual-first data model; aggregator sync deferred.

### Not yet (remaining Phase 01)
- Slice #3: payment runway + payment intent flow (blocked on Exploration until harness gate closes).
- Statements, global search, reminder jobs.

### Testing
- Vitest + Playwright harness under `tests/` (architecture layout).
- Slices 1–2 covered: unit (money, card schema, promo-math), integration (create-card + household), e2e (sign-in → overview/cards/paydown).
- CI (`.github/workflows/ci.yml`), release-please, husky/commitlint, issue templates, `BRANCH-WORKFLOWS.md` (trunk-based).
