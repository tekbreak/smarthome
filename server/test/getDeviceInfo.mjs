import { createRequire } from "module";
import CONFIG from "../config.mjs";

const require = createRequire(import.meta.url);
const { TuyaContext } = require("@tuya/tuya-connector-nodejs");

const [_n, _f, ...deviceIds] = process.argv;

const output = (data) => {};

if (!deviceIds.length) {
    output({ success: false });
}

const baseUrl = CONFIG.host?.replace(/\/$/, "") || "https://openapi.tuyaeu.com";
const api = new TuyaContext({
    baseUrl,
    accessKey: CONFIG.accessId,
    secretKey: CONFIG.accessSecret,
});

const results = {};

for (let i = 0; i < deviceIds.length; i++) {
    const deviceId = deviceIds[i];

    try {
        const res = await api.request({
            method: "GET",
            path: `/v1.0/devices/${deviceId}/specifications`,
        });
        const data = res?.result ?? {};

        results[deviceId] = {
            name: data.name,
            online: data.online,
            status: data.status,
            icon: data.icon,
        };
    } catch (error) {
        results[deviceId] = { error: error?.message || String(error) };
    }
}

console.log(JSON.stringify(results));
process.exit();
