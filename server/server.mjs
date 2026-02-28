import { createServer as createHttpsServer } from "https";
import { createServer as createHttpServer } from "http";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import WebSocket, { WebSocketServer } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
import {
  startRecurrentBroadcast,
  sendCommands,
  sendDevicesUpdate,
  sendWeatherUpdate,
  initialBroadcast,
  mergeDeviceStatus,
  getDevicesMessage,
  broadcast,
} from "./utils/index.mjs";
import { sendElectroMeter } from "./utils/electro-meter.mjs";

const MESSAGE_TYPES = {
  alert: { forward: true },
  "device:list": { forward: false },
  "device:status": {},
  "device:switch": {},
  dim: { forward: true },
};

// Use HTTP (ws://) for local dev when WS_INSECURE=1 or certs missing - avoids SSL issues
const useInsecure = process.env.WS_INSECURE === "1";
const certPath = path.resolve(projectRoot, process.env.SSL_CERT_PATH || "server.pem");
const keyPath = path.resolve(projectRoot, process.env.SSL_KEY_PATH || "server.key");
const certsExist = existsSync(certPath) && existsSync(keyPath);

let server;
let useHttps = false;
if (useInsecure || !certsExist) {
  if (!useInsecure && !certsExist) {
    console.log("[WSS] No server.pem/server.key found - using HTTP (ws://) for local dev");
  }
  server = createHttpServer();
} else {
  server = createHttpsServer({
    cert: readFileSync(certPath),
    key: readFileSync(keyPath),
  });
  useHttps = true;
}

const wss = new WebSocketServer({ server });

const log = (msg, ...args) => {
  const ts = new Date().toISOString();
  console.log(`[WSS ${ts}] ${msg}`, ...args);
};

// Broadcast data recurrently to all clients
await startRecurrentBroadcast(wss);

wss.on("connection", async (ws, req) => {
  const clientCount = wss.clients.size;
  log("Client connected", `(total: ${clientCount})`, req.socket.remoteAddress || "");

  await initialBroadcast(ws, wss);
  log("Initial broadcast sent to new client");

  ws.on("message", async function message(json, isBinary) {
    let data;
    try {
      data = JSON.parse(json);
    } catch (_) {
      log("Invalid JSON received:", String(json).slice(0, 100));
      return;
    }

    const { type, payload } = data;
    if (!type) {
      log("Message missing type:", JSON.stringify(data).slice(0, 100));
      return;
    }

    log("Received:", type, payload ? JSON.stringify(payload).slice(0, 80) : "");

    const typeConfig = MESSAGE_TYPES[type];

    if (payload?.forward || typeConfig?.forward) {
      const forwarded = [...wss.clients].filter((c) => c !== ws && c.readyState === WebSocket.OPEN).length;
      wss?.clients?.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(json, { binary: isBinary });
        }
      });
      log("Forwarded", type, `to ${forwarded} client(s)`);
    }

    if (type === "device:switch") {
      const { id } = payload;
      const commands =
        payload.commands ??
        (payload.code != null ? [{ code: payload.code, value: payload.value }] : []);
      if (id && commands.length) {
        log("Executing device:switch", { id, commands });
        await sendCommands(id, commands);
        await sendDevicesUpdate(wss);
      }
    }

    if (type === "device:status") {
      const { id, status } = payload;
      if (id && status) {
        mergeDeviceStatus(id, status);
        const msg = await getDevicesMessage();
        broadcast(wss, msg);
        log("Merged device:status and broadcast device:list");
      }
    }
  });

  ws.on("close", (code, reason) => {
    log("Client disconnected", `(code: ${code}, reason: ${reason || "none"})`, `(remaining: ${wss.clients.size})`);
  });

  ws.on("error", (error) => {
    log("Client error:", error.message);
  });
});

const PORT = process.env.PORT || 8001;
const protocol = useHttps ? "wss" : "ws";
server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT} (${protocol}://localhost:${PORT})`);
});
