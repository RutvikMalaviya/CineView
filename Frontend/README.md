# CineView — Choose Your Seat. Experience Your View.

A responsive, frontend-only Next.js movie ticket booking experience featuring an interactive 2D cinema seat map synchronized with a real-time **3D Auditorium Seat-View Simulator** (React Three Fiber + Three.js).

> **Scope Note:** This is a **frontend-only demo** using local dummy datasets (`src/data/`), Promise-based mock services (`src/services/mock/`), and SSR-safe `localStorage` persistence for non-sensitive demo state. No backend, database, real authentication, or real payment processing is included.

## Tech Stack

- **Next.js (App Router)** + **React** + **TypeScript (`strict: true`)**
- **Tailwind CSS** (styled after `DESIGN.md` — _Cinematic Avant-Garde_)
- **React Three Fiber**, **Three.js**, **Drei** (dynamically loaded `ssr: false` with accessible non-3D fallback)
- **Zustand** (shared client-side state across 2D seat map & 3D camera)
- **React Hook Form** + **Zod** (demo checkout & profile forms)
- **Vitest** + **React Testing Library** + **Playwright**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification Commands

```bash
npm run typecheck   # TypeScript strict check
npm run lint        # ESLint
npm test            # Vitest unit & component tests
npm run build       # Production Next.js build
npm run test:e2e    # Playwright end-to-end tests
```

## Key Routes

- `/` — Home Discovery
- `/movies` & `/movies/[id]` — Movie Catalog & Movie Details
- `/cinemas` & `/cinemas/[id]` — Cinema Listing & Cinema Details
- `/showtimes` — Showtime Selection
- `/seats/[showtimeId]` & `/seat-view` — 2D Seat Map + 3D Eye-Level Camera Simulator + Seat Comparison + Booking Summary
- `/offers` — Demo Offers & Promo Codes (`CINE15`, `VIP10`)
- `/checkout` — Demo Checkout
- `/confirmation/[bookingId]` — Booking Confirmation
- `/tickets/[bookingId]` — Digital Ticket (Demo QR)
- `/my-bookings` — Booking Archive & Demo Cancellation
- `/profile` — Demo User Profile & Viewing Preferences
- `/admin` & `/admin/auditoriums/[id]` — Hall Studio Admin & Auditorium Seat Layout Editor
