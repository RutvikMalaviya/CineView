# CineView Implementation Tasks

## Completed
- [x] **Phase 0:** Reorganize workspace into `CineView/Frontend` and `CineView/Backend`
- [x] **Phase 1:** Backend TypeScript + Express + Sequelize + PostgreSQL + Redis foundation, security middlewares, `eslint-plugin-boundaries`, Jest + Supertest health & security tests, Docker Compose, GitHub Actions CI, `CLAUDE.md`, `.claude/`
- [x] **Phase 2:** Auth & Users (`auth`, `users`, Argon2id, Redis sessions, RBAC, CSRF, tests)
- [x] **Phase 3:** Movies, Cinemas, Auditoriums (3D geometry + reset), Seats, Offers, Concessions
- [x] **Phase 4:** Showtimes, Atomic Seat Reservations (PostgreSQL partial unique index + transaction + Redis-locked expiry job + concurrency test)
- [x] **Phase 5:** Bookings & Stripe-Mirror Demo Payments (`DemoStripeProvider` + `StripeProvider` abstraction, idempotency, HMAC webhook verification + tests)
- [x] **Phase 6:** Digital Tickets (HMAC-signed QR + verification endpoint), Reviews, Notifications, Admin Overview
- [x] **Phase 7:** Full demo Seeders + Frontend HTTP Adapter (`src/services/adapters/http-services.ts`)
