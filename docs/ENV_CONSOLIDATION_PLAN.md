# Environment Variables Consolidation Plan

All environment variables have been consolidated into a **single `.env` file** at the project root. This document describes the plan and how each feature uses it.

## Summary

| Location | Before | After |
|----------|--------|-------|
| Root | `.env`, `.env.example` | Single `.env` + `.env.example` |
| server/ | `.env`, `.env.example` | **Removed** – uses root |
| client/ | `.env`, `.env.example`, `.env.development`, `.env.dev`, `.env.prod` | **Removed** – uses root |
| smart-home/ | `.env.example` | **Removed** – uses root |
| lab/client_copy/ | `.env`, `.env.dev`, `.env.prod` | **Removed** – uses root |

## Variables by Feature

### Tuya IoT (server + smart-home)
- `TUYA_ACCESS_ID`, `TUYA_ACCESS_SECRET`, `TUYA_HOST`, `TUYA_TEST_DEVICE`
- **Used by**: `server/config.mjs`, `smart-home/config.mjs`, `smart-home/scripts/wizard-to-devices.mjs`

### Weather (server)
- `WEATHER_API_KEY`
- **Used by**: `server/utils/weather-utils.mjs`

### WebSocket URLs
- `VITE_WEBSOCKET_URL` – Client (Vite exposes to browser via `import.meta.env`)
- `WSS_URL` – Smart-home door sensor monitor
- **Used by**: `client/src/config.tsx`, `smart-home/config.mjs`

### Server (WebSocket backend)
- `PORT`, `SSL_CERT_PATH`, `SSL_KEY_PATH`, `WS_INSECURE`
- **Used by**: `server/server.mjs`

### Android app (HTTP Basic Auth)
- `AUTH_USERNAME`, `AUTH_PASSWORD` – Credentials for dashboard when it requires HTTP Basic Auth
- **Used by**: `android/app/build.gradle` (injected into BuildConfig at build time)

### Debug flags
- `DEVICE_STATUS_DEBUG` – Tuya sensor status logging
- `DEBUG` – Smart-home debug mode (legacy)
- **Used by**: `server/utils/device-status-logger.mjs`, `smart-home/old/index.mjs`

## Code Changes

1. **server/config.mjs** – Loads only root `.env` (removed server/.env)
2. **client/vite.config.ts** – `envDir: path.resolve(__dirname, "..")` so Vite loads from root
3. **smart-home/index.mjs** – Loads root `.env` via `dotenv.config({ path: ... })`
4. **start-development.sh** – Already sources root `.env` before starting processes
5. **.gitignore** – Added root `.env` to prevent committing secrets

## Usage

```bash
# 1. Copy example and fill in values
cp .env.example .env

# 2. Edit .env with your credentials
# 3. Run any command – all subfolders read from root .env
npm run start
```

## Per-environment Overrides (optional)

- **Vite** supports `.env.local`, `.env.development`, `.env.production` – these override root `.env` when present. For most setups, a single root `.env` is sufficient.
- **Shell**: `WS_INSECURE=1 npm run start:server` for local dev without SSL.
