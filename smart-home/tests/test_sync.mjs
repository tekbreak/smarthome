import { createRequire } from "module";
import { CONFIG } from "../config.mjs";

const require = createRequire(import.meta.url);
const { TuyaContext } = require("@tuya/tuya-connector-nodejs");

let getDeviceInfo = async (deviceId, subDeviceId) => {
    const baseUrl = CONFIG.host?.replace(/\/$/, "") || "https://openapi.tuyaeu.com";
    const api = new TuyaContext({
        baseUrl,
        accessKey: CONFIG.accessId,
        secretKey: CONFIG.accessSecret,
    });

    const res = await api.request({
        method: "GET",
        path: `/v1.0/devices/${deviceId}`,
    });
    console.log("success:", res?.result);
};

getDeviceInfo("bfaea888e03b775351rwqm");
