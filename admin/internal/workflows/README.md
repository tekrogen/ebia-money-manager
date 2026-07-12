# Workflows

Phase discovery and checkpoint docs for Credit Card Manager implementation.

## Naming

| File | Role |
|------|------|
| `PHASE-01.md`, `PHASE-02.md`, … | One file per phase: Discovery summary, remaining checkpoints, phase-end validation |
| `README.md` | This index + process rules |

Create a new `PHASE-##.md` when starting Discovery for that phase. Do not use dated filenames.

## Process (every phase)

1. **Discovery** — Capture verdict, scope, assumptions, and deferred work in `PHASE-##.md`.
2. Continue the 7-phase feature workflow (Exploration → Questions → Architecture → Implementation → Review → Summary).
3. **Phase-end validation** (required before considering the phase closed):
   - Run **Vitest** (unit/integration) and **Playwright** (e2e).
   - Create GitHub **issues** for any test failures, flakes, gaps, or deferred follow-ups.
   - Use branching, commit, and release conventions from the shared GIT-Workflows library (below).

## Shared GIT-Workflows references

Canonical library: `/Volumes/SERV01-DTMAC/_Code_Library/GIT-Workflows/`

| Topic | Path |
|-------|------|
| Branch lifecycle & naming | `BRANCH-WORKFLOWS.md` |
| Incremental / grouped commits | `incrementally-commit-based-on-file-creation.md` |
| Commit grouping scripts | `utils/git/` |
| release-please | `release-please/` |
| Issue templates | `issues-template/` |

**Branch:** `<type>/<issue#>-<short-slug>` · **Commits:** Conventional Commits (no leading emoji) · **Release:** release-please on `main`

## Current phases

| File | Focus | Status |
|------|-------|--------|
| [PHASE-01.md](./PHASE-01.md) | Slice #3 — payment runway + payment intent | Discovery done; validation gate **green locally** |

## Test commands

```bash
pnpm lint
pnpm test       # Vitest unit + integration (tests/unit, tests/integration)
pnpm test:e2e   # Playwright (tests/e2e) — needs seeded DB
```

## Related repo tooling

| Piece | Path |
|-------|------|
| Branch policy (local) | [`BRANCH-WORKFLOWS.md`](../../../BRANCH-WORKFLOWS.md) |
| CI | `.github/workflows/ci.yml` |
| release-please | `.github/workflows/release-please.yml` |
| Issue templates | `.github/ISSUE_TEMPLATE/` |
