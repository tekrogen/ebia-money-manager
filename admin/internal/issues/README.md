# Issues

## 2607151216

All issues from both reviews are now filed. Here's the full issue ledger on GitHub:

**From the payments feature review (previously filed):**
- **#2** — `PaymentIntent` missing userId ownership check
- **#3** — `rescheduleRunwayItem` missing household ownership
- **#4** — `RunwayItem.householdId` missing `Household` relation (payments-specific)
- **#5** — `runway-service` leaks BigInt to client

**From the [full codebase review](8f5b3d08-3768-407e-98a6-1fb847ff6da2) — just filed:**

| # | Severity | Title |
|---|---|---|
| 6 | Critical | `RunwayItem.householdId` missing Household relation |
| 7 | Critical | Cross-feature imports bypass `index.ts` (6 files) |
| 8 | Important | `add-card-form` never renders field-level errors |
| 9 | Important | Status column shows utilization, not card status |
| 10 | Critical | `Statement.userId` missing User relation |
| 11 | Important | CI needs `mkdir -p admin/internal/data` |
| 12 | Important | `getPortfolioMetrics` parses display string for promo date |
| 13 | Important | Test coverage gaps (auth, overview, paydown) |
| 14 | Important | `getPortfolioMetrics` dynamic import |
| 15 | Important | `currentBalance` can exceed `creditLimit` — no validation |
| 16 | Minor | `getCurrentUser` fires 2 queries per request |
| 17 | Minor | `getCardSummaries` redundant alias |
| 18 | Minor | `FinancialAccount` no household-scoped constraint |
| 19 | Minor | Dashboard nav redundant Runway entry |
| 20 | Minor | No-op `tsconfigPaths` in vitest.config |
| 21 | Minor | Seed deletion order relies on cascade |

That's **21 total issues** tracked on the remote — covering both the payments-specific review and the full codebase review. Phase 6 (Review) findings are now fully recorded. 

---

Here's an analysis of all 20 open issues against the planned next phase of development.

---

## Current State

Slice #3 (Payment Runway + Intent Flow) is **implemented on `main`** but Phases 6 (Review) and 7 (Summary) are still pending. The next *feature* work is **Slice #4 — Statements**, followed by Slice #5 (Global Search) and Slice #6 (Reminder Jobs).

---

## Issues Directly Addressed by Next Development

### Phase 6 (Review) of Slice #3 — would naturally catch/fix these:

| # | Issue | Why |
|---|-------|-----|
| **#2** | `selectCardAction` does not verify card belongs to household | Security gap in the just-shipped payments code — review catch |
| **#3** | `updateIntent*` repository functions ignore userId in where clause | Same — ownership enforcement gap in new repository |
| **#4** | `rescheduleRunwayItem` has no household ownership check | Same — runway action missing guard |
| **#5** | `$0` payment intent possible when amountType is custom | Validation gap in the intent flow |
| **#6** | `RunwayItem.householdId` missing Household relation | Schema relation gap in the new model |
| **#19** | Dashboard nav has redundant Runway entry beside Payments | UI defect from slice #3 nav wiring |
| **#21** | Seed: explicitly delete RunwayItems before CreditCards | Seed ordering issue from new model |

**Verdict:** 7 issues are slice #3 bugs/refinements. Phase 6 Review is the correct place to resolve them.

### Slice #4 (Statements) — directly relevant:

| # | Issue | Why |
|---|-------|-----|
| **#10** | `Statement.userId` missing User relation — no referential integrity | The Statements slice *must* fix this schema gap to build on it |

---

## Issues Likely Fixed Opportunistically During Next Work

| # | Issue | Why it'll likely get touched |
|---|-------|-----|
| **#7** | Cross-feature imports bypass `index.ts` public API (6 files) | Architecture rule enforcement — may be swept up as slice #4 adds new cross-feature boundaries |
| **#11** | CI: add `mkdir` for `admin/internal/data` before `db:push` | Blocker for any CI-exercised slice; should be fixed before slice #4 branch |
| **#18** | `FinancialAccount` has no household-scoped ownership constraint | Relevant to payments *and* statements; natural cleanup with #10 |
| **#13** | Test: add coverage for auth session, overview metrics, paydown dashboard | Ongoing test-debt sweep; partial overlap with validation gates |

---

## Issues NOT Addressed by Next Phase

These belong to earlier features (cards, overview, auth) and won't be touched unless explicitly prioritized:

| # | Issue | Domain |
|---|-------|--------|
| **#8** | `add-card-form` never renders field-level validation errors | Cards UI |
| **#9** | Status column shows utilization badge instead of card status | Cards UI |
| **#12** | `getPortfolioMetrics` parses display string for promo date | Overview bug |
| **#14** | `getPortfolioMetrics` uses dynamic import instead of static | Overview bug |
| **#15** | `currentBalance` can exceed `creditLimit` — add cross-field validation | Cards schema |
| **#16** | `getCurrentUser` fires two DB queries per request | Auth perf |
| **#17** | `getCardSummaries` is redundant alias | Cards refactor |
| **#20** | Remove no-op `tsconfigPaths` from vitest.config.ts | Tooling chore |

---

## Summary

- **7 of 20** issues are direct slice #3 defects that Phase 6 (Review) should resolve before moving on.
- **1 issue** (#10) is a prerequisite for Slice #4 (Statements).
- **4 issues** (#7, #11, #13, #18) will likely be swept up as part of the next slice's infrastructure work.
- **8 issues** live in cards/overview/auth/tooling and remain untouched unless you schedule a dedicated cleanup pass.

**Recommendation:** Complete Phase 6/7 for slice #3 *first* — that resolves 7 bugs in one pass and leaves a clean baseline. Fix #11 (CI mkdir) immediately as a blocker, then start Slice #4 which naturally fixes #10. The remaining 8 issues could be batched into a `chore/cleanup` branch between slices or tracked as tech-debt for a future hardening sprint.