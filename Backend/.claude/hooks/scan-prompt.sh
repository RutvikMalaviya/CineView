#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
if echo "$INPUT" | grep -qiE "(sk_live_|rk_live_|-----BEGIN (RSA |EC )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36})"; then
  echo "BLOCKED: Potential secret or private key detected in prompt." >&2
  exit 2
fi
exit 0
