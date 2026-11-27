# CineView Backend Architecture

## Feature-Based Architecture
All business logic lives in `src/features/<feature-name>/`.

```
src/
├── app.ts              # Express app, security middlewares, feature router mounting
├── server.ts           # DB/Redis bootstrap & graceful shutdown
├── config/             # Zod-validated env, Sequelize, Redis, Pino logger, i18n
├── db/                 # Centralized Sequelize migrations & seeders
├── shared/             # Middlewares, errors, constants, response/audit utilities
└── features/           # Isolated business modules (each exposes public API via index.ts)
```

## Dependency Rules (Enforced by `eslint-plugin-boundaries`)
- `app.ts` -> `features/*/index.ts`, `shared/`, `config/`
- `features/<name>/*` -> `shared/`, `config/`, `features/<other>/index.ts`
- `shared/` -> `shared/`, `config/` (**NEVER** imports from `features/`)
- Direct imports into another feature's internal files (`*.service.ts`, `*.model.ts`, etc.) are blocked by ESLint.
