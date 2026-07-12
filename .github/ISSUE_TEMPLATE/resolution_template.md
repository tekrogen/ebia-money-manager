# Resolution Template

> **Note:** This is not an issue template. Use this format when commenting on an issue to document its resolution.

---

## Root Cause

Describe the underlying cause of the issue.

## Fixes Applied

### File: `src/path/to/file.ts`

**What changed:** Brief description of the change.

```typescript
// Before
const oldCode = "...";

// After
const newCode = "...";
```

## Results

| Check | Status |
|-------|--------|
| Bug no longer reproduces | Pass/Fail |
| No regressions introduced | Pass/Fail |
| Lint passes | Pass/Fail |
| Vitest passes | Pass/Fail |
| Playwright passes (if UI) | Pass/Fail |

## Testing

### Unit / integration (Vitest)

```bash
pnpm test
```

### E2E (Playwright)

```bash
pnpm test:e2e
```

## Prevention Measures

- [ ] Added/updated tests
- [ ] Added input validation
- [ ] Updated documentation
- [ ] Filed follow-up issues for non-blockers

---

**Status: RESOLVED**
