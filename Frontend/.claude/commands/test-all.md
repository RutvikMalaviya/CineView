# Command: /test-all

Run the full frontend verification suite:

1. `npm run typecheck`
2. `npm run lint`
3. `npm test` (Vitest + React Testing Library)
4. `npm run test:e2e` (Playwright)
5. `npm run build`
