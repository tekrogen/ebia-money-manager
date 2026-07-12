# CLAUDE.md

Guidance for agents working in this repository.

## What this project is

Personal **Credit Card Manager** — household credit-card ops (limits, utilization, 0% promos, paydown, payment runway). Not a general net-worth / brokerage app; landing mockup marketing copy is aspirational and out of MVP scope.

## Source of truth

| Doc | Role |
| --- | --- |
| `admin/internal/features/architecture/README.md` | App Router structure, domain model, MVP vs later |
| `admin/internal/workflows/PHASE-01.md` | Phase 01 discovery + checklist |
| `CHANGELOG.md` | What shipped |

UIUX reference: `admin/internal/features/credit-card-manager-mockup/` (zip/extracted gitignored; do not commit binaries).

Related planning also exists in sibling repo `personal-finance-apps/personal-credit-card-manager` — verify against *this* repo’s files before assuming parity.

## Stack (locked for Phase 01)

- Next.js 16 App Router + React 19 + Tailwind 4 + pnpm
- Prisma **6** + SQLite (avoid Prisma 7 for local SQLite simplicity)
- Zod for action validation
- Cookie session stub (`ccm_session`) — not production auth

## Local database

- File: `admin/internal/data/dev.db`
- `DATABASE_URL` in `.env`: `file:../admin/internal/data/dev.db` (path is relative to `prisma/`)
- Bootstrap: `pnpm db:push && pnpm db:seed`
- Demo login: Continue as Marti (`marti@example.com` seeded)

Never commit `.env` or `*.db`.

## Architecture conventions (non-obvious)

- `admin/` = planning/docs only; runtime app lives under `src/`.
- Feature code in `src/features/<domain>/`; routes stay thin in `src/app/`.
- Cross-feature imports go through feature `index.ts` public API — not another feature’s repository.
- Money: integer minor units + ISO 4217 currency; no float as source of truth.
- Cards belong to a **household**; attribution is `member` | `shared` (labels like Marti/Bob/Shared).
- Promo APR is a first-class `PromoPeriod`, not derived UI state.
- Webhooks (later) = change notifications; provider fetch/reconcile is durable truth.
- Autopay MVP: provider-managed only; else reminders + one-click pay — **no** in-house scheduler.
- Payment runway drag reschedules **planned** pay dates, not issuer contractual due dates.

## Phase 01 status

Done: scaffold, schema, auth stub, onboarding/cards/overview metrics, paydown priority + promo payoff.

Next: slice #3 — `/payments/runway` + `/payments/new` intent flow; then statements, search, reminder jobs.

## Commands

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm test
pnpm test:e2e
pnpm dev
pnpm lint
```

## Gotchas discovered this session

- `create-next-app` cannot scaffold into a non-empty root that already has `admin/`; scaffold then merge, or create in a temp dir and move.
- pnpm may ignore native build scripts until packages are approved; Prisma client postinstall must succeed before `db:push`.
- The `"pnpm"` key inside `package.json` is ignored on pnpm v11 — use `pnpm-workspace.yaml` `allowBuilds` (or equivalent) instead of `package.json#pnpm.onlyBuiltDependencies`.
- Dashboard layout requires onboarding complete (has cards); first-card UX must live under `/onboarding`, not only `/cards/new`.
- `tsx` seed can fail under restricted sandboxes (IPC EPERM); run seed with full local permissions if that happens.

## Agent behavior

- Prefer surgical changes; follow architecture README over inventing structure.
- Do not add Co-Authored-By trailers to commits.
- Do not commit secrets, SQLite DBs, or mockup zip/extracted assets.
