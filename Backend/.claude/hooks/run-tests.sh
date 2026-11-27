#!/usr/bin/env bash
set -euo pipefail

if [ "${CINEVIEW_HOOK_RUNNING:-0}" = "1" ]; then
  exit 0
fi
export CINEVIEW_HOOK_RUNNING=1

npm run typecheck && npm run lint && npm test
