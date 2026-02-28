import { createRequire } from "module";
import CONFIG from "../config.mjs";

const require = createRequire(import.meta.url);
const { TuyaContext } = require("@tuya/tuya-connector-nodejs");

const deviceId = "bf40afda6fccac02f3gehv";
const commands = [{ PowerOn: "PowerOn" }];

try {
    const baseUrl = CONFIG.host?.replace(/\/$/, "") || "https://openapi.tuyaeu.com";
    const api = new TuyaContext({
        baseUrl,
        accessKey: CONFIG.accessId,
        secretKey: CONFIG.accessSecret,
    });

    const res = await api.request({
        method: "POST",
        path: `/v1.0/devices/${deviceId}/commands`,
        body: { commands },
    });
    console.log(res?.success);
} catch (error) {
    console.log(error);
}

process.exit();
