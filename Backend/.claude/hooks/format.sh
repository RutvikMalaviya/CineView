#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8')||'{}');console.log(d.tool_input?.file_path||d.tool_input?.Path||'');")

if [ -n "$FILE_PATH" ] && [[ "$FILE_PATH" == *.ts ]] && [ -f "$FILE_PATH" ]; then
  npx prettier --write "$FILE_PATH" >/dev/null 2>&1 || true
fi
exit 0
