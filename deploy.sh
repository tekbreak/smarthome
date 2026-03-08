#!/bin/bash
set -e

ENV="${1:-prod}"

if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Usage: npm run deploy [dev|prod]"
  echo "  dev  - copies .env.dev to .env, then builds"
  echo "  prod - copies .env.prod to .env, then builds (default)"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SOURCE="$SCRIPT_DIR/.env.$ENV"
DEST="$SCRIPT_DIR/.env"

if [[ ! -f "$SOURCE" ]]; then
  echo "Error: $SOURCE not found"
  exit 1
fi

echo "[deploy] Copying $SOURCE -> .env"
cp -f "$SOURCE" "$DEST"

# Verify and show key var (helps confirm copy worked)
if grep -q "^VITE_WEBSOCKET_URL=" "$DEST" 2>/dev/null; then
  echo "[deploy] VITE_WEBSOCKET_URL=$(grep "^VITE_WEBSOCKET_URL=" "$DEST" | cut -d= -f2-)"
else
  echo "Warning: VITE_WEBSOCKET_URL not found in .env"
fi
echo "[deploy] Building..."

npm run build
echo "[deploy] Done. Run 'npm run upload' to push to server."
