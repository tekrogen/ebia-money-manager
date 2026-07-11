# Admin / planning docs

This tree is documentation and planning only — not the Next.js runtime.

- `features/architecture/README.md` — canonical product/architecture guide
- `workflows/` — phase checklists
- `data/dev.db` — local SQLite (gitignored); referenced by Prisma via `../admin/internal/data/dev.db`
- `features/credit-card-manager-mockup/` — wireframe zip (gitignored extract)

When implementation and docs diverge, update the architecture README in the same change set or call out the gap explicitly.
