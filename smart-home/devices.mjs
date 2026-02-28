import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const devicesPath = join(__dirname, "devices.json");

export const DEVICES = JSON.parse(readFileSync(devicesPath, "utf8"));
