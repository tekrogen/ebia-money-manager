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

## Required goal lists

Every phase section in a workflow document must begin with an explicit `### Goals` checklist written before that phase starts.

- Goals describe the phase's intended outcomes and decision gates.
- Completion evidence is recorded in the same phase section.
- A phase is not complete while required goals remain unchecked, unless the document records an approved exception.
- Goals must remain within the current phase. For example, Architecture selects and documents an implementation approach; it does not implement it.

```markdown
## Phase N: Name

### Goals

- [ ] Outcome or decision required from this phase
- [ ] Evidence that must be recorded before the phase closes
```

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
| [PHASE-01.md](./PHASE-01.md) | Slice #3 — payment runway + payment intent | 7-phase complete (merged) |
| [PHASE-01-SLICE4.md](./PHASE-01-SLICE4.md) | Slice #4 — statements | 7-phase complete (merged) |
| [PHASE-01-SLICE5.md](./PHASE-01-SLICE5.md) | Slice #5 — global search | Phase 1 Discovery |

**Remote:** https://github.com/tekrogen/ebia-money-manager  

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
