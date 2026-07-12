# Branch Workflows

How a task becomes a release in **Credit Card Manager**.

> **Canonical policy:** `/Volumes/SERV01-DTMAC/_Code_Library/GIT-Workflows/BRANCH-WORKFLOWS.md`  
> This file is the repo-local summary. Prefer the library doc when they diverge.

**Engine:** [release-please](./release-please-config.json) (not release-it).  
**Standards:** [Conventional Commits](https://www.conventionalcommits.org/), [SemVer](https://semver.org/), Keep a Changelog via release-please.

> **Note:** Sibling repo `ebia` uses a multi-tier `dev → uat → main` + worktree model. **This repo does not.** We follow trunk-based short-lived branches into always-releasable `main`.

---

## Lifecycle

```
issue #42 ──▶ feat/42-payment-runway ──▶ PR ──(squash)──▶ main
                   │                       │                │
            conventional             CI green +       release-please
              commits                 review          opens Release PR
                                                          │
                                                     merge Release PR
                                                          ▼
                                               tag vX.Y.Z + CHANGELOG.md
```

## Branch naming

```
<type>/<issue#>-<short-slug>

feat/42-payment-runway
fix/57-cards-table-empty-state
chore/63-ci-playwright
```

- Branch from up-to-date `main`.
- One branch = one concern; keep short-lived.
- No issue yet? Open one first (use `.github/ISSUE_TEMPLATE/`).

## Commits

- Conventional: `feat(scope): …`, `fix(scope): …`, `chore(scope): …`
- **No leading emoji** (breaks release-please). Enforced by `commitlint` + husky `commit-msg`.
- Prefer small increments; dry-run grouped commits via GIT-Workflows `utils/git/` when many files.

## Validate before PR

- [ ] Issue goal complete
- [ ] `pnpm lint && pnpm test && pnpm test:e2e` green locally
- [ ] No secrets / `*.db` / mockup binaries
- [ ] Do not hand-edit `CHANGELOG.md` for release entries — release-please owns that

## PR rules

1. Title is a conventional commit (squash-merge → becomes the `main` commit).
2. Body includes `Closes #N`.
3. Squash-merge when CI is green; delete branch.

## Issues that arise

File them (bug/task/feature templates). Do not lose follow-ups in chat; do not hold the PR hostage to non-blockers.

## Local tooling

| Piece | Location |
|-------|----------|
| commitlint | `commitlint.config.cjs` |
| husky | `.husky/commit-msg` |
| CI | `.github/workflows/ci.yml` |
| release-please | `.github/workflows/release-please.yml` |
| Issue templates | `.github/ISSUE_TEMPLATE/` |
