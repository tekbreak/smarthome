#!/bin/bash
set -e

ENV="${1:-prod}"

if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Usage: npm run deploy [dev|prod]"
  echo "  dev  - copies .env.dev to .env, then builds and deploys"
  echo "  prod - copies .env.prod to .env, then builds and deploys (default)"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SOURCE=".env.$ENV"
if [[ ! -f "$SOURCE" ]]; then
  echo "Error: $SOURCE not found"
  exit 1
fi

echo "[deploy] Using $SOURCE -> .env"
cp "$SOURCE" .env

npm run build
echo "[deploy] Done. Run 'npm run upload' to push to server."
