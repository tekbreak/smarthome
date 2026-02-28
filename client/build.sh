#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

npm run build
rm -rf client-deploy 2>/dev/null
cp -r client/dist client-deploy
ssh tekbreak.com 'rm -r ~/web/subdomains/home-dashboard/client'
scp -r client-deploy tekbreak.com:~/web/subdomains/home-dashboard/client
rm -rf client-deploy
