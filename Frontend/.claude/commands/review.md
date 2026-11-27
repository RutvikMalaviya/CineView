# Command: /review

Review recent frontend changes:

1. Verify feature boundaries (no circular imports, no `src/data/` imports in pages, no feature imports in `src/components/`).
2. Verify TypeScript strictness, Zod validation, and SSR-safe `localStorage` guards.
3. Run `npm run lint`, `npm run typecheck`, and `npm test`.
