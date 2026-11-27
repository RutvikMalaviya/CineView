# CineView

**Choose Your Seat. Experience Your View.**

CineView is a full-stack cinema ticket booking platform featuring an interactive 2D seat map synchronized with a real-time 3D auditorium seat-view simulator, role-based cinema operations, atomic seat reservations, and a Stripe-compatible demo payment flow.

---

## Repository Structure

```text
CineView/
├── Frontend/                 # Next.js 16 + React 19 + TypeScript + Three.js / R3F
├── Backend/                  # Express + TypeScript + Sequelize (PostgreSQL) + Redis
├── docker-compose.yml        # PostgreSQL 16, Redis 7, and optional Mailpit
└── .github/workflows/ci.yml  # Backend CI, Frontend CI, and Gitleaks secret scan
```

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, React Three Fiber / Three.js, Vitest, Playwright
- **Backend:** Node.js 22 LTS, Express.js, TypeScript, PostgreSQL 16 (Sequelize), Redis 7 (`ioredis`, `connect-redis`, `rate-limit-redis`), Zod, Argon2id, Helmet, Morgan, Pino, i18n, Jest + Supertest

---

## Quick Start (Local Development)

### 1. Start Infrastructure (PostgreSQL & Redis)
```bash
docker compose up -d
```

### 2. Setup & Run Backend (`http://localhost:4000`)
```bash
cd Backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### 3. Setup & Run Frontend (`http://localhost:3000`)
```bash
cd Frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_DATA_SOURCE=api in .env.local to connect to the live Backend
npm install
npm run dev
```

---

## Seeded Demo Accounts (Development Only)

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| `CUSTOMER` | `alex.rivera@cineview.app` | `DemoUser123!` | Bookings, Digital QR Tickets, Profile |
| `CINEMA_ADMIN` | `cinema.admin@cineview.app` | `CinemaAdmin123!` | Assigned to *CineView Premiere Dome* |
| `SUPER_ADMIN` | `admin@cineview.app` | `AdminUser123!` | All Cinemas, Users, Roles, Screen Types |

---

## Verification Commands

### Backend (`CineView/Backend`)
```bash
npm run typecheck
npm run lint
npm run build
npm test
```

### Frontend (`CineView/Frontend`)
```bash
npm run typecheck
npm run lint
npm test
```

---

## Documentation
- [Backend Architecture](Backend/docs/ARCHITECTURE.md)
- [Database Design](Backend/docs/DATABASE.md)
- [Security Architecture](Backend/docs/SECURITY.md)
- [Implementation Tasks](Backend/docs/TASKS.md)
