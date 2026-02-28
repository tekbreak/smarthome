import WebSocket from "ws";
import { getDevicesMessage, sendDevicesUpdate } from "./devices.utils.mjs";
import { getWeatherMessage, sendWeatherUpdate } from "./weather-utils.mjs";
import { sendElectroMeter } from "./electro-meter.mjs";

export * from "./devices.utils.mjs";
export * from "./weather-utils.mjs";

/** Strip base64 icons from device:list to keep payload small (icons can be 1–3MB total). */
const stripIconsFromDeviceList = (msg) => {
  if (msg?.type !== "device:list" || !Array.isArray(msg?.payload)) return msg;
  return {
    type: "device:list",
    payload: msg.payload.map(({ icon, ...rest }) => rest),
  };
};

export const initialBroadcast = async (wsClient, wss) => {
  // Send immediately so client gets data before it disconnects. getDevicesMessage()
  // can take 20–60s (Tuya API per device), so we send empty device:list + weather
  // right away, then push the real device list when ready.
  let weatherMsg;
  try {
    weatherMsg = await getWeatherMessage();
  } catch (err) {
    console.error("[WSS] getWeatherMessage failed:", err?.message || err);
    weatherMsg = { type: "weather", payload: { lastUpdate: 0, weather: [] } };
  }

  const deviceMsgPlaceholder = { type: "device:list", payload: [] };
  const messages = [deviceMsgPlaceholder, weatherMsg];

  if (wsClient?.readyState === WebSocket.OPEN) {
    messages.forEach((message) => {
      const type = message?.type || "unknown";
      const sent = sendMessageToClient(wsClient, message);
      console.log(`[WSS ${new Date().toISOString()}] Initial broadcast ${type} to new client${sent ? "" : " (FAILED)"}`);
    });
  } else {
    console.error("[WSS] Client closed before initial broadcast, readyState:", wsClient?.readyState);
  }

  // Fetch real device data in background and broadcast to all connected clients
  getDevicesMessage()
    .then((msg) => {
      const stripped = stripIconsFromDeviceList(msg) ?? msg;
      if (wss) {
        broadcast(wss, stripped);
      }
    })
    .catch((err) => {
      console.error("[WSS] getDevicesMessage (background) failed:", err?.message || err);
    });
};

export const startRecurrentBroadcast = (wss) => {
  // Send updated data every 2 minutes
  setInterval(
    async () => {
      await sendDevicesUpdate(wss);
      await sendWeatherUpdate(wss);
    },
    2 * 60 * 1000,
  );

  // Send updated data every 5 minutes
  setInterval(
    async () => {
      await sendElectroMeter(wss);
    },
    5 * 60 * 1000,
  );
};

export const broadcast = (wss, data) => {
  if (!wss || !data) {
    return;
  }

  const toSend = data?.type === "device:list" ? stripIconsFromDeviceList(data) : data;
  const type = toSend?.type || "unknown";
  const count = [...(wss?.clients || [])].filter((c) => c.readyState === 1).length;
  console.log(`[WSS ${new Date().toISOString()}] Broadcast ${type} to ${count} client(s)`);

  wss?.clients?.forEach(function each(client) {
    sendMessageToClient(client, toSend);
  });
};

const stringify = (data) => {
  try {
    return typeof data === "string" ? data : JSON.stringify(data);
  } catch (error) {
    console.error("[WSS] JSON.stringify failed:", error?.message, "type:", data?.type);
    return undefined;
  }
};

const sendMessageToClient = (client, message) => {
  const stringifiedMessage = stringify(message);

  if (!stringifiedMessage) {
    console.error("[WSS] Failed to stringify message:", message?.type);
    return false;
  }

  if (client?.readyState !== WebSocket.OPEN) {
    console.error("[WSS] Client not OPEN, readyState:", client?.readyState, "message:", message?.type);
    return false;
  }

  try {
    const size = Buffer.byteLength(stringifiedMessage, "utf8");
    client.send(stringifiedMessage, { binary: false }, (err) => {
      if (err) console.error("[WSS] client.send callback error:", err?.message, "type:", message?.type);
    });
    if (message?.type === "device:list") {
      console.log("[WSS] device:list sent, payload size:", (size / 1024).toFixed(1), "KB");
    }
    return true;
  } catch (err) {
    console.error("[WSS] client.send threw:", err?.message, "type:", message?.type);
    return false;
  }
};
