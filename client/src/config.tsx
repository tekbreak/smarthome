/** Resolve WebSocket URL: same host when on dev (LAN/emulator), else env, else default */
function getWebSocketUrl(): string {
  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    // Use same host for WebSocket when on local dev (emulator 10.0.2.2, localhost, or LAN IP)
    if (host === "10.0.2.2" || host === "localhost" || host === "127.0.0.1") {
      return `ws://${host}:8001`;
    }
    // Private IP ranges: 10.x, 192.168.x, 172.16-31.x
    if (/^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) {
      return `ws://${host}:8001`;
    }
  }
  const env = import.meta.env.VITE_WEBSOCKET_URL;
  if (env) return env;
  return "wss://localhost:8001";
}

export default {
  get websocket() {
    return getWebSocketUrl();
  },
  fullscreen: true,
  phone: {
    people: [
      {
        name: "Papá",
        id: "papa",
        phone: "610200425",
      },
      {
        name: "Mamá",
        id: "papa",
        phone: "635427138",
      },
      {
        name: "Abuelo Paco",
        id: "papa",
        phone: "629119984",
      },
      {
        name: "Abuela Capi",
        id: "papa",
        phone: "696936244",
      },
    ],
  },
  volume: {
    day: 0.5,
    night: 0.05,
  },
  light: {
    day: 1,
    night: 0.4,
  },
};
