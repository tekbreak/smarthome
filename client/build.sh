#!/bin/bash
# Build only. Use 'npm run deploy' for env+build, 'npm run upload' to push to server.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"
npm run build
