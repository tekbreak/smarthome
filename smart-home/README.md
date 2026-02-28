# Smart-home

A home automation system that monitors Tuya Zigbee door sensors in real time and triggers notifications based on door state and configurable time schedules. Built for integration with Tuya Smart devices, Telegram, Twilio, and a custom home dashboard.

## Features

- **Real-time monitoring** — Connects to Tuya Zigbee gateway devices and listens for door open/close events
- **Time-based critical periods** — Different alert behavior during configurable "critical" hours (e.g., night, weekends)
- **Multiple notification channels**:
  - **Telegram** — Instant messaging alerts
  - **Twilio** — Phone calls for critical alerts
  - **WebSocket** — Alerts to a home dashboard
- **Open-door timer** — Monitors doors left open and escalates alerts with configurable retry attempts
- **Per-sensor configuration** — Each sensor can have its own schedule and open/close actions
- **Event skip mechanism** — Temporarily disable event processing via a file-based flag (no code changes)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Tuya Zigbee    │────▶│  smart-home      │────▶│  Notifications      │
│  Gateway        │     │  (index.mjs)     │     │  • Telegram         │
│  + Door Sensors │     │                  │     │  • Twilio (calls)   │
└─────────────────┘     │  • Event filter  │     │  • WebSocket        │
                        │  • Schedule check│     └─────────────────────┘
                        │  • Command exec  │
                        └──────────────────┘
```

**Flow:**
1. Connects to Tuya Zigbee gateway devices via TuyAPI
2. Listens for `data` events from connected devices
3. Filters events by sensor component ID (`cid`)
4. Determines door state (open/closed) from `data.dps['1']`
5. Checks if current time is within critical period
6. Executes configured commands based on event type (open/close)
7. Runs common commands (always) + mode-specific commands (default/critical)

## Prerequisites

- **Node.js 22+** (see root `.nvmrc` — use `nvm use` if you have nvm)
- Tuya Zigbee gateway and door sensors
- Tuya Cloud API credentials

## Installation

```bash
# From project root (single node_modules for all projects)
npm install

# Use Node 22+ (nvm use from root)
nvm use
```

## Configuration

### 1. Tuya Device Setup

Follow the instructions in [docs/SETUP.md](docs/SETUP.md) to:
- Link your Tuya devices via the Tuya Smart or Smart Life app
- Obtain device IDs and keys using `tuya-cli wizard` or `npm run sync-devices`

### 2. devices.json

Device list (name, id, key, subDevices) from Tuya. Update with:

```bash
npm run sync-devices
```

Uses `TUYA_ACCESS_ID`, `TUYA_ACCESS_SECRET`, `TUYA_TEST_DEVICE` from config or .env. If the API fails (e.g. permission deny), run the wizard and pass its output:

```bash
npx @tuyapi/cli wizard
# Then: npm run sync-devices -- wizard-output.txt
# Or: pbpaste | npm run sync-devices
```

### 3. config.mjs

| Option | Description | Default |
|--------|-------------|---------|
| `debug` | Enable debug logging | `false` |
| `timerMaximumTries` | Max retries for open-door timer | `3` |
| `openDoorInterval` | Minutes between door status checks | `1` |
| `wss` | WebSocket server URL for home dashboard | — |
| `host` | Tuya API endpoint (e.g. `https://openapi.tuyaeu.com`) | — |
| `accessId` | Tuya API access ID | — |
| `accessSecret` | Tuya API access secret | — |
| `testDevice` | Device ID for testing | — |

### 4. sensors.mjs

Configure devices and sensors:

- **Device config** — Gateway connection (`id`, `key`, refresh options)
- **Sensor definitions** — `cid`, `name`, `schedule`, `onOpen`/`onClose` commands

**Schedule format:**
```javascript
schedule: {
  default: { start: 23, end: 9 },  // Critical hours (default)
  6: { end: 11 },                  // Saturday override
  0: { end: 11 }                   // Monday override
}
```

**Command modes:**
- `common` — Always executed
- `default` — Normal hours only
- `critical` — Critical time periods only

## Usage

### Run the application

```bash
node index.mjs
```

### Skip events temporarily

Create a file to disable event processing:

```bash
# Disable
echo "/var/www/html/smart-home-skip/skip" | xargs -I {} sh -c 'mkdir -p $(dirname {}) && echo 1 > {}'

# Re-enable
echo 0 > /var/www/html/smart-home-skip/skip
```

## Tests

| Test | Description |
|------|-------------|
| `test_sensor.mjs` | Individual sensor connection |
| `test_dim.mjs` | Dimming functionality |
| `test_sync.mjs` | Device sync via Tuya Cloud API |
| `test_ws.mjs` | WebSocket communication (interactive) |

```bash
node tests/test_sensor.mjs
node tests/test_dim.mjs
node tests/test_sync.mjs
node tests/test_ws.mjs
```

## Project Structure

```
smart-home/
├── index.mjs          # Main entry point
├── devices.json       # Device list (synced via npm run sync-devices)
├── devices.mjs        # Re-exports devices.json for server
├── sensors.mjs        # Sensor configuration and device definitions
├── utils.mjs          # Notifications, timers, WebSocket
├── config.mjs         # Configuration (API keys, endpoints, timers)
├── scripts/
│   └── wizard-to-devices.mjs  # Convert wizard output → devices.json
├── .nvmrc             # Node 22 (inherits from root)
├── docs/
│   ├── SETUP.md       # Tuya device setup instructions
│   └── index.html     # TuyAPI documentation
├── tests/             # Test scripts
├── lab/               # Experimental code
└── old/               # Legacy/archived code
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `tuyapi` | Tuya device local API |
| `@tuya/tuya-connector-nodejs` | Tuya Cloud API integration |
| `serialport` | Serial port communication |
| `axios` | HTTP requests |
| `ws` | WebSocket client |
| `dotenv` | Environment variables |
| `lodash` | Utilities |

## External Integrations

- **Telegram** — `smarthome.tekbreak.com/telegram.php`
- **Twilio** — `smarthome-4210.twil.io/call_borja`
- **Home dashboard** — Custom WebSocket server

## Environment Variables

All env vars are in the **project root** `.env` file. Copy the root `.env.example` to `.env` and fill in your values. The smart-home loads from the root `.env`.

| Variable | Description |
|----------|-------------|
| `WSS_URL` | WebSocket dashboard URL (must use `wss://` or `ws://`) |
| `TUYA_HOST` | Tuya API endpoint |
| `TUYA_ACCESS_ID` | Tuya API access ID |
| `TUYA_ACCESS_SECRET` | Tuya API access secret |
| `TUYA_TEST_DEVICE` | Device ID for testing |

## Security Notes

- Prefer environment variables for secrets (see root `.env.example`).
- `config.mjs` is gitignored; use `config.example.mjs` as a template.
- Ensure `.env` is never committed (see `.gitignore`).
- Keep device IDs and keys in `sensors.mjs` private; consider moving to env vars for production.

## License

ISC
