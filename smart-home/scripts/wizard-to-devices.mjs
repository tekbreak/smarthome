#!/usr/bin/env node
/**
 * Sync devices from Tuya to smart-home/devices.json
 *
 * Uses TUYA_ACCESS_ID, TUYA_ACCESS_SECRET, TUYA_HOST, TUYA_TEST_DEVICE from
 * smart-home/config.mjs or .env. Run from project root:
 *
 *   npm run sync-devices
 *
 * Falls back to stdin/file if config is missing or API fails:
 *   npm run sync-devices -- wizard-output.txt
 *   pbpaste | npm run sync-devices
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { TuyaContext } = require("@tuya/tuya-connector-nodejs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEVICES_JSON = path.resolve(__dirname, "../devices.json");

import { CONFIG } from "../config.mjs";

const REGIONS = ["eu", "us", "cn", "in"];

function regionFromHost(host) {
  const m = host?.match(/openapi\.tuya(\w+)\.com/);
  return m ? m[1] : "eu";
}

function regionToUrl(region) {
  return `https://openapi.tuya${region}.com`;
}

async function fetchDevicesFromApi(apiKey, apiSecret, deviceId) {
  const region = regionFromHost(CONFIG.host);
  const regionsToTry = region ? [region] : REGIONS;

  let userId;
  let foundRegion;

  for (const r of regionsToTry) {
    try {
      const api = new TuyaContext({
        baseUrl: regionToUrl(r),
        accessKey: apiKey,
        secretKey: apiSecret,
      });
      const result = await api.request({
        method: "GET",
        path: `/v1.0/devices/${deviceId}`,
      });
      if (result?.success && result?.result?.uid) {
        userId = result.result.uid;
        foundRegion = r;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!userId || !foundRegion) {
    throw new Error(
      `Could not get user ID from device ${deviceId}. Ensure the device exists and your Tuya app account is linked to the project.`
    );
  }

  const api = new TuyaContext({
    baseUrl: regionToUrl(foundRegion),
    accessKey: apiKey,
    secretKey: apiSecret,
  });
  const result = await api.request({
    method: "GET",
    path: `/v1.0/users/${userId}/devices`,
  });

  if (!result?.success || !result?.result) {
    throw new Error("Could not fetch user devices.");
  }

  return transformToWizardFormat(result.result);
}

function transformToWizardFormat(devices) {
  const groupedDevices = {};
  for (const device of devices) {
    if (device.node_id) {
      const gatewayKey = device.local_key;
      if (!groupedDevices[gatewayKey]?.subDevices) {
        groupedDevices[gatewayKey] = {
          ...groupedDevices[gatewayKey],
          subDevices: [],
        };
      }
      groupedDevices[gatewayKey].subDevices.push(device);
    } else {
      groupedDevices[device.local_key] = {
        ...device,
        ...groupedDevices[device.local_key],
      };
    }
  }

  return Object.values(groupedDevices).map((device) => {
    const pretty = {
      name: device.name,
      id: device.id,
      key: device.local_key,
    };
    if (device.subDevices?.length) {
      pretty.subDevices = device.subDevices.map((sub) => ({
        name: sub.name,
        id: sub.id,
        cid: sub.node_id,
      }));
    }
    return pretty;
  });
}

function parseInput(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Empty input. Paste or pipe the wizard JSON output.");
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      const JSON5 = require("json5");
      return JSON5.parse(trimmed);
    } catch (e) {
      throw new Error(
        `Could not parse input. Copy the full array from the wizard. ${e.message}`
      );
    }
  }
}

function normalizeDevice(device) {
  if (!device || typeof device !== "object") return null;
  const out = {
    name: device.name ?? "",
    id: device.id ?? "",
    key: device.key ?? device.local_key ?? "",
  };
  if (Array.isArray(device.subDevices) && device.subDevices.length > 0) {
    out.subDevices = device.subDevices.map((sub) => ({
      name: sub.name ?? "",
      id: sub.id ?? "",
      cid: sub.cid ?? sub.node_id ?? "",
    }));
  }
  return out;
}

async function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => resolve(chunks.join("")));
    process.stdin.on("error", reject);
  });
}

async function main() {
  const apiKey = CONFIG.accessId;
  const apiSecret = CONFIG.accessSecret;
  const deviceId =
    process.env.TUYA_TEST_DEVICE || CONFIG.testDevice || "bf807d66c695d6109fh7hg";

  let devices;

  if (apiKey && apiSecret) {
    try {
      console.log("Fetching devices from Tuya API...");
      devices = await fetchDevicesFromApi(apiKey, apiSecret, deviceId);
    } catch (err) {
      const arg = process.argv[2];
      const filePath = arg && arg !== "-" && (path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg));
      if (filePath && fs.existsSync(filePath)) {
        console.error(err.message);
        console.error("Falling back to file:", arg);
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = parseInput(raw);
        devices = (Array.isArray(parsed) ? parsed : []).map(normalizeDevice).filter((d) => d && d.id);
      } else if (!process.stdin.isTTY) {
        console.error(err.message);
        console.error("Falling back to stdin...");
        const raw = await readStdin();
        const parsed = parseInput(raw);
        devices = (Array.isArray(parsed) ? parsed : []).map(normalizeDevice).filter((d) => d && d.id);
      } else {
        console.error(err.message);
        console.error("Run: npx @tuyapi/cli wizard, then: npm run sync-devices -- wizard-output.txt");
        process.exit(1);
      }
    }
  } else {
    let raw;
    const arg = process.argv[2];

    if (arg && arg !== "-") {
      const filePath = path.isAbsolute(arg)
        ? arg
        : path.resolve(process.cwd(), arg);
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }
      raw = fs.readFileSync(filePath, "utf8");
    } else {
      if (process.stdin.isTTY) {
        console.error(
          "Missing TUYA_ACCESS_ID or TUYA_ACCESS_SECRET. Set in .env or config.mjs."
        );
        console.error("Or paste wizard output and press Ctrl+D.");
        process.exit(1);
      }
      raw = await readStdin();
    }

    const parsed = parseInput(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Expected a JSON array of devices.");
    }
    devices = parsed.map(normalizeDevice).filter((d) => d && d.id);
  }

  if (!devices?.length) {
    throw new Error("No valid devices found.");
  }

  fs.writeFileSync(DEVICES_JSON, JSON.stringify(devices, null, 2), "utf8");
  console.log(`Updated ${DEVICES_JSON} with ${devices.length} devices.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
