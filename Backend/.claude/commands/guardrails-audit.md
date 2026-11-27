Audit `CineView/Backend` AI guardrails:
1. Verify `CLAUDE.md`, `.claude/settings.json`, `.claude/hooks/*.sh` (executable), `.claude/commands/*.md`, `.claude/agents/*.md`, and `.claude/skills/feature-module/SKILL.md`.
2. Verify `eslint-plugin-boundaries` rules in `eslint.config.mjs`.
3. Verify `.github/workflows/ci.yml` includes typecheck, lint, test, and Gitleaks secret scanning.
