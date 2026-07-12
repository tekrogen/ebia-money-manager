# Credit Card Manager

Next.js App Router app for household credit-card operations.

## Phase 01

Scaffold + Prisma schema + vertical slice #1:

- Demo sign-in → seeded household cards → `/overview` metrics → `/cards` table
- Manual add-card via `/onboarding` (empty household) or `/cards/new`

## Setup

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and continue as Marti.

## Stack defaults

- Next.js 16 + React 19 + Tailwind 4
- Prisma 6 + SQLite (`admin/internal/data/dev.db`) for local MVP
- Cookie session stub (not production auth)
- Tekrogen-inspired tokens (Poppins / Manrope / teal accent)

## Docs

Architecture: `admin/internal/features/architecture/README.md`  
Phase plan: `admin/internal/workflows/PHASE-01.md`  
Workflows index: `admin/internal/workflows/README.md`  
Agent memory: `CLAUDE.md`
