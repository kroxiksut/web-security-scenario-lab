#!/bin/sh
# Linux/macOS convenience wrapper around scripts/setup.mjs — no logic of its own, so the two systems
# can never drift apart. Equivalent to running: node scripts/setup.mjs
#
# Arguments are forwarded, e.g.: ./scripts/setup.sh --check
set -eu

repo_root=$(cd "$(dirname "$0")/.." && pwd)

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found on PATH. Install Node 22 LTS (nvm install 22) and open a new terminal." >&2
  exit 1
fi

cd "$repo_root"
exec node scripts/setup.mjs "$@"
