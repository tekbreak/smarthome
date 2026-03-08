import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Load project root .env (single source for all env vars)
dotenv.config({ path: path.join(projectRoot, ".env") });

export default {
  host: process.env.TUYA_HOST || "https://openapi.tuyaeu.com",
  accessId: process.env.TUYA_ACCESS_ID || "",
  accessSecret: process.env.TUYA_ACCESS_SECRET || "",
  testDevice: process.env.TUYA_TEST_DEVICE || "",
};
