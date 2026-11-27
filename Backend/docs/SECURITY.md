# CineView Security Architecture (Frontend & Backend)

## Backend Controls
1. **Transport & Headers:** `helmet` with strict CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`), `X-Powered-By` disabled, `trust proxy` in production.
2. **CORS:** Exact origin allow-list (`CORS_ALLOWED_ORIGINS`) with `credentials: true` (never wildcard `*` with credentials).
3. **Sessions & Auth:** Server-side Redis-backed sessions (`express-session` + `connect-redis`), `HttpOnly`, `SameSite=Lax`, `Secure` in production, Argon2id (`argon2`) password hashing, session ID rotation on login/privilege change.
4. **CSRF Protection:** Signed HMAC double-submit cookie (`cineview.csrf` + `X-CSRF-Token` header) enforced on all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`), exempting only provider-signed webhook routes.
5. **Input & SQL Safety:** Strict Zod validation on `body`, `query`, `params`; `100kb` JSON/urlencoded body limit; Sequelize parameterized queries (`bind`).
6. **Rate Limiting:** Redis-backed `express-rate-limit` (`rate-limit-redis`) globally and stricter per-route limiters on auth/reservation endpoints.
7. **Logging & Secrets:** `pino` redacts `authorization`, `cookie`, `x-csrf-token`, `password`, `token`, `secret`; Gitleaks in CI.

## Frontend Security Checklist (Next.js `Frontend/`)
- `next.config.ts` already sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, and `remotePatterns` image allow-list.
- **When integrating real APIs (Phase 7):**
  - Never store auth tokens, passwords, or card numbers in `localStorage`.
  - Send `credentials: "include"` and attach `X-CSRF-Token` from the `cineview.csrf` cookie on mutations.
  - Keep all pricing, offer validation, and booking totals authoritative on the backend.
  - Validate API responses and route params with Zod; never use `dangerouslySetInnerHTML`.
