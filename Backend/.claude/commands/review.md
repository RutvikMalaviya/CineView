Review current changes in `CineView/Backend` using the `code-reviewer` and `security-auditor` checklists:
- Feature boundaries (`shared/` never imports `features/`, features only import other features via `index.ts`).
- Thin controllers, Zod validation, parameterized queries, soft-delete (`is_deleted = false`), and `defaultModelAttributes`.
- CSRF, session rotation, rate limiting, and server-side pricing/payment verification.
