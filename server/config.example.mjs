/**
 * Copy this file to config.mjs.
 * Set TUYA_ACCESS_ID, TUYA_ACCESS_SECRET, TUYA_HOST in .env (see .env.example).
 */
import "dotenv/config";

export default {
  host: process.env.TUYA_HOST || "https://openapi.tuyaeu.com",
  accessId: process.env.TUYA_ACCESS_ID || "",
  accessSecret: process.env.TUYA_ACCESS_SECRET || "",
  testDevice: process.env.TUYA_TEST_DEVICE || "",
};
