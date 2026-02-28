#!/bin/bash
# Serve production build for Android WebView (dev server ES modules often show blank in WebView)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 2>/dev/null || true
fi

cleanup() {
  echo "Stopping..."
  kill $CLIENT_PID $SERVER_PID $SMART_HOME_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "Building client for Android WebView..."
(cd client && npm run build) || { echo "Build failed"; exit 1; }

echo "Starting server..."
(cd server && WS_INSECURE=1 node server.mjs 2>&1 | sed 's/^/[SERVER] /') &
SERVER_PID=$!
sleep 2

if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "Server failed to start."
  exit 1
fi

if [[ "$(uname)" == "Darwin" ]]; then
  LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
else
  LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
fi

if [ -n "$LOCAL_IP" ]; then
  DASHBOARD_URL="http://${LOCAL_IP}:3000/"
  if grep -q "^DEV_DASHBOARD_URL=" .env 2>/dev/null; then
    [[ "$(uname)" == "Darwin" ]] && sed -i '' "s|^DEV_DASHBOARD_URL=.*|DEV_DASHBOARD_URL=${DASHBOARD_URL}|" .env || sed -i "s|^DEV_DASHBOARD_URL=.*|DEV_DASHBOARD_URL=${DASHBOARD_URL}|" .env
  else
    echo "DEV_DASHBOARD_URL=${DASHBOARD_URL}" >> .env
  fi
fi

echo "Starting client (production build on :3000)..."
(cd client && npx vite preview --port 3000 --host 2>&1 | sed 's/^/[CLIENT] /') &
CLIENT_PID=$!

echo "Starting smart-home..."
(cd smart-home && WSS_URL=ws://localhost:8001 node index.mjs 2>&1 | sed 's/^/[SMART-HOME] /') &
SMART_HOME_PID=$!

echo ""
echo "Android-ready servers running. Rebuild app: npm run android:install"
echo "  Client: http://localhost:3000${LOCAL_IP:+ | http://${LOCAL_IP}:3000}"
echo "  Server: ws://localhost:8001${LOCAL_IP:+ | ws://${LOCAL_IP}:8001}"
echo ""
wait
