#!/usr/bin/env bash
set -euo pipefail

echo "=== CineView Backend Session ==="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Branch: $(git branch --show-current)"
  git status --short
fi
if [ -f "docs/TASKS.md" ]; then
  echo "--- Pending Tasks ---"
  grep -E "^- \[ \]" docs/TASKS.md || echo "All listed tasks complete."
fi
