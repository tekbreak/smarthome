import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import imageToBase64 from "image-to-base64/image-to-base64.js";
import CONFIG from "../config.mjs";
import DEVICES from "../data/devices.mjs";
import { broadcast } from "../utils/index.mjs";
import { logDeviceStatus } from "./device-status-logger.mjs";

const require = createRequire(import.meta.url);
const { TuyaContext } = require("@tuya/tuya-connector-nodejs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IMAGE_BASE_URL = "https://images.tuyacn.com/";

/** Cache of device status updates from smart-home (real-time door sensor events) */
const deviceStatusCache = new Map();

function getTuyaApi() {
  const baseUrl = CONFIG.host?.replace(/\/$/, "") || "https://openapi.tuyaeu.com";
  return new TuyaContext({
    baseUrl,
    accessKey: CONFIG.accessId,
    secretKey: CONFIG.accessSecret,
  });
}

/**
 * Merge status update from smart-home into cache. Called when smart-home sends device:status.
 */
export const mergeDeviceStatus = (deviceId, status) => {
  if (!deviceId || !Array.isArray(status)) return;
  const device = DEVICES.find((d) => d.id === deviceId);
  logDeviceStatus("device:status", deviceId, device?.name, device?.type, status);
  const existing = deviceStatusCache.get(deviceId) ?? [];
  const merged = [...existing];
  for (const item of status) {
    const idx = merged.findIndex((s) => s.code === item.code);
    if (idx >= 0) merged[idx] = { ...merged[idx], ...item };
    else merged.push(item);
  }
  deviceStatusCache.set(deviceId, merged);
};

const applyStatusCache = (device) => {
  const cached = deviceStatusCache.get(device.id);
  if (!cached?.length) return;
  const status = device.status ?? [];
  const merged = [...status];
  for (const item of cached) {
    const idx = merged.findIndex((s) => s.code === item.code);
    if (idx >= 0) merged[idx] = { ...merged[idx], ...item };
    else merged.push(item);
  }
  device.status = merged;
};

export const getDevicesMessage = async () => {
  const devices = await updateDevices(DEVICES);
  return {
    type: "device:list",
    payload: devices,
  };
};

export const updateDevices = async (devices) => {
  const api = getTuyaApi();

  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];

    try {
      const res = await api.request({
        method: "GET",
        path: `/v1.0/devices/${device.id}`,
      });

      if (!res?.success || !res?.result) {
        throw new Error(res?.msg || "Invalid response");
      }

      const result = res.result;

      if (!device.name) {
        device.name = result.name;
      }
      device.online = result.online;
      device.status = result.status ?? [];

      // For sensors, the device info endpoint often returns empty status (Zigbee sub-devices).
      // Use the dedicated status endpoint to get temperature, door, motion data.
      const isSensor = ["sensor", "motion", "smart-home"].includes(device.type);
      if (isSensor && !device.status?.length) {
        const statusRes = await api.request({
          method: "GET",
          path: `/v1.0/devices/${device.id}/status`,
        });
        if (statusRes?.success && Array.isArray(statusRes.result) && statusRes.result.length) {
          device.status = statusRes.result;
        }
      }

      // Debug sensors: log to file for status code discovery (DEVICE_STATUS_DEBUG=1)
      if (["sensor", "motion", "smart-home"].includes(device.type)) {
        logDeviceStatus("tuya-api", device.id, device.name, device.type, device.status);
      }

      // Device icon
      const iconPath = path.join(__dirname, "..", "data", "icons", device.id);
      let icon;
      if (fs.existsSync(iconPath)) {
        icon = fs.readFileSync(iconPath, { encoding: "utf8" });
      } else if (result.icon) {
        icon = await getTuyaIcon(result.icon);
        fs.writeFileSync(iconPath, icon);
      }
      device.icon = icon;
    } catch (error) {
      device.online = false;
      device.error = error?.message || String(error);
    }
    applyStatusCache(device);
  }

  return devices;
};

export const sendDevicesUpdate = async (wss) => {
  const devices = await getDevicesMessage();
  broadcast(wss, devices);
};

export const getTuyaIcon = async (url) => {
  const base64 = await imageToBase64(`${IMAGE_BASE_URL}${url}`).then((r) => r);
  return `data:image/jpeg;base64,${base64}`;
};

export const sendCommands = async (deviceId, commands) => {
  try {
    const api = getTuyaApi();
    const commandList = Array.isArray(commands) ? commands : [commands];

    const res = await api.request({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/commands`,
      body: { commands: commandList },
    });

    return res?.success ? res.result : false;
  } catch (error) {
    console.log(error);
  }
  return false;
};
