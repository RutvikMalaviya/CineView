#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
if echo "$INPUT" | grep -qiE "(rm -rf\s+/|rm -rf\s+\.\.|git push.*--force|DROP DATABASE|DROP TABLE|TRUNCATE\s+|cat\s+\.env\b|cat\s+\.env\.test\b)"; then
  echo "BLOCKED: Destructive command or protected .env access is not permitted." >&2
  exit 2
fi
exit 0
