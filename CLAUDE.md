# CLAUDE.md

Guidance for agents working in this repository.

## What this project is

Personal **Credit Card Manager** — household credit-card ops (limits, utilization, 0% promos, paydown, payment runway). Not a general net-worth / brokerage app; landing mockup marketing copy is aspirational and out of MVP scope.

## Rules

These must be followed with no exceptions:

1. Do not ever include an AI or Bot generated `Co-Authored` code such as: `Co-Authored-By: Claude …` or `Co-Authored-By: Cursor …` trailer in commits in this code base.
2. **Check files first, assume nothing.** When there is any confusion, contradiction, or ambiguity — especially about what this project *is*, what it references, or how it relates to other projects (the DS repo, the two surfaces, vendored vs authored code) — verify against the documents, the data, and the codebase (README, CLAUDE.md, `git remote -v`, `git log`, `grep`) *before* answering or acting. Treat the repository's own files as authoritative over anything stated in chat, including loosely-worded inputs and your own prior statements. Report what the files say, then reason. Never carry an unverified claim from conversation forward as fact.
3. **Follow the branch-naming convention** (see Governance): `<type>/<issue#>-<slug>`, issue first, PR body `Closes #N`.
4. **Review and validate every UI/UX artifact before declaring it done.** Any UI/UX you author or change here (a mockup surface, a screen, an `admin/review/` artifact, any HTML/CSS) must be (a) **designed to the expert review method** and (b) **validated against the Tekrogen Brand Design System** — *before* hand-off, not after the user reports a defect. The operating brief lives in **`/Volumes/SERV01-DTMAC/_Code_Library/AI prompts/`** — read it when doing this work:
- **`Design-System-UIUX-Review-Prompt.md`** — the **expert panel** (Senior Product Designer · Design Systems Architect · Front-End Engineering Lead · Visual/UI Designer): visual hierarchy/legibility, token/scale/spacing discipline. Apply every lens the brief defines; be evidence-based.
5. **Agents** – the agents live in `/Volumes/SERV01-DTMAC/_Code_Library/AI Agents/` (additional agent definitions in `/Volumes/SERV01-DTMAC/_Code_Library/.claude/agents/`)
6. **Canonical documentation only.** Every planning document must reference only canonical documentation — one authoritative file per topic (architecture: `admin/internal/features-planning/architecture/README.md`; plan: `admin/internal/planning/PRODUCTION-BLUEPRINT.md`). Superseded versions are archived, not left in place; a document that cites a broken or non-canonical path is a defect.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

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
