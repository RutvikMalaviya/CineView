Add a new endpoint to an existing `src/features/<name>/` module:
1. Add Zod validation schema (`body`, `query`, `params`) in `<name>.validator.ts`.
2. Implement business logic in `<name>.service.ts` (never in controllers; never trust FE prices/roles).
3. Add thin controller handler and register route with `requireAuth`, `requireRole` (if protected), `validateRequest`, and `asyncHandler`.
4. Add Jest + Supertest tests covering success, validation error, auth/RBAC, and edge cases.
5. Run `npm run typecheck && npm run lint && npm test`.
