---
name: feature-module
description: Guidelines for creating and maintaining isolated feature modules in src/features/.
---

# Feature Module Skill

1. Place domain UI, hooks, and feature-local helpers inside `src/features/<name>/`.
2. Export public APIs via `src/features/<name>/index.ts`.
3. Consume data through `src/services/index.ts` and shared state via `src/store/`.
4. Never import internals of another feature directly; use public barrels or shared contracts.
