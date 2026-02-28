#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Use nvm if available
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 2>/dev/null || true
fi

cleanup() {
  echo "Stopping development servers..."
  kill $CLIENT_PID $SERVER_PID $SMART_HOME_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Load .env from project root so server gets TUYA_* (shared with smart-home)
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "Starting server (HTTP mode for local dev - no SSL certs needed)..."
(cd server && WS_INSECURE=1 node server.mjs 2>&1 | sed 's/^/[SERVER] /') &
SERVER_PID=$!

# Wait for server to be ready before starting client and smart-home
echo "Waiting for server to start..."
sleep 2

if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "Server failed to start. Check that server.pem and server.key exist in project root."
  exit 1
fi

# Get local network IP and update .env BEFORE starting client (Vite loads env at startup)
if [[ "$(uname)" == "Darwin" ]]; then
  LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
else
  LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
fi

# Update .env DEV_DASHBOARD_URL for Android app (client uses hostname for WebSocket)
if [ -n "$LOCAL_IP" ]; then
  DASHBOARD_URL="http://${LOCAL_IP}:3000/"
  if grep -q "^DEV_DASHBOARD_URL=" .env 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^DEV_DASHBOARD_URL=.*|DEV_DASHBOARD_URL=${DASHBOARD_URL}|" .env
    else
      sed -i "s|^DEV_DASHBOARD_URL=.*|DEV_DASHBOARD_URL=${DASHBOARD_URL}|" .env
    fi
  else
    echo "DEV_DASHBOARD_URL=${DASHBOARD_URL}" >> .env
  fi
  echo "  .env updated: DEV_DASHBOARD_URL -> ${LOCAL_IP}"
fi

echo "Starting client..."
(cd client && npx vite 2>&1 | sed 's/^/[CLIENT] /') &
CLIENT_PID=$!

echo "Starting smart-home (door sensor monitor)..."
(cd smart-home && WSS_URL=ws://localhost:8001 node index.mjs 2>&1 | sed 's/^/[SMART-HOME] /') &
SMART_HOME_PID=$!

echo ""
echo "Development servers running. Press Ctrl+C to stop."
echo "  Client: http://localhost:3000${LOCAL_IP:+ | http://${LOCAL_IP}:3000}"
echo "  Server: ws://localhost:8001${LOCAL_IP:+ | ws://${LOCAL_IP}:8001} (HTTP mode - no SSL)"
echo "  Smart-home: door sensor monitor (connects to server)"
echo "  Android: npm run start:android (prod build) + npm run android:dev"
echo ""
wait
