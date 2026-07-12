# [TASK] #1 — Validation gate: test harness, CI, release tooling

**Status:** Done (local; no GitHub remote yet)  
**Date:** 2026-07-12  
**Branch:** `chore/1-validation-gate`

## Description

Install and configure Vitest + Playwright, cover shipped Phase 01 slices 1–2, and land follow-up tooling (CI, release-please, husky/commitlint, issue templates, BRANCH-WORKFLOWS) before Phase 2 Exploration for payment runway.

## Acceptance Criteria

- [x] Vitest unit + integration green
- [x] Playwright e2e green for slices 1–2
- [x] CI workflow + release-please + issue templates
- [x] Husky commit-msg + commitlint (no leading emoji)
- [x] PHASE-01 / workflows README updated for the gate

## Testing Strategy

- [x] Unit tests (Vitest)
- [x] Integration tests (Vitest + Prisma)
- [x] E2E tests (Playwright)
