/**
 * Debug logger for device status discovery.
 * Writes to logs/device-status-debug.log for learning Tuya status codes.
 *
 * Enable with DEVICE_STATUS_DEBUG=1
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOG_DIR = path.resolve(__dirname, "../../logs");
const LOG_FILE = path.join(LOG_DIR, "device-status-debug.log");

const isEnabled = () => process.env.DEVICE_STATUS_DEBUG === "1";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Append a line to the debug log. Format:
 * [ISO timestamp] SOURCE | deviceId | deviceName | type | status
 */
export function logDeviceStatus(source, deviceId, deviceName, deviceType, status) {
  if (!isEnabled()) return;

  ensureLogDir();
  const ts = new Date().toISOString();
  const statusStr = JSON.stringify(status ?? []);
  const line = `[${ts}] ${source} | id=${deviceId} | name=${deviceName ?? "—"} | type=${deviceType} | status=${statusStr}\n`;
  fs.appendFileSync(LOG_FILE, line, "utf8");
}
