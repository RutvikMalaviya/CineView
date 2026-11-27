# Command: /guardrails-audit

Verify frontend-only scope and security rules:

1. Confirm zero backend/Express/Sequelize/database files exist.
2. Confirm no `dangerouslySetInnerHTML`, no secrets in `NEXT_PUBLIC_`, and no card/token persistence in `localStorage`.
3. Confirm Three.js scenes are dynamically imported (`ssr: false`) and dispose geometries/materials cleanly.
