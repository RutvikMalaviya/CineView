# Command: /new-feature

Scaffold a new frontend feature module under `src/features/<feature-name>/`:

1. Create `types.ts`, `hooks/`, `components/`, and `index.ts` (public barrel export).
2. Define any service contract in `src/services/contracts/` and mock implementation in `src/services/mock/`.
3. Keep all data access behind `src/services/index.ts` — never import `src/data/` directly into pages.
4. Add unit/component tests under `tests/`.
