---
name: feature-module
description: Repeatable workflow for creating a CineView Backend feature module
---

# Creating a Feature Module

1. Understand requirements and identify dependencies on other features.
2. Create a Sequelize migration in `src/db/migrations/` (never edit an applied migration).
3. Create `<feature>.model.ts` using `defaultModelAttributes` (`id`, `isActive`, `isDeleted`, Unix `BIGINT` timestamps, `createdBy`/`updatedBy`/`deletedBy`) and `timestamps: false`.
4. Create `<feature>.validator.ts` using Zod schemas for `body`, `query`, and `params`.
5. Create `<feature>.service.ts` with pure business logic (no `req`/`res` objects).
6. Create `<feature>.controller.ts` (thin HTTP wrapper using `sendSuccess` and `res.__()`).
7. Create `<feature>.routes.ts` with auth, role, rate-limit, and `validateRequest` middlewares.
8. Export only approved public API in `index.ts` and register in `src/features/index.ts`.
9. Add Jest + Supertest tests in `__tests__/` and run `npm run typecheck && npm run lint && npm test`.
