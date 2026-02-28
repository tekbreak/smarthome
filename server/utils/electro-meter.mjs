import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import fs from "fs";
import { broadcast } from "./index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ELECTRO_FILE = path.join(__dirname, "..", "data", "electro.json");
const ELECTRO_SCRIPT = path.join(__dirname, "..", "tools", "electro-meter", "venv", "bin", "python");
const ELECTRO_APP = path.join(__dirname, "..", "tools", "electro-meter", "app.py");

const getStored = () => {
  try {
    return JSON.parse(fs.readFileSync(ELECTRO_FILE, { encoding: "utf-8" }));
  } catch {
    return { lastUpdated: 0 };
  }
};

export const sendElectroMeter = async (wss) => {
    const meter = await getElectroMeter();
    broadcast(wss, {type: 'electro-meter', 'payload': meter})
}
export const getElectroMeter = async () => {
    const requestTime = 10 * 60 * 60; // 10 min cache
    const now = Date.now();

    try {
        const stored = getStored();

        if (stored.lastUpdated + requestTime > now) {
            return stored;
        }

        const electro = JSON.parse(
          execSync(`"${ELECTRO_SCRIPT}" "${ELECTRO_APP}"`, { encoding: "utf8" })
        );

        const output = {
            lastUpdated: now,
            electro: {
                power: electro.potenciaActual,
                percent: parseFloat(electro.percent),
                total: parseFloat(electro.totalizador)
            }
        }

        fs.writeFileSync(ELECTRO_FILE, JSON.stringify(output));

        return output;
    } catch (error) {
        console.error(error)
        return {
            lastUpdated: now,
            electro: {
                power: 0,
                percent: 0,
                total: 0
            }
        }

    }
}
