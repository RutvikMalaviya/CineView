Scaffold a new CineView Backend feature module following `.claude/skills/feature-module/SKILL.md`:
1. Confirm the feature name, tables, and dependencies on existing features.
2. Create a Sequelize migration in `src/db/migrations/` with `defaultModelAttributes` audit/soft-delete columns.
3. Create `src/features/<name>/` with `<name>.model.ts`, `<name>.validator.ts` (Zod), `<name>.service.ts`, `<name>.controller.ts`, `<name>.routes.ts`, `index.ts`, and `__tests__/`.
4. Mount the router in `src/features/index.ts`.
5. Run `npm run typecheck && npm run lint && npm test`.
