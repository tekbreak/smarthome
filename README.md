# Smart Home

A unified smart home system for controlling and monitoring your home from tablets, phones, and wall-mounted displays. Combines a **Home Dashboard** (weather, device controls, alerts) with **Door Sensor monitoring** (Tuya Zigbee sensors with time-based notifications). Control everything from your **Android app** via WebView—lights, switches, scenes, and more—with native features like screen brightness, TTS, and phone calls.

## What It Does

### Home Dashboard
- **Live clock** with day/night themes
- **Weather** from WeatherAPI (or cached fallback)
- **Smart device control** via Tuya (lights, switches, sensors)
- **Alerts** with sound and spoken notifications
- **Phone shortcuts** for quick calls
- **Music player** (Bluetooth speaker control)
- **Electro-meter** readings (via Python tool)

### Door Sensor Monitor (smart-home/)
- **Real-time door monitoring** — Tuya Zigbee sensors with open/close events
- **Time-based alerts** — Different behavior during critical hours (e.g., night)
- **Notifications** — Telegram, Twilio (phone calls), and WebSocket to the dashboard

### Android WebView App
Control your home devices directly from your phone or tablet. The app loads the dashboard in a WebView and adds native features:
- **Device control** — Toggle lights and switches from the app
- **Screen brightness** — `dim(level)` for day/night modes
- **Text-to-speech** — Spoken alerts (Spanish)
- **Phone calls** — Quick-dial shortcuts
- **Bluetooth** — Music player / speaker control
- **Camera** — Open camera recording

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Tuya Zigbee Gateway + Door Sensors                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Smart-home (smart-home/)                                         │
│  - Monitors door open/close events                               │
│  - Time-based alerts, Telegram, Twilio                           │
│  - Sends alerts to dashboard via WebSocket                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │ alert
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Client (React + Vite)                                          │
│  - Clock, weather, device controls, alerts, phone shortcuts     │
│  - Connects to server via WebSocket                             │
└───────────────────────┬─────────────────────────────────────────┘
                        │ WebSocket (device:list, weather, dim, alert, …)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server (Node.js)                                                │
│  - WebSocket server (HTTPS/HTTP)                                 │
│  - Tuya Smart Home API                                           │
│  - WeatherAPI / cached weather                                   │
│  - Electro-meter (Python subprocess)                             │
│  - Forwards alerts from smart-home to clients                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Android App (WebView)                                           │
│  - Loads dashboard URL in WebView → full device control           │
│  - JavaScript bridge (hd_android): dim, say, play, call, etc.     │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

| Directory | Description |
|-----------|-------------|
| `package.json` | Root config — all deps, single `node_modules` (run `npm install` from here) |
| `client/` | React + TypeScript + Vite frontend (dashboard UI) |
| `server/` | Node.js WebSocket backend (Tuya, Weather, electro-meter) |
| `android/` | Android WebView app — control devices from your phone |
| `smart-home/` | Door sensor monitor — Tuya Zigbee sensors, alerts |
| `server/tools/` | Electro-meter Python script |

## Prerequisites

- **Node.js** 22+ (see root `.nvmrc`; run `nvm use` from project root)
- **Python** 3.9+ (for electro-meter)
- **Android SDK** (for Android app only)

## Quick Start

### 1. Install (from project root)

```bash
nvm use    # or ensure Node 22+ (see .nvmrc)
npm install
```

This installs all dependencies into a single `node_modules` folder at the root.

### 2. Start development (client + server)

```bash
npm start
# or: ./start-development.sh
```

- Client: http://localhost:3000
- Server: ws://localhost:8001 (HTTP mode, no SSL)

### 3. Run components separately

**Client**
```bash
npm run start:client
```

**Server**
```bash
npm run start:server
```

**Android**  
Open `android/` in Android Studio. Use the **dev** flavor to load the local client (see [android/README.md](android/README.md)).

**Door Sensor Monitor**  
```bash
npm run start:smart-home
```
Configure `config.mjs` and `sensors.mjs` in `smart-home/` (see [smart-home/README.md](smart-home/README.md)). Set `wss` in config to your server WebSocket URL so door alerts reach the dashboard.

## Configuration

### Client

Copy `client/.env.example` to `client/.env`:

| Variable | Description |
|----------|--------------|
| `VITE_WEBSOCKET_URL` | WebSocket server (e.g. `wss://localhost:8001`) |

When running in the Android emulator, the client auto-detects `hostname === 10.0.2.2` and uses `ws://10.0.2.2:8001` if no env override is set. On a physical device, point `VITE_WEBSOCKET_URL` to your server (e.g. `wss://your-server:8001`).

### Environment Variables (single root `.env`)

All environment variables live in the **project root** `.env` file. Copy `.env.example` to `.env` and fill in your values. The server, client, and smart-home all read from this single file.

| Variable | Used by | Description |
|----------|---------|--------------|
| `TUYA_ACCESS_ID` | server, smart-home | Tuya IoT access ID |
| `TUYA_ACCESS_SECRET` | server, smart-home | Tuya IoT access secret |
| `TUYA_HOST` | server, smart-home | Tuya API host (e.g. `https://openapi.tuyaeu.com`). Must match your Tuya account region. |
| `TUYA_TEST_DEVICE` | server, smart-home | Optional device ID for testing |
| `WEATHER_API_KEY` | server | WeatherAPI.com key (optional; uses cache if missing) |
| `VITE_WEBSOCKET_URL` | client | WebSocket URL for dashboard (ws:// or wss://) |
| `WSS_URL` | smart-home | WebSocket dashboard URL for door sensor monitor |
| `PORT` | server | WebSocket server port (default 8001) |
| `SSL_CERT_PATH` | server | Path to SSL cert (optional) |
| `SSL_KEY_PATH` | server | Path to SSL key (optional) |
| `WS_INSECURE` | server | Set to `1` for local dev without SSL (uses HTTP/ws://) |
| `DEVICE_STATUS_DEBUG` | server | Set to `1` to log Tuya sensor status codes |
| `AUTH_USERNAME` | android | HTTP Basic Auth username for dashboard (when protected) |
| `AUTH_PASSWORD` | android | HTTP Basic Auth password for dashboard (when protected) |

For local dev without SSL, use `WS_INSECURE=1` or omit certs; the server falls back to HTTP (ws://).

**"GET_TOKEN_FAILED 1004, sign invalid"** usually means wrong credentials, wrong `TUYA_HOST` (region), or expired keys. Check [Tuya regions](https://github.com/tuya/tuya-home-assistant/blob/main/docs/regions_dataCenters.md).

### Server

Copy `server/config.example.mjs` to `server/config.mjs`. Tuya credentials come from the root `.env`.

The server accepts WebSocket connections from both the dashboard client and the smart-home monitor. The smart-home sends `alert` messages that the server forwards to all connected dashboard clients.

### Smart-home (smart-home/)

See [smart-home/README.md](smart-home/README.md) for Tuya device setup, `config.mjs`, `sensors.mjs`, and notification channels (Telegram, Twilio). Set `WSS_URL` in the root `.env` to your server WebSocket URL (e.g. `wss://your-server:8001`).

### Android

See [android/README.md](android/README.md) for build flavors (dev/prod), URLs, and the JavaScript bridge API (`hd_android`).

## Build & Deploy

```bash
npm run build
```

Output: `client/dist/`. Use `npm run deploy` for SCP deploy to your server.

## Testing

```bash
npm test
```

## WebSocket Messages

The server broadcasts and accepts messages with `{ type, payload }`:

| Type | Direction | Description |
|------|-----------|-------------|
| `device:list` | Server → Client | List of Tuya devices |
| `device:status` | Smart-home → Server | Real-time door sensor state (merged and broadcast as device:list) |
| `device:switch` | Client → Server | Toggle device on/off |
| `weather` | Server → Client | Weather data |
| `dim` | Both | Screen brightness (0–1) |
| `alert` | Server → Client | Alert with level and message (from smart-home or server) |
| `electro-meter` | Server → Client | Power meter readings |

## Debug: Device Status Discovery

To discover Tuya status codes for motion sensors (or any sensor), enable debug logging:

```bash
DEVICE_STATUS_DEBUG=1 npm run start:server
```

Logs are written to `logs/device-status-debug.log`. See [docs/TUYA_SENSOR_INTERFACES.md](docs/TUYA_SENSOR_INTERFACES.md) for details and Tuya docs links.

## License

Private project.
