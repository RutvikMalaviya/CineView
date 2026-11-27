# CineView Backend — Engineering & AI Guardrails

## 1. Project Purpose

**CineView Backend** powers the CineView cinema ticket booking platform (_Choose Your Seat. Experience Your View._), providing REST APIs for movie discovery, cinema/auditorium 3D geometry, showtimes, atomic seat reservations, bookings, payments, digital QR tickets, offers, concessions, and admin operations.

## 2. Technology Stack

- **Runtime & Language:** Node.js 22 LTS, TypeScript (`strict: true`)
- **Framework:** Express.js
- **Database & ORM:** PostgreSQL 16 + Sequelize 6 (`sequelize-cli` migrations/seeders)
- **Cache, Sessions & Rate Limiting:** Redis 7 (`ioredis`, `connect-redis`, `rate-limit-redis`)
- **Validation & API Docs:** Zod + `@asteasolutions/zod-to-openapi`
- **Security:** `helmet`, exact `cors` allow-list, `argon2`, signed double-submit CSRF, `express-rate-limit`
- **Logging & i18n:** `pino` + `pino-http`, `i18n` (`res.__("key")`)
- **Testing:** Jest + Supertest

## 3. Commands

- `npm run dev` — Start development server (`tsx watch`)
- `npm run build` — Compile TypeScript to `dist/`
- `npm run typecheck` — Run `tsc --noEmit`
- `npm run lint` — Run ESLint + feature-boundary rules
- `npm test` — Run Jest + Supertest suite
- `npm run db:migrate` / `npm run db:seed` — Run Sequelize migrations / seeders

## 4. Mandatory Feature-Based Architecture

- All business features live in `src/features/<feature-name>/` (`index.ts`, `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.validator.ts`, `*.model.ts`, `__tests__/`).
- `src/shared/` MUST NEVER import from `src/features/`.
- Features MUST only import other features through `src/features/<other>/index.ts` (enforced by `eslint-plugin-boundaries`).
- Controllers stay thin; business logic lives in services; validation lives in `*.validator.ts`.
- All models include `defaultModelAttributes` (UUIDv4 `id`, `isActive`, `isDeleted`, Unix `BIGINT` timestamps, `createdBy`/`updatedBy`/`deletedBy`).

## 5. AI Coding Agent Rules

1. Never read or write real `.env` files or commit secrets.
2. Never edit an existing applied migration; always create a new migration.
3. Never bypass validation, auth, CSRF, or security middleware.
4. Never use raw SQL with string interpolation; always use `bind` parameters.
5. Never trust frontend-supplied prices, discounts, totals, or role names.
6. Update `docs/TASKS.md` and `docs/ARCHITECTURE.md` when behavior changes.
7. Never mark a task complete without running `npm run typecheck`, `npm run lint`, and `npm test`.
8. **Proactive Architecture Review:** Do not blindly implement only what is literally asked; proactively identify missing edge cases, better technical alternatives, UX/security gaps, and architectural trade-offs, and recommend them clearly before/alongside implementation.
