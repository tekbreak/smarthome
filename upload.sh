#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR" && pwd)"
cd "$ROOT"

if [[ ! -d "client/dist" ]]; then
  echo "Error: client/dist not found. Run 'npm run deploy' or 'npm run build' first."
  exit 1
fi

rm -rf client-deploy 2>/dev/null
cp -r client/dist client-deploy
ssh tekbreak.com 'rm -r ~/web/subdomains/home-dashboard/client'
scp -r client-deploy tekbreak.com:~/web/subdomains/home-dashboard/client
rm -rf client-deploy

echo "[upload] Done."
