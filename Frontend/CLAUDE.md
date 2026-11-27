# CineView — Frontend Engineering & AI Guardrails

## 1. Project Purpose

**CineView** (_Choose Your Seat. Experience Your View._) is a responsive cinema ticket booking frontend featuring an interactive 2D seat map synchronized with a real-time 3D auditorium seat-view simulator (React Three Fiber + Three.js).

## 2. Current Scope (Frontend-Only / Mock-Only)

- **No backend**: Do NOT create Node.js/Express servers, PostgreSQL/Sequelize models, migrations, real REST endpoints, real auth, or real payment gateways.
- All data comes from `src/data/` through `src/services/mock/` implementing `src/services/contracts/`.
- Browser persistence uses SSR-safe `localStorage` **only** for non-sensitive demo state (city, preferences, demo bookings, demo auditorium configs). Never store passwords, tokens, or card numbers.

## 3. Technology Stack

- **Framework:** Next.js (App Router), React, TypeScript (`strict: true`)
- **Styling & Motion:** Tailwind CSS, Motion (`motion/react`), Lucide React
- **3D Engine:** Three.js, `@react-three/fiber`, `@react-three/drei` (always dynamically imported with `ssr: false`)
- **State & Forms:** Zustand, React Hook Form, Zod
- **Testing:** Vitest, React Testing Library, Playwright

## 4. Architecture & Feature Boundaries

- `src/app/` — App Router pages and route groups `(public)` and `(booking)`. Keep pages thin; delegate logic to `src/features/`.
- `src/features/` — Domain modules (`movies`, `cinemas`, `auditoriums`, `showtimes`, `seat-selection`, `seat-view`, `seat-comparison`, `booking`, `checkout`, `tickets`, `my-bookings`, `profile`, `admin`).
- `src/components/` — Reusable `ui/`, `layout/`, and `shared/` components. Never import feature-specific internals into `src/components/`.
- `src/services/` — `contracts/` (TypeScript interfaces), `mock/` (Promise-based dummy implementations), `adapters/` (future HTTP adapter stubs), and `index.ts` (config-driven selector).
- `src/store/` — Focused Zustand stores (`useBookingStore`, `useSeatSelectionStore`, `useCinemaStore`, `useUserStore`, `useDemoPersistenceStore`). Seat map and 3D simulator must share `useSeatSelectionStore`.

## 5. Design & Stitch MCP Rules

- **Source of truth:** Google Stitch project `projects/17118370163806267301` and `DESIGN.md` (**Cinematic Avant-Garde**).
- Never invent a generic theme; preserve `#0B0C10`/`#121317` dark surfaces, `#A78BFA` Electric Lavender, `#F59E0B` Radiant Amber (VIP), `#06B6D4` Cyber Cyan (IMAX/Atmos), `Syne` display headings, and `Geist` UI/body text.
- Inspect Stitch screens before implementing or modifying corresponding pages.

## 6. Security & Quality Rules

- TypeScript strict mode; validate untrusted inputs with Zod.
- Never use `dangerouslySetInnerHTML`.
- Validate external URLs and restrict image domains in `next.config.ts`.
- Provide non-3D accessible fallbacks and respect `prefers-reduced-motion`.
- Run `npm run lint`, `npm run typecheck`, and `npm test` before reporting any phase complete.
