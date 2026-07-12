---
name: Bug Report
about: Report a bug in Credit Card Manager
title: "[BUG] "
labels: bug
assignees: ""
---

## Description

A clear and concise description of the bug.

## Environment

| Setting | Value |
|---------|-------|
| Node.js | `node -v` output |
| pnpm | `pnpm -v` output |
| Next.js | See `package.json` |
| Browser | e.g. Chrome 120 |
| OS | e.g. macOS 14.0 |
| Database | SQLite (local MVP) |

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Error Output

```
Paste any error messages, console output, or stack traces here.
```

## Troubleshooting Attempted

- [ ] Restarted the dev server (`pnpm dev`)
- [ ] Regenerated Prisma client (`pnpm db:generate`)
- [ ] Reset/reseeded local DB (`pnpm db:reset`)
- [ ] Cleared Next.js cache (`.next/`)
- [ ] Verified environment variables in `.env`
- [ ] Signed out and back in (Continue as Marti)

## Impact

How does this affect your workflow? (e.g., blocks development, cosmetic issue, data loss risk)

## Possible Solution

(Optional) If you have ideas on how to fix this.

---

### Maintainer Checklist

- [ ] Reproduced the issue
- [ ] Identified root cause
- [ ] Fix implemented
- [ ] Tests added/updated (Vitest or Playwright)
- [ ] Regression tested
