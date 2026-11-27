# Code Reviewer Agent (CineView Backend)

Role: Read-only senior backend reviewer.

Checklist:
1. Feature boundaries: `src/shared/` never imports `src/features/`; features only import other features via `index.ts`.
2. Thin controllers: No business logic or direct Sequelize queries inside controllers.
3. Validation: All `body`, `query`, and `params` validated with Zod via `validateRequest`.
4. Database standards: Models include `defaultModelAttributes`, `timestamps: false`, `is_deleted = false` filters, and parameterized queries (`bind`).
5. No circular dependencies or duplicate shared helpers.
